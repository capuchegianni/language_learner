export interface Exercise1Template {
  id: string;
  name: string;
  applicability: string;
  itemCount: number;
  instructionTemplate: string;
  targetWordsFormat: string;
  expectedStudentResponse: string;
  example: {
    instruction: string;
    targetWords: string[];
    subjectPronouns?: string[];
  };
}

export const EXERCISE1_TEMPLATES: Exercise1Template[] = [
  {
    id: 'subject_conjugation',
    name: 'Full Subject-Pronoun Conjugation Paradigm',
    applicability:
      'Best suited for languages with subject-verb conjugation paradigms (e.g. French, Spanish, Italian, German, Portuguese, Russian) when the lesson rule is a specific verb tense, mood, or verb group (e.g. French 1st group -er present tense, Spanish pretérito indefinido, German present tense, etc.).',
    itemCount: 3,
    instructionTemplate:
      "Conjugate each of the following 3 verbs in {targetLanguage} for all subject pronouns (e.g. for French: je, tu, il/elle/on, nous, vous, ils/elles; for Spanish: yo, tú, él/ella, nosotros, vosotros, ellos) according to the '{rule_title}' rule:",
    targetWordsFormat:
      'Array of 3 infinitive verbs in {targetLanguage} selected from the new daily words and/or word bank',
    expectedStudentResponse:
      "For each verb, the student writes out the conjugation for all subjects in {targetLanguage} separated by commas (e.g. 'je parle, tu parles, il parle, nous parlons, vous parlez, ils parlent')",
    example: {
      instruction:
        'Conjugate each of the following 3 verbs in the present tense for all subject pronouns:',
      targetWords: ['parler', 'manger', 'regarder'],
      subjectPronouns: ['je', 'tu', 'il/elle/on', 'nous', 'vous', 'ils/elles'],
    },
  },
  {
    id: 'stem_ending_inflection',
    name: 'Stem Affix & Ending Inflection',
    applicability:
      'Best suited for agglutinative languages or invariant rules where verbal/adjectival endings, honorifics, or tenses attach directly to stems uniformly without varying by subject person (e.g. Korean past tense -았/었어요, desire -고 싶다; Japanese -たい form, -て form; Turkish; Finnish).',
    itemCount: 5,
    instructionTemplate:
      "Apply the '{rule_title}' pattern to each of the following 5 base words in {targetLanguage}, respecting stem vowel harmony, batchim (final consonant) rules, and irregular contractions:",
    targetWordsFormat:
      'Array of 5 base verbs/adjectives in {targetLanguage} selected from the new daily words and/or word bank',
    expectedStudentResponse:
      "For each base word in {targetLanguage}, the student writes the transformed word or minimal verbal phrase in {targetLanguage} (e.g. '가다 -> 가요', '먹다 -> 먹어요')",
    example: {
      instruction:
        "Apply the '{rule_title}' rule to each of the following 5 base words, reflecting proper stem changes and vowel harmony:",
      targetWords: ['가다', '먹다', '만들다', '춥다', '듣다'],
    },
  },
  {
    id: 'particle_case_attachment',
    name: 'Particle, Preposition & Case Marker Attachment',
    applicability:
      'Best suited for rules introducing grammatical particles, postpositions, prepositions, or noun case declensions (e.g. Korean particles; Japanese particles; German dative/accusative prepositions; Russian case endings).',
    itemCount: 5,
    instructionTemplate:
      "Attach the appropriate particle, preposition, or case ending of '{rule_title}' to each of the following 5 words, paying attention to phonetic harmony (consonant vs. vowel ending) or case agreement:",
    targetWordsFormat:
      'Array of 5 nouns or pronouns in {targetLanguage} selected from the new daily words and/or word bank',
    expectedStudentResponse:
      "For each word in {targetLanguage}, the student writes the word with the correct particle attached or the preposed preposition + inflected noun in {targetLanguage} (e.g. '사과 -> 사과를', '책 -> 책을')",
    example: {
      instruction:
        "Attach the appropriate '{rule_title}' particle to each of the following 5 nouns according to final consonant rules:",
      targetWords: ['사과', '책', '도서관', '친구', '선생님'],
    },
  },
  {
    id: 'gender_number_agreement',
    name: 'Gender & Number Agreement Inflection',
    applicability:
      'Best suited for rules covering grammatical gender (masculine/feminine/neuter) and number (singular/plural) agreement for adjectives, nouns, participles, or articles (e.g. French, Spanish, Italian, German, Russian, etc.).',
    itemCount: 5,
    instructionTemplate:
      "Inflect each of the following 5 base words to agree with the indicated gender, number, and case conditions according to the '{rule_title}' rule:",
    targetWordsFormat:
      "Array of 5 prompts pairing a base word in {nativeLanguage} with target agreement conditions described in {nativeLanguage} (e.g. ['tall (feminine plural)', 'new (feminine singular)', 'happy (feminine singular)', 'beautiful (masculine plural)'])",
    expectedStudentResponse:
      "For each prompt, the student writes the correctly inflected form in {targetLanguage} (e.g. 'tall (feminine plural) -> grandes')",
    example: {
      instruction:
        'Agree each of the following adjectives in gender and number according to the specified condition:',
      targetWords: [
        'tall (feminine plural)',
        'new (feminine singular)',
        'happy (feminine singular)',
        'beautiful (masculine plural)',
      ],
    },
  },
  {
    id: 'sentence_transformation',
    name: 'Sentence Structure & Polarity Transformation',
    applicability:
      "Best suited for rules modifying sentence polarity, modality, voice, or register — such as negation, question inversion, honorific speech level shifts, or passive/causative conversions.",
    itemCount: 3,
    instructionTemplate:
      "Transform each of the following 3 sentences in {targetLanguage} using the '{rule_title}' pattern (e.g. turn affirmative into negative, or casual into formal):",
    targetWordsFormat:
      'Array of 3 simple sentences in {targetLanguage} using the new daily words or word bank',
    expectedStudentResponse:
      'For each sentence in {targetLanguage}, the student writes the transformed sentence in {targetLanguage} applying the target structure accurately',
    example: {
      instruction:
        "Transform each of the following 3 sentences into the negative form using 'ne ... pas', applying elision rules where necessary:",
      targetWords: [
        'Je mange une pomme.',
        'Il regarde la télévision.',
        'Nous aimons le café.',
      ],
    },
  },
  {
    id: 'clause_connector_combination',
    name: 'Clause Connector & Conjunction Linking',
    applicability:
      "Best suited for coordinating or subordinating conjunctions, connectors, or clause-linking suffixes (e.g. 'because', 'although', 'if/when', 'while', 'but' — Korean -(으)니까, -지만, -(으)면; Japanese -から, -ながら, -けど; French 'parce que', 'bien que', 'pendant que'; German 'weil', 'obwohl' with verb-final word order).",
    itemCount: 3,
    instructionTemplate:
      "Combine each of the following 3 pairs of clauses into a single coherent sentence in {targetLanguage} using the connector '{rule_title}', adjusting word order or verb forms where required:",
    targetWordsFormat:
      "Array of 3 pairs of short clauses in {targetLanguage} separated by ' / ' (e.g. ['Clause A / Clause B'])",
    expectedStudentResponse:
      'For each pair, the student writes the merged compound or complex sentence in {targetLanguage} with the connector',
    example: {
      instruction:
        "Connect each pair of clauses into a single coherent sentence using '{rule_title}', applying appropriate word order:",
      targetWords: [
        'Il pleut / Je reste à la maison',
        "J'ai très faim / Je n'ai pas le temps de cuisiner",
        'Il fait froid / Nous sortons nous promener',
      ],
    },
  },
  {
    id: 'cloze_pattern_insertion',
    name: 'Contextual Sentence Frame / Cloze Insertion',
    applicability:
      'Best suited for auxiliary verbs (e.g. can, must, want, should), modal expressions, fixed grammatical frames, or adverbs that slot into a specific position within a sentence.',
    itemCount: 4,
    instructionTemplate:
      "Complete each of the following 4 sentence frames in {targetLanguage} by conjugating or inserting the specified target word according to the '{rule_title}' rule:",
    targetWordsFormat:
      "Array of 4 sentence frames where the sentence itself is in {targetLanguage} with a blank ('___'), and the hint word in parentheses is the {nativeLanguage} translation of the word to insert (e.g. ['Je ___ au cinéma ce soir. (to go)', 'Nous ___ nos devoirs. (to do)'])",
    expectedStudentResponse:
      'For each frame, the student writes the correctly inflected target word in {targetLanguage} inserted into the blank',
    example: {
      instruction:
        "Complete each sentence by conjugating the verb in parentheses according to the rule '{rule_title}':",
      targetWords: [
        'Je ___ au cinéma ce soir. (to go)',
        'Nous ___ nos devoirs avant le dîner. (to do)',
        'Tu ___ venir à la fête demain. (to be able to)',
        'Ils ___ parler français couramment. (to know how to)',
      ],
    },
  },
  {
    id: 'contrast_pair_usage',
    name: 'Contrasting Forms & Minimal Pairs Drill',
    applicability:
      "Best suited for rules that introduce or distinguish between two commonly confused forms, aspect pairs, or complementary structures (e.g. Spanish 'ser' vs. 'estar', 'por' vs. 'para'; French 'c'est' vs. 'est', 'passé composé' vs. 'imparfait'; Korean subject marker '이/가' vs. topic marker '은/는'; Japanese 'は' vs. '가').",
    itemCount: 4,
    instructionTemplate:
      "Select and correctly apply the appropriate form from the '{rule_title}' contrast pair for each of the following 4 sentences:",
    targetWordsFormat:
      'Array of 4 sentence frames in {targetLanguage} with a blank and the two contrast forms in parentheses (both forms are in {targetLanguage})',
    expectedStudentResponse:
      'For each sentence in {targetLanguage}, the student selects the correct form and writes the complete sentence in {targetLanguage}',
    example: {
      instruction:
        "Complete each sentence by choosing the correct form from the '{rule_title}' contrast pair:",
      targetWords: [
        "Paris ___ une très belle ville. (c'est / est)",
        "___ médecin dans cet hôpital. (c'est / est)",
        "___ important d'étudier tous les jours. (c'est / est)",
        'Regarde ce tableau, ___ magnifique ! (c\'est / est)',
      ],
    },
  },
  {
    id: 'creative_sentence_production',
    name: 'Target Word Sentence Construction',
    applicability:
      'Best suited for open-ended grammatical patterns, conversational formulas, discourse markers, interjections, or general grammar rules where composing a distinct, natural sentence for each target word provides the most valuable practice.',
    itemCount: 3,
    instructionTemplate:
      "Write an original, grammatically natural sentence in {targetLanguage} for each of the following 3 words, actively incorporating the '{rule_title}' rule:",
    targetWordsFormat:
      'Array of 3 target vocabulary words in {targetLanguage} selected from the new daily words and word bank',
    expectedStudentResponse:
      'For each word in {targetLanguage}, the student writes a complete, meaningful sentence in {targetLanguage} demonstrating the word and rule in context',
    example: {
      instruction:
        "Write an authentic and complete sentence for each of the following 3 words using the rule '{rule_title}':",
      targetWords: ['livre', 'étudier', 'matin'],
    },
  },
];

/**
 * Formats the exercise 1 catalog into a clear, structured JSON block for prompt injection.
 */
export function formatExercise1CatalogForPrompt(): string {
  return JSON.stringify(EXERCISE1_TEMPLATES, null, 2);
}
