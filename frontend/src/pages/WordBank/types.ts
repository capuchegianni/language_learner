export interface WordFormData {
  targetLanguage: string;
  nativeLanguage: string;
  pronunciation?: string;
  partOfSpeech?: string;
  notes?: string;
}

export const DEFAULT_WORD_FORM: WordFormData = {
  targetLanguage: '',
  nativeLanguage: '',
  pronunciation: '',
  partOfSpeech: '',
  notes: '',
};
