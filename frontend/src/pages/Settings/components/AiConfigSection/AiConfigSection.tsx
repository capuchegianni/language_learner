import React from 'react';
import './AiConfigSection.css';
import { Card, Input } from '../../../../components';
import { IconKeySkeleton, IconExternalWire, IconApprovalCheck } from '../../../../components/icons';
import { ProviderPreset, SettingsFormData } from '../../types';

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
    <Card className="settings-card" id="tutorial-ai-config">
      <h3 className="settings-section-title">
        <IconKeySkeleton size={20} />
        <span>Configuration</span>
      </h3>

      <Input
        id="ai-base-url-input"
        label={
          <div className="settings-label-with-link">
            <span>Base URL</span>
            <a
              href={activePreset.docsURL}
              target="_blank"
              rel="noopener noreferrer"
              className="settings-docs-link"
            >
              <IconExternalWire size={12} /> {activePreset.name} docs
            </a>
          </div>
        }
        containerClassName="settings-input-group"
        value={baseURL}
        onChange={(e) => onUpdateField('baseURL', e.target.value)}
        placeholder="https://api.openai.com/v1"
        hint="The OpenAI-compatible endpoint for your chosen provider."
      />

      <Input
        id="ai-model-input"
        label="Model"
        containerClassName="settings-input-group"
        value={model}
        onChange={(e) => onUpdateField('model', e.target.value)}
        placeholder="e.g. gpt-4o-mini"
        list="model-suggestions"
        hint={`Suggestions: ${activePreset.exampleModels.join(', ')}`}
      />
      <datalist id="model-suggestions">
        {activePreset.exampleModels.map((m) => (
          <option key={m} value={m} />
        ))}
      </datalist>

      {!isLocalOllamaBaseURL ? (
        <>
          <Input
            id="ai-api-key-input"
            label="API Key"
            type="password"
            containerClassName="settings-input-group"
            value={apiKey}
            onChange={(e) => onUpdateField('apiKey', e.target.value)}
            placeholder={
              hasApiKey
                ? 'Stored securely - enter a new key to replace it'
                : 'sk-...'
            }
            autoComplete="new-api-key"
            spellCheck={false}
            hint={
              hasApiKey && !apiKey
                ? 'A key is already stored securely. Leave this blank to keep it unchanged.'
                : 'The key is encrypted in the database and never returned to the browser.'
            }
          />
          <div className="settings-info-box settings-info-box-primary">
            <IconKeySkeleton size={16} />
            <span>The API key is stored encrypted in the database and is never sent back to the browser.</span>
          </div>
        </>
      ) : (
        <div className="settings-info-box settings-info-box-success">
          <IconApprovalCheck size={16} />
          <span>Ollama runs locally and does not require an API key.</span>
        </div>
      )}
    </Card>
  );
};
