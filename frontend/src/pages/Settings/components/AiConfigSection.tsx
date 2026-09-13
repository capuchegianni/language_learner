import React from 'react';
import { Key, ExternalLink } from 'lucide-react';
import { ProviderPreset, SettingsFormData } from '../types';

export interface AiConfigSectionProps {
  baseURL: string;
  model: string;
  apiKey: string;
  hasApiKey: boolean;
  activePreset: ProviderPreset;
  isLocalOllamaBaseURL: boolean;
  onUpdateField: <K extends keyof SettingsFormData>(field: K, value: SettingsFormData[K]) => void;
}

export const AiConfigSection: React.FC<AiConfigSectionProps> = ({
  baseURL,
  model,
  apiKey,
  hasApiKey,
  activePreset,
  isLocalOllamaBaseURL,
  onUpdateField,
}) => {
  return (
    <div className="glass-card" id="tutorial-ai-config">
      <h3 className="settings-section-title config-title">
        <Key size={20} />
        <span>Configuration</span>
      </h3>

      <div className="input-group settings-input-group">
        <label
          htmlFor="ai-base-url-input"
          className="settings-label-with-link"
        >
          <span>Base URL</span>
          <a
            href={activePreset.docsURL}
            target="_blank"
            rel="noopener noreferrer"
            className="settings-docs-link"
          >
            <ExternalLink size={12} /> {activePreset.name} docs
          </a>
        </label>
        <input
          id="ai-base-url-input"
          type="text"
          value={baseURL}
          onChange={(e) => onUpdateField('baseURL', e.target.value)}
          placeholder="https://api.openai.com/v1"
        />
        <span className="settings-input-hint">
          The OpenAI-compatible endpoint for your chosen provider.
        </span>
      </div>

      <div className="input-group settings-input-group">
        <label htmlFor="ai-model-input">Model</label>
        <input
          id="ai-model-input"
          type="text"
          value={model}
          onChange={(e) => onUpdateField('model', e.target.value)}
          placeholder="e.g. gpt-4o-mini"
          list="model-suggestions"
        />
        <datalist id="model-suggestions">
          {activePreset.exampleModels.map((m) => (
            <option key={m} value={m} />
          ))}
        </datalist>
        <span className="settings-input-hint">
          Suggestions: {activePreset.exampleModels.join(', ')}
        </span>
      </div>

      {!isLocalOllamaBaseURL ? (
        <>
          <div className="input-group settings-input-group">
            <label htmlFor="ai-api-key-input">API Key</label>
            <input
              id="ai-api-key-input"
              type="password"
              value={apiKey}
              onChange={(e) => onUpdateField('apiKey', e.target.value)}
              placeholder={
                hasApiKey
                  ? 'Stored securely - enter a new key to replace it'
                  : 'sk-...'
              }
              autoComplete="new-api-key"
              spellCheck={false}
            />
            <span className="settings-input-hint">
              {hasApiKey && !apiKey
                ? 'A key is already stored securely. Leave this blank to keep it unchanged.'
                : 'The key is encrypted in the database and never returned to the browser.'}
            </span>
          </div>
          <div className="settings-info-box settings-info-box-primary">
            🔑 The API key is stored encrypted in the database and is never sent back to the browser.
          </div>
        </>
      ) : (
        <div className="settings-info-box settings-info-box-success">
          Ollama runs locally and does not require an API key.
        </div>
      )}
    </div>
  );
};
