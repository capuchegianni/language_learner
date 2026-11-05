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
    for (let i = 0; i <= retries; i++) {
      try {
        const response = await client.chat.completions.create({
          model,
          messages: [{ role: 'user', content: prompt }],
        });
        return response.choices[0]?.message?.content || '';
      } catch (err: any) {
        if (err?.status === 429 && i < retries) {
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

    const contentParts: any[] = [{ type: 'text', text: prompt }];

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
        });
        return response.choices[0]?.message?.content || '';
      } catch (err: any) {
        if (err?.status === 429 && i < retries) {
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
    let clean = raw.trim();
    if (clean.startsWith('```json')) {
      clean = clean.replace(/^```json/, '').replace(/```$/, '').trim();
    } else if (clean.startsWith('```')) {
      clean = clean.replace(/^```/, '').replace(/```$/, '').trim();
    }
    return clean;
  }
}
