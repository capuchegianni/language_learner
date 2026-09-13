export interface RuleExample {
  targetLanguage: string;
  nativeLanguage: string;
}

export interface RuleFormData {
  title: string;
  explanation: string;
  examplesText: string;
  exceptions: string;
}

export const DEFAULT_RULE_FORM: RuleFormData = {
  title: '',
  explanation: '',
  examplesText: '',
  exceptions: '',
};
