import { Injectable } from '@nestjs/common';
import { LessonContent } from '../interfaces/ai.interfaces';
import { formatExercise1CatalogForPrompt } from '../constants/exercise-one.constant';

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
- daily rule: Provide a comprehensive, in-depth pedagogical lesson for this rule in ${nativeLanguage}. Include precise grammatical function, step-by-step formation and usage rules (such as conjugation patterns, stem/ending modifications, word order, agreement, or phonetic changes relevant to ${targetLanguage}), register/formality nuances, 3 to 4 varied illustrative examples with breakdowns, and common pitfalls or exceptions.
- exercise 1: Select the most pedagogically appropriate exercise archetype from the Exercise 1 Catalog based on "${ruleTitle}" and ${targetLanguage} characteristics (e.g. full subject conjugation for person-varying verb tenses, stem/affix inflection for agglutinative or non-person patterns, particle attachment, agreement, sentence transformation, etc.).
- exercise 2: translate 3 sentences from ${nativeLanguage} to ${targetLanguage} that use the new rule and the new vocabulary (no literal translations, use natural ${nativeLanguage}, don't give the answer)
- exercise 3: translate a text from ${nativeLanguage} to ${targetLanguage} (from 30 to 50 words) that is using some of the previous rules + the new one at least once and the new vocabulary + words from the bank. The text must have a meaning and coherent mini-story between the sentences and it's not mandatory to use all tenses (no literal translations, use natural ${nativeLanguage}, don't give the answer)

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
    const exercise1CatalogJson = formatExercise1CatalogForPrompt();
    return `You are an expert ${targetLanguage} language professor and tutor. Respond strictly with valid JSON without markdown codeblock wrapper or outside commentary.
If the requested rule or topic in the USER PROMPT is completely unrelated to learning ${targetLanguage}, nonsense, or inappropriate, return exactly this JSON:
{ "error": "This topic is invalid or unrelated to learning ${targetLanguage}. Please enter a valid grammar rule, vocabulary topic, or conversational phrase." }

Otherwise, generate a comprehensive lesson.

### EXERCISE 1 SELECTION CATALOG:
Review the following list of available Exercise 1 archetypes. You must select the ONE template that yields the highest pedagogical value for "${ruleTitle}" in ${targetLanguage}:
${exercise1CatalogJson}

Exercise 1 Selection Principles:
1. Examine "${ruleTitle}" and ${targetLanguage}, and select the ONE archetype from the Exercise 1 Catalog whose "applicability" best matches this rule.
2. Set "type" to the selected archetype id.
3. Formulate the "instruction" STRICTLY in the student's native language (${nativeLanguage}). Note: While the examples in the Exercise 1 Catalog above are written in English for demonstration purposes, your output "instruction" for exercise1 MUST be written completely and naturally in ${nativeLanguage}, clearly explaining the exact format the student should write.
4. Populate "targetWords" with the appropriate items matching the chosen archetype's "itemCount" and "targetWordsFormat", drawn from the new daily words and/or known word bank.
5. In "sampleWords", mirror the "targetWords" array.

Follow this exact JSON structure:
{
  "rule": {
    "title": "${ruleTitle}",
    "explanation": "Thorough, structured pedagogical explanation written in ${nativeLanguage}. Do not write a shallow 1-2 sentence summary. Separate each of the following sections with double newlines (\\\\n\\\\n) so the text breathes and is easily readable:\\n\\n1. Core Meaning & Function: What communicative purpose, grammatical relation, or nuance this pattern expresses in ${targetLanguage}.\\n\\n2. Formation & Structural Formula: Clear step-by-step construction rules showing how it is built or attached to words (e.g. verb/noun/adjective conjugation patterns, prefixes/suffixes, auxiliary particles, word order, or phonological/euphonic changes specific to ${targetLanguage}).\\n\\n3. Context & Register: When and where this form is appropriate (e.g. level of politeness, formal vs. colloquial, spoken vs. written discourse).",
    "examples": [
      {
        "targetLanguage": "Full natural example sentence in ${targetLanguage}",
        "nativeLanguage": "Accurate, natural translation in ${nativeLanguage}",
        "explanation": "Clear structural breakdown in ${nativeLanguage} (identifying the root word, endings/particles/auxiliaries applied, and the specific grammatical context)"
      },
      {
        "targetLanguage": "Second contrasting example in ${targetLanguage} (demonstrating a different grammatical condition, stem ending, or context)",
        "nativeLanguage": "Accurate, natural translation in ${nativeLanguage}",
        "explanation": "Breakdown highlighting the specific morphological or syntactic variation used here in ${nativeLanguage}"
      },
      {
        "targetLanguage": "Third practical, authentic everyday example in ${targetLanguage}",
        "nativeLanguage": "Accurate, natural translation in ${nativeLanguage}",
        "explanation": "Breakdown of the expression and nuance in ${nativeLanguage}"
      }
    ],
    "exceptions": "Important irregular forms, structural constraints (e.g. clause types, tense/aspect restrictions, compatible parts of speech), or frequent learner errors in ${targetLanguage} explained clearly in ${nativeLanguage}. If there are genuinely no irregular forms, explain common usage mistakes or subtle nuances to be careful of."
  },
  "newWords": [
    { "targetLanguage": "word in ${targetLanguage}", "nativeLanguage": "meaning in ${nativeLanguage}", "pronunciation": "romanized pronunciation", "partOfSpeech": "verb/noun" }
    // IMPORTANT: exactly ${wordsCount} items — every word here MUST be brand new and must NOT appear in the "List of known words" from the user prompt
  ],
  "exercise1": {
    "type": "chosen_archetype_id",
    "instruction": "Pedagogical prompt in ${nativeLanguage} tailored to the chosen exercise type and rule",
    "targetWords": ["item1", "item2", "item3"],
    "sampleWords": ["item1", "item2", "item3"],
    "subjectPronouns": ["pronoun1", "pronoun2", "..."] // REQUIRED when type is "subject_conjugation"
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
    const ex1TargetItemsFormatted = lessonData.exercise1.targetWords
      .map((item, idx) => `  ${idx + 1}. ${item}`)
      .join('\n');
    const ex1TypeInfo = lessonData.exercise1.type
      ? `Exercise 1 Archetype: ${lessonData.exercise1.type}\n`
      : '';

    return `You are an expert ${targetLanguage} teacher grading a student's exercise submission. The student's native language is ${nativeLanguage}.

Lesson Reference:
Rule: ${lessonData.rule.title} (${lessonData.rule.explanation})
Vocabulary: ${lessonData.newWords.map((w) => `${w.targetLanguage} (${w.nativeLanguage})`).join(', ')}

Exercise Prompts:
${ex1TypeInfo}Exercise 1 Instruction: ${lessonData.exercise1.instruction}
Exercise 1 Target Items:
${ex1TargetItemsFormatted}

Exercise 2 Instruction: ${lessonData.exercise2.instruction}
Exercise 2 Sentences to Translate:
${lessonData.exercise2.sentencesToTranslate.map((s, idx) => `  ${idx + 1}. ${s}`).join('\n')}

Exercise 3 Instruction: ${lessonData.exercise3.instruction}
Exercise 3 Text to Translate: ${lessonData.exercise3.textToTranslate}

Student Submission:
[Exercise 1 Submission]
${userAnswersText.ex1 || 'N/A'}

[Exercise 2 Submission]
${userAnswersText.ex2 || 'N/A'}

[Exercise 3 Submission]
${userAnswersText.ex3 || 'N/A'}

${hasImages ? 'NOTE: Images of handwritten answers are attached. Perform OCR on the handwriting first.' : ''}

Grading Guidelines:
- Grade the student's work accurately, providing constructive feedback and corrections. All feedback, explanations, and notes MUST be written in ${nativeLanguage}.
- Exercise 1 Evaluation:
  * Grade answers strictly against the Exercise 1 Instruction and Archetype (${lessonData.exercise1.type || 'pattern practice'}).
  * If the exercise is a conjugation drill (e.g. subject_conjugation), verify that all subject persons were conjugated and check stems, endings, and orthography.
  * If the exercise is stem inflection or particle/case attachment, check stem changes, vowel harmony, batchim/consonant rules, and elisions.
  * If the exercise is sentence transformation or clause combination, verify that the grammatical transformation/connector was correctly applied without altering meaning.
  * If the exercise is agreement or cloze insertion, check gender/number agreement and contextual accuracy.
  * For any mistake, provide a clear, itemized correction in "exercise1.corrections" indicating the item, what was incorrect, the expected answer, and a concise explanation in ${nativeLanguage}. If an item is correct, do not include an unnecessary correction.

Return STRICT JSON format (no markdown formatting, no extra text):
{
  "overallScore": 85,
  "generalFeedback": "Overall feedback summary in ${nativeLanguage}, it must be constructive and pinpoint current weaknesses and strengths if any.",
  "handwrittenOcrText": "Transcribed text if image was provided, else null",
  "exercise1": {
    "score": 90,
    "corrections": ["<Item>: correction and explanation in ${nativeLanguage}"],
    "feedback": "Feedback for Ex 1 in ${nativeLanguage}"
  },
  "exercise2": {
    "score": 80,
    "corrections": ["Sentence 1 in ${nativeLanguage}: ...", "Sentence 2 in ${nativeLanguage}: ..."],
    "feedback": "Feedback for Ex 2 in ${nativeLanguage}"
  },
  "exercise3": {
    "score": 85,
    "corrections": ["Text correction details in ${nativeLanguage} ..."],
    "feedback": "Feedback for Ex 3 in ${nativeLanguage}"
  }
}`;
  }
}
