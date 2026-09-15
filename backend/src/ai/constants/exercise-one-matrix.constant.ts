/**
 * Exercise 1 Decision Matrix & Pedagogical Taxonomy
 * 
 * Optimized compact representation of Exercise 1 archetypes grouped by pedagogical intent.
 * Designed to reduce LLM prompt token load, eliminate primacy bias ("Lost in the Middle"),
 * and enforce strict, language-agnostic selection guardrails.
 */

export interface Exercise1MatrixItem {
  id: string;
  name: string;
  category:
    | 'Conversational & Social Formulas'
    | 'Verb Tenses & Conjugation'
    | 'Agglutinative & Particles'
    | 'Agreement & Contrasts'
    | 'Connectors & Syntax';
  whenToUse: string;
  whenNotToUse: string;
  itemCount: number;
  targetWordsFormat: string;
  studentAction: string;
  requiresSubjectPronouns?: boolean;
}

export const EXERCISE1_MATRIX: Exercise1MatrixItem[] = [
  // ============================================================================
  // Category 1: Conversational & Social Formulas (Greetings, Register, Politeness)
  // ============================================================================
  {
    id: 'creative_sentence_production',
    name: 'Target Word Sentence Construction',
    category: 'Conversational & Social Formulas',
    whenToUse:
      'Conversational expressions, greetings, self-introductions, polite formulas, discourse markers, or general vocabulary rules where writing an authentic sentence using the target word provides genuine communicative practice.',
    whenNotToUse:
      'Strict morphological rules like verb conjugations, case markers, or grammar agreement.',
    itemCount: 3,
    targetWordsFormat:
      '3 target vocabulary words in {targetLanguage}',
    studentAction:
      'Student composes 1 complete, original, meaningful sentence per target word in {targetLanguage} incorporating the lesson rule.',
  },
  {
    id: 'sentence_transformation',
    name: 'Sentence Structure & Polarity Transformation',
    category: 'Conversational & Social Formulas',
    whenToUse:
      'Formality or speech register shifts (e.g. informal to formal address, casual to polite speech levels), sentence polarity (negation), question inversion, or voice shifts.',
    whenNotToUse:
      'Simple vocabulary acquisition without a transformational syntactic or register rule.',
    itemCount: 3,
    targetWordsFormat:
      '3 complete base sentences in {targetLanguage} to transform',
    studentAction:
      'Student rewrites each sentence in {targetLanguage} applying the requested transformation pattern.',
  },
  {
    id: 'cloze_pattern_insertion',
    name: 'Contextual Sentence Frame / Cloze Insertion',
    category: 'Conversational & Social Formulas',
    whenToUse:
      'Situational sentence or dialogue frames with blanks, fixed formulaic phrases, modal auxiliaries, or words that slot into a specific syntactic position.',
    whenNotToUse:
      'Open-ended conversational production without a fixed insertion slot.',
    itemCount: 4,
    targetWordsFormat:
      '4 sentence frames in {targetLanguage} with a blank ("___") and a clue or translation in parentheses in {nativeLanguage}',
    studentAction:
      'Student fills in the blank with the correct inflected word or formula in {targetLanguage}.',
  },

  // ============================================================================
  // Category 2: Verb Tenses & Conjugation Paradigms
  // ============================================================================
  {
    id: 'subject_conjugation',
    name: 'Full Subject-Pronoun Conjugation Paradigm',
    category: 'Verb Tenses & Conjugation',
    whenToUse:
      'STRICT: Use ONLY when the lesson rule explicitly teaches a specific verb tense, grammatical mood, or conjugation paradigm in {targetLanguage}.',
    whenNotToUse:
      'NEVER use for conversational formulas, greetings, expressions, or general vocabulary even if verbs are in the vocabulary list. NEVER convert non-verbs into verbs.',
    itemCount: 3,
    targetWordsFormat:
      '3 infinitive or dictionary form verbs in {targetLanguage} (strictly verbs only; preserve reflexive particles if reflexive in {targetLanguage})',
    studentAction:
      'Student conjugates each verb across all subject pronouns or person markers appropriate to {targetLanguage}.',
    requiresSubjectPronouns: true,
  },

  // ============================================================================
  // Category 3: Agglutinative Suffixes & Particle / Case Attachments
  // ============================================================================
  {
    id: 'particle_case_attachment',
    name: 'Particle, Preposition & Case Marker Attachment',
    category: 'Agglutinative & Particles',
    whenToUse:
      'Grammatical particles, postpositions, noun case declensions, or prepositions attached to or governing nouns.',
    whenNotToUse:
      'Rules or languages without case markers or particles for the target grammatical structure.',
    itemCount: 5,
    targetWordsFormat:
      '5 nouns or pronouns in {targetLanguage} testing phonetic harmony, stem changes, or case agreement',
    studentAction:
      'Student writes the noun with the attached particle/case marker or preposition + inflected noun in {targetLanguage}.',
  },
  {
    id: 'stem_ending_inflection',
    name: 'Stem Affix & Ending Inflection',
    category: 'Agglutinative & Particles',
    whenToUse:
      'Agglutinative forms or invariant grammatical rules where verbal/adjectival endings, stem affixes, or honorific suffixes attach uniformly to stems without varying by subject person.',
    whenNotToUse:
      'Rules with full person-varying verb conjugation paradigms (use subject_conjugation instead).',
    itemCount: 5,
    targetWordsFormat:
      '5 base verbs or adjectives in {targetLanguage} testing stem harmony, euphonic changes, or contractions',
    studentAction:
      'Student writes the transformed word or minimal verbal phrase with the affix applied in {targetLanguage}.',
  },

  // ============================================================================
  // Category 4: Agreement & Contrasting Minimal Pairs
  // ============================================================================
  {
    id: 'gender_number_agreement',
    name: 'Gender & Number Agreement Inflection',
    category: 'Agreement & Contrasts',
    whenToUse:
      'Adjective, noun, article, or participle agreement in grammatical gender (e.g. masculine/feminine/neuter) and number (singular/plural).',
    whenNotToUse:
      'Rules or languages lacking grammatical gender/number agreement.',
    itemCount: 5,
    targetWordsFormat:
      '5 prompts pairing a base word or concept in {nativeLanguage} with target agreement conditions described in {nativeLanguage}',
    studentAction:
      'Student writes the correctly inflected form in {targetLanguage}.',
  },
  {
    id: 'contrast_pair_usage',
    name: 'Contrasting Forms & Minimal Pairs Drill',
    category: 'Agreement & Contrasts',
    whenToUse:
      'Distinguishing between two easily confused forms, aspect pairs, or complementary grammatical structures.',
    whenNotToUse:
      'Rules that introduce a single standalone grammatical construction without a direct contrast pair.',
    itemCount: 4,
    targetWordsFormat:
      '4 sentence frames in {targetLanguage} with a blank ("___") and the two contrast choices in parentheses in {targetLanguage}',
    studentAction:
      'Student chooses the correct form from the contrast pair to complete the sentence in {targetLanguage}.',
  },

  // ============================================================================
  // Category 5: Complex Sentences & Clause Connectors
  // ============================================================================
  {
    id: 'clause_connector_combination',
    name: 'Clause Connector & Conjunction Linking',
    category: 'Connectors & Syntax',
    whenToUse:
      'Conjunctions, clause connectors, or subordinating markers linking two clauses into a single coherent sentence.',
    whenNotToUse:
      'Isolated vocabulary or word-level inflection rules.',
    itemCount: 3,
    targetWordsFormat:
      '3 pairs of short clauses in {targetLanguage} separated by " / " (e.g. ["Clause A / Clause B"])',
    studentAction:
      'Student links the two clauses into a single coherent sentence in {targetLanguage} applying appropriate word order.',
  },
];

/**
 * Compact prompt-ready formatter for the Exercise 1 Decision Matrix.
 * Dynamically replaces {targetLanguage} and {nativeLanguage} placeholders with actual languages.
 * Produces a high-density, categorized guide (~250-300 tokens) without language bias.
 */
export function formatExerciseOneMatrix(
  targetLanguage: string,
  nativeLanguage: string,
): string {
  const categories = [
    'Conversational & Social Formulas',
    'Verb Tenses & Conjugation',
    'Agglutinative & Particles',
    'Agreement & Contrasts',
    'Connectors & Syntax',
  ] as const;

  const replacePlaceholders = (text: string) =>
    text
      .replace(/{targetLanguage}/g, targetLanguage)
      .replace(/{nativeLanguage}/g, nativeLanguage);

  const lines: string[] = [];

  for (const category of categories) {
    lines.push(`## ${category}:`);
    const items = EXERCISE1_MATRIX.filter((item) => item.category === category);
    for (const item of items) {
      lines.push(
        `- archetype_id: "${item.id}" (${item.name})\n` +
          `  * When to use: ${replacePlaceholders(item.whenToUse)}\n` +
          `  * Do NOT use when: ${replacePlaceholders(item.whenNotToUse)}\n` +
          `  * targetWords count & format: ${item.itemCount} items -> ${replacePlaceholders(item.targetWordsFormat)}\n` +
          `  * Student writes: ${replacePlaceholders(item.studentAction)}` +
          (item.requiresSubjectPronouns ? `\n  * requires subjectPronouns: YES (appropriate to ${targetLanguage})` : ''),
      );
    }
    lines.push('');
  }

  return lines.join('\n').trim();
}
