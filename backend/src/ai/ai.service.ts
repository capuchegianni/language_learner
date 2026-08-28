import { Injectable, Logger, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { SettingsService } from '../settings/settings.service';
import { AiLlmCallerService } from './services/ai-llm-caller.service';
import { AiPromptService } from './services/ai-prompt.service';
import {
  ProposedRule,
  LessonContent,
  GradingResult,
  UserLanguages,
} from './interfaces/ai.interfaces';

export * from './interfaces/ai.interfaces';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(
    private readonly settingsService: SettingsService,
    private readonly llmCaller: AiLlmCallerService,
    private readonly promptService: AiPromptService,
  ) {}

  /**
   * Helper to format prompt template according to user specification.
   */
  public buildPromptTemplate(
    ruleTitle: string,
    wordsCount: number,
    knownWordsList: string[],
    knownRulesList: string[],
    nativeLanguage: string,
    targetLanguage: string,
  ): string {
    return this.promptService.buildPromptTemplate(
      ruleTitle,
      wordsCount,
      knownWordsList,
      knownRulesList,
      nativeLanguage,
      targetLanguage,
    );
  }

  /**
   * Proposes NEW rules/expressions for the target language that are NOT yet in knownRules.
   */
  async proposeRules(
    userId: string,
    knownRulesList: string[],
    count: number = 3,
    excludeRulesList: string[] = [],
  ): Promise<ProposedRule[]> {
    if (count <= 0) return [];
    const { nativeLanguage, targetLanguage } = await this.getUserLanguages(userId);
    const systemPrompt = this.promptService.buildRuleProposalsPrompt(
      knownRulesList,
      count,
      excludeRulesList,
      nativeLanguage,
      targetLanguage,
    );

    try {
      const rawResponse = await this.llmCaller.callLlm(userId, systemPrompt);
      const cleaned = this.llmCaller.cleanJsonResponse(rawResponse);
      const parsed = JSON.parse(cleaned);
      if (Array.isArray(parsed) && parsed.length >= count) {
        return parsed.slice(0, count);
      }
      throw new Error('AI returned an invalid or incomplete array format for rule proposals.');
    } catch (err: any) {
      this.logger.error(`Error generating rule proposals from LLM: ${err.message}`);
      throw new InternalServerErrorException(`Failed to generate rule proposals. Details: ${err.message}`);
    }
  }

  /**
   * Generates full structured lesson based on the exact prompt architecture.
   */
  async generateLesson(
    userId: string,
    ruleTitle: string,
    wordsCount: number,
    knownWordsList: string[],
    knownRulesList: string[],
  ): Promise<LessonContent> {
    const { nativeLanguage, targetLanguage } = await this.getUserLanguages(userId);
    const rawPrompt = this.promptService.buildPromptTemplate(
      ruleTitle,
      wordsCount,
      knownWordsList,
      knownRulesList,
      nativeLanguage,
      targetLanguage,
    );

    const systemInstructions = this.promptService.buildLessonGenerationPrompt(
      ruleTitle,
      wordsCount,
      nativeLanguage,
      targetLanguage,
    );

    try {
      const fullPrompt = `${systemInstructions}\n\nUSER PROMPT:\n${rawPrompt}`;
      const rawResponse = await this.llmCaller.callLlm(userId, fullPrompt);
      const cleaned = this.llmCaller.cleanJsonResponse(rawResponse);
      const parsed = JSON.parse(cleaned);
      if (parsed.error) {
        throw new BadRequestException(parsed.error);
      }
      return {
        ...parsed,
        rawPrompt,
      };
    } catch (err: any) {
      if (err instanceof BadRequestException) {
        throw err;
      }
      this.logger.error(`Failed to generate lesson from AI API: ${err.message}`);
      throw new InternalServerErrorException(`Failed to generate lesson. Please check your AI API key and model settings. Details: ${err.message}`);
    }
  }

  /**
   * Multimodal AI Grading of user answers (Text input or uploaded handwritten image).
   */
  async gradeSubmission(
    userId: string,
    lessonData: LessonContent,
    userAnswersText: { ex1?: string; ex2?: string; ex3?: string },
    imagePaths?: string[],
  ): Promise<GradingResult> {
    const { nativeLanguage, targetLanguage } = await this.getUserLanguages(userId);
    const hasImages = !!(imagePaths && imagePaths.length > 0);
    const gradingInstructions = this.promptService.buildGradingPrompt(
      lessonData,
      userAnswersText,
      hasImages,
      nativeLanguage,
      targetLanguage,
    );

    try {
      let rawResponse = '';

      if (hasImages) {
        rawResponse = await this.llmCaller.callLlmWithImages(userId, gradingInstructions, imagePaths!);
      } else {
        rawResponse = await this.llmCaller.callLlm(userId, gradingInstructions);
      }

      const cleaned = this.llmCaller.cleanJsonResponse(rawResponse);
      return JSON.parse(cleaned);
    } catch (err: any) {
      this.logger.error(`Error grading submission via AI API: ${err.message}`);
      throw new InternalServerErrorException(`Failed to grade submission. Please check your AI API configuration. Details: ${err.message}`);
    }
  }

  /**
   * Fetches the user's configured native and target languages from settings.
   * Defaults to English -> Korean if not configured.
   */
  async getUserLanguages(userId: string): Promise<UserLanguages> {
    let nativeLanguage = 'English';
    let targetLanguage = 'Korean';
    try {
      nativeLanguage = await this.settingsService.getSetting(userId, 'NATIVE_LANGUAGE');
    } catch {
      // Not set yet, use default
    }
    try {
      targetLanguage = await this.settingsService.getSetting(userId, 'TARGET_LANGUAGE');
    } catch {
      // Not set yet, use default
    }
    return { nativeLanguage, targetLanguage };
  }
}
