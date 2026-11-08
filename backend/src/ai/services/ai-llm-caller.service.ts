import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { SettingsService } from '../../settings/settings.service';
import { ActionType, Plan } from '../../generated/prisma/client';
import {
  GEMINI_BASE_URL,
  PLAN_MODELS,
} from '../../usage/usage.constants';
import OpenAI from 'openai';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class AiLlmCallerService {
  private readonly logger = new Logger(AiLlmCallerService.name);

  constructor(
    private readonly settingsService: SettingsService,
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Creates an OpenAI client configured for the given user and task.
   * If isCustom is true, uses the user's custom settings (model, baseURL, API key).
   * Otherwise, uses the server-side Gemini configuration based on the user's plan.
   */
  async getClient(
    userId: string,
    taskType: ActionType = ActionType.LESSON_GENERATION,
  ): Promise<{ client: OpenAI; model: string }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true, isCustom: true },
    });

    const isCustom = user?.isCustom ?? false;

    if (isCustom) {
      const [model, baseURL] = await Promise.all([
        this.settingsService.getSetting(userId, 'AI_MODEL'),
        this.settingsService.getSetting(userId, 'AI_BASE_URL'),
      ]);

      const apiKey = this.isLocalOllamaBaseURL(baseURL)
        ? 'ollama'
        : await this.settingsService.getSetting(userId, 'api_key');

      const client = new OpenAI({
        apiKey,
        baseURL,
      });

      return { client, model };
    }

    const plan: Plan = user?.plan || Plan.FREE;
    const apiKey =
      plan === Plan.PREMIUM
        ? (this.configService.get<string>('GEMINI_PREMIUM_API_KEY') ||
           this.configService.get<string>('GEMINI_API_KEY'))
        : this.configService.get<string>('GEMINI_API_KEY');

    if (!apiKey) {
      throw new InternalServerErrorException(
        `Server configuration error: Gemini API key for ${plan} plan is not configured.`,
      );
    }

    const baseURL = GEMINI_BASE_URL;
    const model = PLAN_MODELS[plan][taskType];

    const client = new OpenAI({
      apiKey,
      baseURL,
    });

    return { client, model };
  }

  private isLocalOllamaBaseURL(baseURL: string): boolean {
    return /(^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0):11434\/v1$)|ollama/i.test(baseURL);
  }

  private isUnsupportedResponseFormatError(err: unknown): boolean {
    if (!err || typeof err !== 'object') return false;
    const errorObj = err as Record<string, unknown>;
    const status =
      (typeof errorObj.status === 'number' ? errorObj.status : undefined) ||
      (typeof errorObj.statusCode === 'number' ? errorObj.statusCode : undefined) ||
      (errorObj.response && typeof errorObj.response === 'object' && typeof (errorObj.response as Record<string, unknown>).status === 'number'
        ? ((errorObj.response as Record<string, unknown>).status as number)
        : undefined);
    const message = (
      typeof errorObj.message === 'string'
        ? errorObj.message
        : JSON.stringify(errorObj.message || errorObj.error || '')
    ).toLowerCase();

    return (
      status === 400 ||
      status === 422 ||
      message.includes('response_format') ||
      message.includes('json_object') ||
      message.includes('unsupported parameter') ||
      message.includes('unsupported_parameter') ||
      message.includes('unknown parameter') ||
      message.includes('unrecognized request argument')
    );
  }

  private getBackoffDelayWithJitter(attempt: number, baseMs = 1000, maxJitterMs = 500): number {
    const exponentialDelay = (2 ** attempt) * baseMs;
    const jitter = Math.floor(Math.random() * maxJitterMs);
    return exponentialDelay + jitter;
  }

  /**
   * Calls the LLM using a text-only prompt via the configured OpenAI-compatible client.
   */
  async callLlm(
    userId: string,
    prompt: string,
    taskType: ActionType = ActionType.LESSON_GENERATION,
    retries = 2,
  ): Promise<string> {
    const { client, model } = await this.getClient(userId, taskType);
    let useJsonFormat = true;

    for (let i = 0; i <= retries; i++) {
      try {
        const response = await client.chat.completions.create({
          model,
          messages: [{ role: 'user', content: prompt }],
          ...(useJsonFormat ? { response_format: { type: 'json_object' } } : {}),
        });
        return response.choices[0]?.message?.content || '';
      } catch (err: unknown) {
        const errorObj = err && typeof err === 'object' ? (err as Record<string, unknown>) : {};
        const errorMessage = typeof errorObj.message === 'string' ? errorObj.message : String(err);
        if (useJsonFormat && this.isUnsupportedResponseFormatError(err)) {
          this.logger.warn(
            `Provider rejected response_format: { type: 'json_object' } (${errorMessage}). Retrying without response_format...`,
          );
          useJsonFormat = false;
          i--;
          continue;
        }

        if (errorObj.status === 429 && i < retries) {
          const delayMs = this.getBackoffDelayWithJitter(i);
          this.logger.warn(`Rate limit 429 hit. Retrying in ${(delayMs / 1000).toFixed(2)} seconds...`);
          await new Promise((resolve) => setTimeout(resolve, delayMs));
        } else {
          throw err;
        }
      }
    }
    return '';
  }

  /**
   * Calls the LLM with an image attached (vision).
   */
  async callLlmWithImages(
    userId: string,
    prompt: string,
    imagePaths: string[],
    taskType: ActionType = ActionType.LESSON_CORRECTION,
    retries = 2,
  ): Promise<string> {
    const { client, model } = await this.getClient(userId, taskType);

    const contentParts: OpenAI.Chat.Completions.ChatCompletionContentPart[] = [
      { type: 'text', text: prompt },
    ];

    for (const imagePath of imagePaths) {
      if (fs.existsSync(imagePath)) {
        const imageBuffer = fs.readFileSync(imagePath);
        const base64Image = imageBuffer.toString('base64');
        const mimeType = path.extname(imagePath).toLowerCase() === '.png' ? 'image/png' : 'image/jpeg';
        contentParts.push({
          type: 'image_url',
          image_url: { url: `data:${mimeType};base64,${base64Image}` },
        });
      }
    }

    let useJsonFormat = true;

    for (let i = 0; i <= retries; i++) {
      try {
        const response = await client.chat.completions.create({
          model,
          messages: [
            {
              role: 'user',
              content: contentParts,
            },
          ],
          ...(useJsonFormat ? { response_format: { type: 'json_object' } } : {}),
        });
        return response.choices[0]?.message?.content || '';
      } catch (err: unknown) {
        const errorObj = err && typeof err === 'object' ? (err as Record<string, unknown>) : {};
        const errorMessage = typeof errorObj.message === 'string' ? errorObj.message : String(err);
        if (useJsonFormat && this.isUnsupportedResponseFormatError(err)) {
          this.logger.warn(
            `Provider rejected response_format: { type: 'json_object' } on vision call (${errorMessage}). Retrying without response_format...`,
          );
          useJsonFormat = false;
          i--;
          continue;
        }

        if (errorObj.status === 429 && i < retries) {
          const delayMs = this.getBackoffDelayWithJitter(i);
          this.logger.warn(`Rate limit 429 hit (vision). Retrying in ${(delayMs / 1000).toFixed(2)} seconds...`);
          await new Promise((resolve) => setTimeout(resolve, delayMs));
        } else {
          throw err;
        }
      }
    }
    return '';
  }

  cleanJsonResponse(raw: string): string {
    if (!raw) return '';
    let text = raw.trim();

    // 1. Isolate content inside markdown code block if present
    const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (codeBlockMatch && codeBlockMatch[1]) {
      text = codeBlockMatch[1].trim();
    }

    // 2. Identify outermost JSON boundaries ({...} or [...])
    const extractOutermost = (str: string): string | null => {
      const firstBrace = str.indexOf('{');
      const firstBracket = str.indexOf('[');

      let startIdx = -1;
      let endIdx = -1;

      if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
        const lastBrace = str.lastIndexOf('}');
        if (lastBrace > firstBrace) {
          startIdx = firstBrace;
          endIdx = lastBrace + 1;
        }
      } else if (firstBracket !== -1 && (firstBrace === -1 || firstBracket < firstBrace)) {
        const lastBracket = str.lastIndexOf(']');
        if (lastBracket > firstBracket) {
          startIdx = firstBracket;
          endIdx = lastBracket + 1;
        }
      }

      if (startIdx !== -1 && endIdx !== -1) {
        return str.substring(startIdx, endIdx).trim();
      }
      return null;
    };

    const extracted = extractOutermost(text);
    if (extracted) {
      return extracted;
    }

    if (text !== raw.trim()) {
      const rawExtracted = extractOutermost(raw.trim());
      if (rawExtracted) {
        return rawExtracted;
      }
    }

    return text;
  }
}
