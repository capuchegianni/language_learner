import { Injectable } from '@nestjs/common';
import { LessonContent } from '../interfaces/ai.interfaces';
import { formatExerciseOneMatrix } from '../constants/exercise-one-matrix.constant';

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
    return `Target Rule: "${ruleTitle}"
New words to introduce: ${wordsCount} (strictly NOT from the known words list below)
Native Language: ${nativeLanguage}
Target Language: ${targetLanguage}

List of known words (DO NOT reuse): \`${knownWordsList.join(', ')}\`

List of known rules already learned: \`${knownRulesList.join(', ')}\``;
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
    const exercise1MatrixText = formatExerciseOneMatrix(
      targetLanguage,
      nativeLanguage,
    );
    return `You are an expert ${targetLanguage} language professor and tutor. Respond strictly with valid JSON without markdown codeblock wrapper or outside commentary.
If the requested rule or topic in the USER PROMPT is completely unrelated to learning ${targetLanguage}, nonsense, or inappropriate, return exactly this JSON:
{ "error": "This topic is invalid or unrelated to learning ${targetLanguage}. Please enter a valid grammar rule, vocabulary topic, or conversational phrase." }

Otherwise, generate a comprehensive lesson.

### EXERCISE 1 PEDAGOGICAL DECISION MATRIX:
Review the following archetypes grouped by pedagogical category. You must select the ONE archetype that yields the highest communicative and pedagogical value for "${ruleTitle}" in ${targetLanguage}:
${exercise1MatrixText}

Exercise 1 Selection Principles:
1. Matrix Evaluation: Evaluate "${ruleTitle}" and ${targetLanguage} against the "When to use" and "Do NOT use when" criteria of each category in the Matrix above. Select the ONE archetype whose pedagogical objective matches this lesson's exact grammatical or communicative nature.
2. Lexical & Pedagogical Integrity: The exercise must adapt to the lesson, never the reverse. NEVER distort, truncate, or hallucinate words (e.g. converting non-verbs into verbs or stripping reflexive markers) to force-fit an archetype.
3. Instruction Language: Formulate the "instruction" for exercise 1 STRICTLY in natural, fluent ${nativeLanguage}, clearly explaining the exact format the student should write.
4. Target Words: Populate "targetWords" matching the chosen archetype's count and format, drawn from the new daily words and/or known word bank. Mirror them in "sampleWords".

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
    "subjectPronouns": ["pronoun1", "pronoun2", "..."] // ONLY include when type is "subject_conjugation", omit otherwise
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
