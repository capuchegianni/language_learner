import { Injectable } from '@nestjs/common';
import { LessonContent } from '../interfaces/ai.interfaces';

@Injectable()
export class AiPromptService {
  /**
   * Helper to format prompt template according to user specification.
   */
  buildPromptTemplate(
    ruleTitle: string,
    wordsCount: number,
    knownWordsList: string[],
    knownRulesList: string[],
    nativeLanguage: string,
    targetLanguage: string,
  ): string {
    return `Lesson architecture:
- ${wordsCount} new daily words (MUST be words the student does NOT yet know — strictly NOT from the "List of known words" below)
- daily rule with explanations, usage (examples), exceptions if any
- exercise 1: apply the rule on ${wordsCount} words (based on some of the new daily words + other words in the bank)
- exercise 2: translate 3 sentences from ${nativeLanguage} to ${targetLanguage} that use the new rule and the new vocabulary (no literal translations, use proper ${nativeLanguage}, don't give the answer)
- exercise 3: translate a text from ${nativeLanguage} to ${targetLanguage} (from 30 to 50 words) that is using some of the previous rules + the new one at least once and the new vocabulary + words from the bank. The text must have a meaning and small story between the sentences and it's not mandatory to use all tenses (no literal translations, use proper ${nativeLanguage}, don't give the answer)

List of known words (DO NOT use any of these as new words): \`${knownWordsList.join(', ')}\`

List of known rules: \`${knownRulesList.join(', ')}\`

Today's rule -> "${ruleTitle}"`;
  }

  /**
   * Builds the system prompt for rule proposals.
   */
  buildRuleProposalsPrompt(
    knownRulesList: string[],
    count: number,
    excludeRulesList: string[],
    nativeLanguage: string,
    targetLanguage: string,
  ): string {
    return `You are a ${targetLanguage} language learning expert curriculum planner.
Given the list of known grammar rules/expressions already learned by the student:
Known rules: [${knownRulesList.join(', ')}]
${excludeRulesList.length > 0 ? `\nAlso explicitly EXCLUDE these rules from your proposals, as they were recently proposed or rejected:\nExcluded rules: [${excludeRulesList.join(', ')}]\n` : ''}
Propose ${count} NEW, highly practical ${targetLanguage} grammar rules or conversational expressions suitable for the next daily lessons.
Output strictly valid JSON with no extra markdown code block delimiters or text, in the following format:
[
  {
    "title": "Rule name (provide a concise rule name in ${targetLanguage})",
    "category": "Grammar / Conjugation / Expression",
    "briefExplanation": "Short 1-sentence summary in ${nativeLanguage} of what it does",
    "difficulty": "Beginner"
  }
]`;
  }

  /**
   * Builds the instructions for full structured lesson generation.
   */
  buildLessonGenerationPrompt(
    ruleTitle: string,
    wordsCount: number,
    nativeLanguage: string,
    targetLanguage: string,
  ): string {
    return `You are a ${targetLanguage} language instructor AI. Respond strictly with valid JSON without markdown codeblock wrapper or outside commentary.
If the requested rule or topic in the USER PROMPT is completely unrelated to learning ${targetLanguage}, nonsense, or inappropriate, return exactly this JSON:
{ "error": "This topic is invalid or unrelated to learning ${targetLanguage}. Please enter a valid grammar rule, vocabulary topic, or conversational phrase." }

Otherwise, follow this exact JSON structure:
{
  "rule": {
    "title": "${ruleTitle}",
    "explanation": "Clear explanation of rule usage and formation in ${nativeLanguage}",
    "examples": [
      { "targetLanguage": "example in ${targetLanguage}", "nativeLanguage": "translation in ${nativeLanguage}", "explanation": "optional explanation in ${nativeLanguage}" },
      { "targetLanguage": "example in ${targetLanguage}", "nativeLanguage": "translation in ${nativeLanguage}" }
    ],
    "exceptions": "Exceptions or nuances if applicable, explained in ${nativeLanguage}"
  },
  "newWords": [
    { "targetLanguage": "word in ${targetLanguage}", "nativeLanguage": "meaning in ${nativeLanguage}", "pronunciation": "romanized pronunciation", "partOfSpeech": "verb/noun" }
    // IMPORTANT: exactly ${wordsCount} items — every word here MUST be brand new and must NOT appear in the "List of known words" from the user prompt
  ],
  "exercise1": {
    "instruction": "Apply the rule on 5 words (new daily words + bank words)",
    "targetWords": ["word1", "word2", "word3", "word4", "word5"],
    "sampleWords": ["word1", "word2", "word3", "word4", "word5"]
  },
  "exercise2": {
    "instruction": "Translate 3 sentences from ${nativeLanguage} to ${targetLanguage} (do NOT give answers)",
    "sentencesToTranslate": [
      "Sentence 1 in ${nativeLanguage}...",
      "Sentence 2 in ${nativeLanguage}...",
      "Sentence 3 in ${nativeLanguage}..."
    ]
  },
  "exercise3": {
    "instruction": "Translate this text (30-50 words story) from ${nativeLanguage} to ${targetLanguage} (do NOT give answers)",
    "textToTranslate": "Story text in natural ${nativeLanguage} using target vocabulary and grammar..."
  }
}`;
  }

  /**
   * Builds the prompt for multimodal answer grading and OCR.
   */
  buildGradingPrompt(
    lessonData: LessonContent,
    userAnswersText: { ex1?: string; ex2?: string; ex3?: string },
    hasImages: boolean,
    nativeLanguage: string,
    targetLanguage: string,
  ): string {
    return `You are an expert ${targetLanguage} teacher grading a student's exercise submission. The student's native language is ${nativeLanguage}.
Lesson Details:
Rule: ${lessonData.rule.title} (${lessonData.rule.explanation})
Target Words: ${lessonData.newWords.map((w) => `${w.targetLanguage} (${w.nativeLanguage})`).join(', ')}

Exercise 1 Prompt: ${lessonData.exercise1.instruction} (Target words: ${lessonData.exercise1.targetWords.join(', ')})
Exercise 2 Prompt: ${lessonData.exercise2.sentencesToTranslate.join(' | ')}
Exercise 3 Prompt: ${lessonData.exercise3.textToTranslate}

Student Text Submission:
Exercise 1 Answer: ${userAnswersText.ex1 || 'N/A'}
Exercise 2 Answer: ${userAnswersText.ex2 || 'N/A'}
Exercise 3 Answer: ${userAnswersText.ex3 || 'N/A'}

${hasImages ? 'NOTE: Images of handwritten answers are attached. Perform OCR on the handwriting first.' : ''}

Grade the student's work accurately with constructive feedback and corrections. Provide all feedback in ${nativeLanguage}.
Return STRICT JSON format (no markdown formatting, no extra text):
{
  "overallScore": 85,
  "generalFeedback": "Encouraging overall feedback summary in ${nativeLanguage}",
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
  }
}
