export interface ProviderPreset {
  name: string;
  baseURL: string;
  defaultModel: string;
  docsURL: string;
  exampleModels: string[];
}

export const PROVIDER_PRESETS: ProviderPreset[] = [
  {
    name: 'OpenAI',
    baseURL: 'https://api.openai.com/v1',
    defaultModel: 'gpt-4o-mini',
    docsURL: 'https://platform.openai.com/docs/models',
    exampleModels: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo', 'o1-preview', 'o1-mini'],
  },
  {
    name: 'Google Gemini',
    baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
    defaultModel: 'gemini-2.5-flash',
    docsURL: 'https://ai.google.dev/gemini-api/docs/openai',
    exampleModels: ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-1.5-flash', 'gemini-1.5-pro'],
  },
  {
    name: 'Anthropic Claude',
    baseURL: 'https://api.anthropic.com/v1',
    defaultModel: 'claude-sonnet-4-5',
    docsURL: 'https://docs.anthropic.com/en/docs/about-claude/models',
    exampleModels: ['claude-opus-4-5', 'claude-sonnet-4-5', 'claude-haiku-4-5', 'claude-3-5-sonnet-latest', 'claude-3-5-haiku-latest'],
  },
  {
    name: 'Groq',
    baseURL: 'https://api.groq.com/openai/v1',
    defaultModel: 'llama-3.3-70b-versatile',
    docsURL: 'https://console.groq.com/docs/models',
    exampleModels: ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768', 'gemma2-9b-it'],
  },
  {
    name: 'Mistral',
    baseURL: 'https://api.mistral.ai/v1',
    defaultModel: 'mistral-small-latest',
    docsURL: 'https://docs.mistral.ai/getting-started/models/',
    exampleModels: ['mistral-large-latest', 'mistral-small-latest', 'open-mistral-7b', 'codestral-latest'],
  },
  {
    name: 'DeepSeek',
    baseURL: 'https://api.deepseek.com',
    defaultModel: 'deepseek-chat',
    docsURL: 'https://api-docs.deepseek.com/',
    exampleModels: ['deepseek-chat', 'deepseek-reasoner'],
  },
  {
    name: 'xAI (Grok)',
    baseURL: 'https://api.x.ai/v1',
    defaultModel: 'grok-2-latest',
    docsURL: 'https://docs.x.ai/docs',
    exampleModels: ['grok-2-latest', 'grok-2-mini', 'grok-beta'],
  },
  {
    name: 'Ollama (local)',
    baseURL: 'http://localhost:11434/v1',
    defaultModel: 'llama3',
    docsURL: 'https://ollama.com/library',
    exampleModels: ['llama3', 'mistral', 'gemma2', 'phi3', 'qwen2'],
  },
];

export interface SettingsFormData {
  model: string;
  baseURL: string;
  apiKey: string;
  nativeLanguage: string;
  targetLanguage: string;
}

export const DEFAULT_SETTINGS: SettingsFormData = {
  model: 'gpt-4o-mini',
  baseURL: 'https://api.openai.com/v1',
  apiKey: '',
  nativeLanguage: 'English',
  targetLanguage: 'Korean',
};

export interface ResetInclude {
  settings: boolean;
  words: boolean;
  rules: boolean;
  lessons: boolean;
}

export interface ExportInclude {
  settings: boolean;
  words: boolean;
  rules: boolean;
  lessons: boolean;
}
