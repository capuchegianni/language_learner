import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { SettingsService } from '../settings/settings.service';
import OpenAI from 'openai';
import * as fs from 'fs';
import * as path from 'path';

export interface ProposedRule {
  title: string;
  category: string;
  briefExplanation: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}

export interface LessonContent {
  rule: {
    title: string;
    explanation: string;
    examples: Array<{ korean: string; english: string; explanation?: string }>;
    exceptions?: string;
  };
  newWords: Array<{
    korean: string;
    english: string;
    pronunciation?: string;
    partOfSpeech?: string;
  }>;
  exercise1: {
    instruction: string;
    targetWords: string[];
    sampleWords: string[];
  };
  exercise2: {
    instruction: string;
    sentencesToTranslate: string[]; // 3 English sentences
  };
  exercise3: {
    instruction: string;
    englishTextToTranslate: string; // 30-50 word story
  };
  rawPrompt: string;
}

export interface GradingResult {
  overallScore: number; // 0-100
  generalFeedback: string;
  exercise1: {
    score: number;
    corrections: string[];
    feedback: string;
  };
  exercise2: {
    score: number;
    corrections: string[];
    feedback: string;
  };
  exercise3: {
    score: number;
    corrections: string[];
    feedback: string;
  };
  handwrittenOcrText?: string;
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(private settingsService: SettingsService) {}

  /**
   * Creates an OpenAI client configured with the user's base URL and API key.
   * This works with any OpenAI-compatible provider (OpenAI, Gemini, Groq, Mistral, etc.).
   */
  private async getClient(): Promise<{ client: OpenAI; model: string }> {
    const [model, baseURL, apiKey] = await Promise.all([
      this.settingsService.getSetting('AI_MODEL'),
      this.settingsService.getSetting('AI_BASE_URL'),
      this.settingsService.getSetting('API_KEY'),
    ]);

    const client = new OpenAI({
      apiKey: apiKey,
      baseURL: baseURL,
    });

    return { client, model };
  }

  /**
   * Helper to format prompt template according to user specification.
   */
  public buildPromptTemplate(
    ruleTitle: string,
    wordsCount: number,
    knownWordsList: string[],
    knownRulesList: string[],
  ): string {
    return `Lesson architecture:
- ${wordsCount} new daily words
- daily rule with explanations, usage (examples), exceptions if any
- exercise 1: apply the rule on ${wordsCount} words (based on some of the new daily words + other words in the bank)
- exercise 2: translate 3 sentences from english to korean that use the new rule and the new vocabulary (no literal translations, use proper english, don't give the answer)
- exercise 3: translate a text from english to korean (from 30 to 50 words) that is using some of the previous rules + the new one at least once and the new vocabulary + words from the bank. The text must have a meaning and small story between the sentences and it's not mandatory to use all tenses (no literal translations, use proper english, don't give the answer)

List of known words: \`${knownWordsList.join(', ')}\`

List of known rules: \`${knownRulesList.join(', ')}\`

Today's rule -> "${ruleTitle}"`;
  }

  /**
   * Proposes NEW Korean rules/expressions that are NOT yet in knownRules.
   */
  async proposeRules(knownRulesList: string[], count: number = 3, excludeRulesList: string[] = []): Promise<ProposedRule[]> {
    const systemPrompt = `You are a Korean language learning expert curriculum planner.
Given the list of known grammar rules/expressions already learned by the student:
Known rules: [${knownRulesList.join(', ')}]
${excludeRulesList.length > 0 ? `\nAlso explicitly EXCLUDE these rules from your proposals, as they were recently proposed or rejected:\nExcluded rules: [${excludeRulesList.join(', ')}]\n` : ''}
Propose ${count} NEW, highly practical Korean grammar rules or conversational expressions suitable for the next daily lessons.
Output strictly valid JSON with no extra markdown code block delimiters or text, in the following format:
[
  {
    "title": "Rule name (e.g. ~(으)ㄹ 수 있다 / ~(으)ㄹ 수 없다)",
    "category": "Grammar / Conjugation / Expression",
    "briefExplanation": "Short 1-sentence summary of what it does",
    "difficulty": "Beginner"
  }
]`;

    try {
      const rawResponse = await this.callLlm(systemPrompt);
      const cleaned = this.cleanJsonResponse(rawResponse);
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
    ruleTitle: string,
    wordsCount: number,
    knownWordsList: string[],
    knownRulesList: string[],
  ): Promise<LessonContent> {
    const rawPrompt = this.buildPromptTemplate(ruleTitle, wordsCount, knownWordsList, knownRulesList);

    const systemInstructions = `You are a Korean language instructor AI. Respond strictly with valid JSON without markdown codeblock wrapper or outside commentary.
Follow this exact JSON structure:
{
  "rule": {
    "title": "${ruleTitle}",
    "explanation": "Clear explanation of rule usage and formation",
    "examples": [
      { "korean": "example 1", "english": "translation 1", "explanation": "optional explanation" },
      { "korean": "example 2", "english": "translation 2" }
    ],
    "exceptions": "Exceptions or nuances if applicable"
  },
  "newWords": [
    { "korean": "word1", "english": "meaning1", "pronunciation": "romaja", "partOfSpeech": "verb/noun" }
    // total ${wordsCount} items
  ],
  "exercise1": {
    "instruction": "Apply the rule on 5 words (new daily words + bank words)",
    "targetWords": ["word1", "word2", "word3", "word4", "word5"],
    "sampleWords": ["word1", "word2", "word3", "word4", "word5"]
  },
  "exercise2": {
    "instruction": "Translate 3 sentences from English to Korean (do NOT give answers)",
    "sentencesToTranslate": [
      "Sentence 1 in English...",
      "Sentence 2 in English...",
      "Sentence 3 in English..."
    ]
  },
  "exercise3": {
    "instruction": "Translate this text (30-50 words story) from English to Korean (do NOT give answers)",
    "englishTextToTranslate": "Story text in natural English using target vocabulary and grammar..."
  }
}`;

    try {
      const fullPrompt = `${systemInstructions}\n\nUSER PROMPT:\n${rawPrompt}`;
      const rawResponse = await this.callLlm(fullPrompt);
      const cleaned = this.cleanJsonResponse(rawResponse);
      const parsed = JSON.parse(cleaned);
      return {
        ...parsed,
        rawPrompt,
      };
    } catch (err) {
      this.logger.error(`Failed to generate lesson from AI API: ${err.message}`);
      throw new InternalServerErrorException(`Failed to generate lesson. Please check your AI API key and model settings. Details: ${err.message}`);
    }
  }

  /**
   * Multimodal AI Grading of user answers (Text input or uploaded handwritten image).
   * Image support works with providers that support vision (OpenAI, Gemini, etc.).
   */
  async gradeSubmission(
    lessonData: LessonContent,
    userAnswersText: { ex1?: string; ex2?: string; ex3?: string },
    imagePaths?: string[],
  ): Promise<GradingResult> {
    const gradingInstructions = `You are an expert Korean teacher grading a student's exercise submission.
Lesson Details:
Rule: ${lessonData.rule.title} (${lessonData.rule.explanation})
Target Words: ${lessonData.newWords.map((w) => `${w.korean} (${w.english})`).join(', ')}

Exercise 1 Prompt: ${lessonData.exercise1.instruction} (Target words: ${lessonData.exercise1.targetWords.join(', ')})
Exercise 2 Prompt: ${lessonData.exercise2.sentencesToTranslate.join(' | ')}
Exercise 3 Prompt: ${lessonData.exercise3.englishTextToTranslate}

Student Text Submission:
Exercise 1 Answer: ${userAnswersText.ex1 || 'N/A'}
Exercise 2 Answer: ${userAnswersText.ex2 || 'N/A'}
Exercise 3 Answer: ${userAnswersText.ex3 || 'N/A'}

${imagePaths && imagePaths.length > 0 ? 'NOTE: Images of handwritten answers are attached. Perform OCR on the handwriting first.' : ''}

Grade the student's work accurately with constructive feedback and corrections.
Return STRICT JSON format (no markdown formatting, no extra text):
{
  "overallScore": 85,
  "generalFeedback": "Encouraging overall feedback summary",
  "handwrittenOcrText": "Transcribed text if image was provided, else null",
  "exercise1": {
    "score": 90,
    "corrections": ["Correction line 1", "Correction line 2"],
    "feedback": "Feedback for Ex 1"
  },
  "exercise2": {
    "score": 80,
    "corrections": ["Sentence 1: ...", "Sentence 2: ..."],
    "feedback": "Feedback for Ex 2"
  },
  "exercise3": {
    "score": 85,
    "corrections": ["Text correction details..."],
    "feedback": "Feedback for Ex 3"
  }
}`;

    try {
      let rawResponse = '';

      if (imagePaths && imagePaths.length > 0) {
        rawResponse = await this.callLlmWithImages(gradingInstructions, imagePaths);
      } else {
        rawResponse = await this.callLlm(gradingInstructions);
      }

      const cleaned = this.cleanJsonResponse(rawResponse);
      return JSON.parse(cleaned);
    } catch (err) {
      this.logger.error(`Error grading submission via AI API: ${err.message}`);
      throw new InternalServerErrorException(`Failed to grade submission. Please check your AI API configuration. Details: ${err.message}`);
    }
  }

  /**
   * Calls the LLM using a text-only prompt via the configured OpenAI-compatible client.
   */
  private async callLlm(prompt: string, retries = 2): Promise<string> {
    const { client, model } = await this.getClient();
    for (let i = 0; i <= retries; i++) {
      try {
        const response = await client.chat.completions.create({
          model,
          messages: [{ role: 'user', content: prompt }],
        });
        return response.choices[0]?.message?.content || '';
      } catch (err: any) {
        if (err?.status === 429 && i < retries) {
          this.logger.warn(`Rate limit 429 hit. Retrying in ${2 ** i} seconds...`);
          await new Promise((resolve) => setTimeout(resolve, (2 ** i) * 1000));
        } else {
          throw err;
        }
      }
    }
    return '';
  }

  /**
   * Calls the LLM with an image attached (vision).
   * Works with any provider that supports the OpenAI vision message format.
   */
  private async callLlmWithImages(prompt: string, imagePaths: string[], retries = 2): Promise<string> {
    const { client, model } = await this.getClient();
    
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
          this.logger.warn(`Rate limit 429 hit (vision). Retrying in ${2 ** i} seconds...`);
          await new Promise((resolve) => setTimeout(resolve, (2 ** i) * 1000));
        } else {
          throw err;
        }
      }
    }
    return '';
  }

  private cleanJsonResponse(raw: string): string {
    let clean = raw.trim();
    if (clean.startsWith('```json')) {
      clean = clean.replace(/^```json/, '').replace(/```$/, '').trim();
    } else if (clean.startsWith('```')) {
      clean = clean.replace(/^```/, '').replace(/```$/, '').trim();
    }
    return clean;
  }
}
