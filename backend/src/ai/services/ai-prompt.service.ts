import { Injectable } from '@nestjs/common';
import { LessonExercise } from '../../generated/prisma/client';
import { UserSubmission } from '../interfaces/ai.interfaces';
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
If the requested rule or topic in the USER PROMPT is making you generate a lesson not exactly related to ${targetLanguage} or mentionning another language, return exactly this JSON:
{ "error": "This language is not your selected language or is not handled by our AI." }

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
   * Helper to format UserSubmission polymorphic union cleanly for LLM consumption.
   */
  private formatUserSubmission(
    sub?: UserSubmission,
    subjectPronouns?: string[],
    targetWords?: string[],
  ): string {
    if (!sub) return 'N/A';
    if ('grid' in sub && sub.grid && typeof sub.grid === 'object') {
      const lines: string[] = [];
      const verbs =
        targetWords && targetWords.length > 0
          ? targetWords
          : Object.keys(sub.grid);

      verbs.forEach((verb, vIdx) => {
        const conjugations = sub.grid[verb];
        if (Array.isArray(conjugations)) {
          conjugations.forEach((conj, pIdx) => {
            const pronounLabel =
              subjectPronouns && subjectPronouns[pIdx]
                ? ` [${subjectPronouns[pIdx]}]`
                : '';
            lines.push(
              `  Input ${vIdx}_${pIdx} (${verb}${pronounLabel}): ${conj || '(no answer)'}`,
            );
          });
        } else if (conjugations !== undefined) {
          lines.push(`  Input ${vIdx} (${verb}): ${String(conjugations)}`);
        }
      });
      return lines.length > 0 ? lines.join('\n') : 'N/A';
    }
    if ('answers' in sub && Array.isArray(sub.answers)) {
      return (
        sub.answers
          .map((ans, idx) => `  Input ${idx}: ${ans || '(no answer)'}`)
          .join('\n') || 'N/A'
      );
    }
    if ('text' in sub && typeof sub.text === 'string') {
      return `  Input 0: ${sub.text.trim() || '(no answer)'}`;
    }
    return typeof sub === 'string' ? `  Input 0: ${sub}` : JSON.stringify(sub);
  }

  /**
   * Builds the prompt for multimodal answer grading and OCR.
   */
  buildGradingPrompt(
    lesson: {
      rule?: { title: string; explanation: string } | null;
      words?: Array<{ word: { targetLanguage: string; nativeLanguage: string } }>;
    },
    exercises: LessonExercise[],
    userSubmissions: Map<number, UserSubmission>,
    hasImages: boolean,
    nativeLanguage: string,
    targetLanguage: string,
  ): string {
    const parseContent = (content: unknown): Record<string, unknown> => {
      if (!content) return {};
      if (typeof content === 'string') {
        try {
          const parsed = JSON.parse(content);
          return parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : {};
        } catch {
          return {};
        }
      }
      if (typeof content === 'object') {
        return content as Record<string, unknown>;
      }
      return {};
    };

    const ex1 = exercises.find((e) => e.exerciseNumber === 1);
    const ex1Content = parseContent(ex1?.content);
    const ex1TargetWordsRaw =
      Array.isArray(ex1Content.targetWords) && ex1Content.targetWords.length > 0
        ? ex1Content.targetWords
        : Array.isArray(ex1Content.sampleWords) && ex1Content.sampleWords.length > 0
          ? ex1Content.sampleWords
          : [];
    const ex1TargetWords = ex1TargetWordsRaw.map(String);

    const isSubjectConjugation =
      ex1Content.type === 'subject_conjugation' &&
      ex1TargetWords.length > 0 &&
      Array.isArray(ex1Content.subjectPronouns) &&
      ex1Content.subjectPronouns.length > 0;

    let ex1TargetItemsFormatted = '';
    if (isSubjectConjugation) {
      const targetVerbs = ex1TargetWords;
      const pronouns = ex1Content.subjectPronouns as unknown[];
      const lines: string[] = [];
      targetVerbs.forEach((verb, vIdx) => {
        pronouns.forEach((pronoun, pIdx) => {
          lines.push(
            `  Input ${vIdx}_${pIdx} (${String(verb)} [${String(pronoun)}]): conjugate for this pronoun`,
          );
        });
      });
      ex1TargetItemsFormatted = lines.join('\n');
    } else if (ex1TargetWords.length > 0) {
      ex1TargetItemsFormatted = ex1TargetWords
        .map((item, idx) => `  Input ${idx}: ${String(item)}`)
        .join('\n');
    }

    const ex1TypeInfo = typeof ex1Content.type === 'string'
      ? `Exercise 1 Archetype: ${ex1Content.type}\n`
      : '';

    const ex2 = exercises.find((e) => e.exerciseNumber === 2);
    const ex2Content = parseContent(ex2?.content);
    const ex2SentencesFormatted = Array.isArray(ex2Content.sentencesToTranslate)
      ? (ex2Content.sentencesToTranslate as unknown[])
          .map((s, idx) => `  Input ${idx}: ${String(s)}`)
          .join('\n')
      : '';

    const ex3 = exercises.find((e) => e.exerciseNumber === 3);
    const ex3Content = parseContent(ex3?.content);
    const ex3Text = typeof ex3Content.textToTranslate === 'string' ? ex3Content.textToTranslate : '';

    const subjectPronouns = Array.isArray(ex1Content.subjectPronouns)
      ? (ex1Content.subjectPronouns as string[])
      : undefined;

    const ex1Submission = this.formatUserSubmission(
      userSubmissions.get(1),
      subjectPronouns,
      isSubjectConjugation ? ex1TargetWords : undefined,
    );
    const ex2Submission = this.formatUserSubmission(userSubmissions.get(2));
    const ex3Submission = this.formatUserSubmission(userSubmissions.get(3));

    const ruleTitle = lesson.rule?.title || 'General Grammar';
    const ruleExplanation = lesson.rule?.explanation || '';
    const vocabularyList =
      lesson.words && lesson.words.length > 0
        ? lesson.words.map((w) => `${w.word.targetLanguage} (${w.word.nativeLanguage})`).join(', ')
        : 'N/A';

    return `You are an expert ${targetLanguage} teacher grading a student's exercise submission. The student's native language is ${nativeLanguage}.

Lesson Reference:
Rule: ${ruleTitle} (${ruleExplanation})
Vocabulary: ${vocabularyList}

Exercise Prompts:
${ex1TypeInfo}Exercise 1 Instruction: ${ex1?.instruction || 'Exercise 1'}
Exercise 1 Target Items (Matching inputId headers):
${ex1TargetItemsFormatted}

Exercise 2 Instruction: ${ex2?.instruction || 'Exercise 2'}
Exercise 2 Sentences to Translate (Sequential inputs 0..N):
${ex2SentencesFormatted}

Exercise 3 Instruction: ${ex3?.instruction || 'Exercise 3'}
Exercise 3 Text to Translate (Input 0):
  Input 0: ${ex3Text}

Student Submission:
[Exercise 1 Submission]
${ex1Submission}

[Exercise 2 Submission]
${ex2Submission}

[Exercise 3 Submission]
${ex3Submission}

${hasImages ? 'NOTE: Images of handwritten answers are attached. First perform OCR to transcribe the student handwriting into the input slots (e.g. Input 0, Input 1, or Input 0_0) for each exercise in userSubmission, and set handwrittenOcrText to the full transcription. Then evaluate each input slot identically.' : ''}

Grading Guidelines:
- Grade the student's work accurately, providing constructive feedback and corrections. All feedback, explanations, and notes MUST be written in ${nativeLanguage}.
- For each exercise (exercise1, exercise2, exercise3), determine an integer score from 0 to 100 based on accuracy.
- STRUCTURED CORRECTIONS REQUIREMENT:
  * For all exercises, "corrections" MUST be an array of StructuredCorrection objects.
  * NEGATIVE CONSTRAINT: Include corrections STRICTLY AND ONLY for student mistakes or errors. If an input or exercise contains NO mistakes (the answer is fully correct), DO NOT include any correction for it. If an exercise has no mistakes at all, "corrections" MUST be an empty array [].
  * Every item in "corrections" MUST contain:
    - "inputId": exact string identifier matching the "Input <inputId>" header where the mistake occurred (e.g. "0", "1", "2" for linear items, or "0_0", "0_1" for conjugation matrix cells).
    - "original": the exact substring from the student's submission that has the error.
    - "expected": the correct replacement word, phrase, or sentence in ${targetLanguage}.
    - "explanation": concise grammatical explanation in ${nativeLanguage}.
    - "errorType": strictly one of: "spelling" | "conjugation" | "grammar" | "vocabulary" | "syntax" | "other"
  * MULTIPLE ERRORS PER INPUT: If a single input has multiple distinct mistakes (e.g. one spelling error and one wrong particle), return multiple correction objects sharing that same "inputId", each pinpointing its own "original" substring.
- Exercise 1 Evaluation:
  * Grade answers strictly against the Exercise 1 Instruction and Archetype (${ex1Content.type || 'pattern practice'}).
  * If the exercise is a conjugation drill (e.g. subject_conjugation), verify that all subject persons were conjugated and check stems, endings, and orthography.
  * If the exercise is stem inflection or particle/case attachment, check stem changes, vowel harmony, batchim/consonant rules, and elisions.
  * If the exercise is sentence transformation or clause combination, verify that the grammatical transformation/connector was correctly applied without altering meaning.
  * If the exercise is agreement or cloze insertion, check gender/number agreement and contextual accuracy.

Return STRICT JSON format (no markdown formatting, no extra text):
{
  "overallScore": 85,
  "generalFeedback": "Overall feedback summary in ${nativeLanguage}, it must be constructive and pinpoint current weaknesses and strengths if any.",
  "handwrittenOcrText": ${hasImages ? '"Transcribed text if image was provided, else null"' : 'null'},
  "exercise1": {
    "score": 90,
    "corrections": [
      {
        "inputId": "0",
        "original": "<Student Mistake Substring>",
        "expected": "<Correct Form in ${targetLanguage}>",
        "explanation": "<Concise explanation in ${nativeLanguage}>",
        "errorType": "conjugation"
      }
    ],
    "feedback": "Feedback for Ex 1 in ${nativeLanguage}"
  },
  "exercise2": {
    "score": 100,
    "corrections": [],
    "feedback": "All answers are correct! Great work."
  },
  "exercise3": {
    "score": 80,
    "corrections": [
      {
        "inputId": "0",
        "original": "<Student Mistake Substring>",
        "expected": "<Correct Form in ${targetLanguage}>",
        "explanation": "<Concise explanation in ${nativeLanguage}>",
        "errorType": "grammar"
      }
    ],
    "feedback": "Feedback for Ex 3 in ${nativeLanguage}"
  }
}`;
  }
}
