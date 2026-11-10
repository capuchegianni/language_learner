import { Injectable, Logger, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { ActionType, LessonExercise, User } from '../generated/prisma/client';
import { SettingsService } from '../settings/settings.service';
import { AiLlmCallerService } from './services/ai-llm-caller.service';
import { AiPromptService } from './services/ai-prompt.service';
import {
  ProposedRule,
  LessonContent,
  GradingResult,
  UserLanguages,
  UserSubmission,
} from './interfaces/ai.interfaces';
import { validateAndRepairGrading } from './schemas/grading.schema';

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
      const rawResponse = await this.llmCaller.callLlm(userId, systemPrompt, ActionType.RULE_PROPOSAL);
      const cleaned = this.llmCaller.cleanJsonResponse(rawResponse);
      const parsed = JSON.parse(cleaned);
      if (Array.isArray(parsed) && parsed.length >= count) {
        return parsed.slice(0, count);
      }
      throw new Error('AI returned an invalid or incomplete array format for rule proposals.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.error(err);
      throw new InternalServerErrorException(`Failed to generate rule proposals. Details: ${msg}`);
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
      const rawResponse = await this.llmCaller.callLlm(userId, fullPrompt, ActionType.LESSON_GENERATION);
      const cleaned = this.llmCaller.cleanJsonResponse(rawResponse);
      const parsed = JSON.parse(cleaned);

      return {
        ...parsed,
        rawPrompt,
      };
    } catch (err: unknown) {
      if (err instanceof BadRequestException) {
        throw err;
      }
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.error(err);
      throw new InternalServerErrorException(`Failed to generate lesson. Please check your AI API key and model settings. Details: ${msg}`);
    }
  }

  /**
   * Multimodal AI Grading of user answers (Text input or uploaded handwritten image).
   */
  async gradeSubmission(
    userIdOrUser: string | User,
    lesson: {
      rule?: { title: string; explanation: string } | null;
      words?: Array<{ word: { targetLanguage: string; nativeLanguage: string } }>;
    },
    exercises: LessonExercise[],
    userSubmissions: Map<number, UserSubmission>,
    imagePaths?: string[],
  ): Promise<GradingResult> {
    const userId = typeof userIdOrUser === 'string' ? userIdOrUser : userIdOrUser.id;
    const { nativeLanguage, targetLanguage } = await this.getUserLanguages(userId);
    const hasImages = !!(imagePaths && imagePaths.length > 0);
    const gradingInstructions = this.promptService.buildGradingPrompt(
      lesson,
      exercises,
      userSubmissions,
      hasImages,
      nativeLanguage,
      targetLanguage,
    );

    try {
      let rawResponse = '';

      if (hasImages) {
        rawResponse = await this.llmCaller.callLlmWithImages(
          userIdOrUser,
          gradingInstructions,
          imagePaths!,
          ActionType.LESSON_CORRECTION,
        );
      } else {
        rawResponse = await this.llmCaller.callLlm(
          userIdOrUser,
          gradingInstructions,
          ActionType.LESSON_CORRECTION,
        );
      }

      const cleaned = this.llmCaller.cleanJsonResponse(rawResponse);
      let parsed: unknown = {};
      try {
        parsed = JSON.parse(cleaned);
      } catch (parseErr: unknown) {
        const msg = parseErr instanceof Error ? parseErr.message : String(parseErr);
        this.logger.warn(
          `Initial JSON.parse failed on cleaned LLM output: ${msg}. Passing to validateAndRepairGrading.`,
        );
        parsed = cleaned;
      }
      return validateAndRepairGrading(parsed);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.error(err);
      throw new InternalServerErrorException(`Failed to grade submission. Please check your AI API configuration. Details: ${msg}`);
    }
  }

  /**
   * Fetches the user's configured native and target languages from settings.
   * Defaults to English -> Korean if not configured.
   */
  async getUserLanguages(userId: string): Promise<UserLanguages> {
    const settings = await this.settingsService.getSettings(userId, [
      'NATIVE_LANGUAGE',
      'TARGET_LANGUAGE',
    ]);
    return {
      nativeLanguage: settings['NATIVE_LANGUAGE'],
      targetLanguage: settings['TARGET_LANGUAGE'],
    };
  }
}
