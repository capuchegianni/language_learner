import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Settings as SettingsIcon, Key, Cpu, Save, CheckCircle2, Trash2, AlertTriangle, ExternalLink } from 'lucide-react';

interface ProviderPreset {
  name: string;
  baseURL: string;
  defaultModel: string;
  docsURL: string;
  exampleModels: string[];
}

const PROVIDER_PRESETS: ProviderPreset[] = [
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

export const Settings: React.FC = () => {
  const [model, setModel] = useState('gpt-4o-mini');
  const [baseURL, setBaseURL] = useState('https://api.openai.com/v1');
  const [selectedPreset, setSelectedPreset] = useState<ProviderPreset>(PROVIDER_PRESETS[0]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const data = await api.getSettings();
        const savedBaseURL = data.AI_BASE_URL || 'https://api.openai.com/v1';
        const savedModel = data.AI_MODEL || 'gpt-4o-mini';
        setBaseURL(savedBaseURL);
        setModel(savedModel);
        const matchedPreset = PROVIDER_PRESETS.find((p) => p.baseURL === savedBaseURL);
        if (matchedPreset) setSelectedPreset(matchedPreset);
      } catch (err) {
        console.error('Failed to load settings', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSelectPreset = (preset: ProviderPreset) => {
    setSelectedPreset(preset);
    setBaseURL(preset.baseURL);
    setModel(preset.defaultModel);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await api.updateSettings({
        AI_MODEL: model,
        AI_BASE_URL: baseURL,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save settings', err);
    } finally {
      setSaving(false);
    }
  };

  const handleResetStats = async () => {
    if (!confirm('Are you sure you want to reset all lesson history? This will delete all completed lessons, recent lessons, and scores. Words and rules will NOT be affected.')) return;
    try {
      setResetting(true);
      await api.resetStats();
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 4000);
    } catch (err) {
      console.error('Failed to reset stats', err);
    } finally {
      setResetting(false);
    }
  };

  if (loading) {
    return (
      <div className="glass-card" style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '750px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <SettingsIcon style={{ color: 'var(--accent-primary)' }} />
          <span>AI & Application Settings</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Configure any OpenAI-compatible AI provider. All providers share the same unified API format.
        </p>
      </div>

      {savedSuccess && (
        <div className="glass-card" style={{ marginBottom: '1.5rem', background: 'rgba(16,185,129,0.15)', borderColor: 'rgba(16,185,129,0.4)', display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#6ee7b7' }}>
          <CheckCircle2 size={20} />
          <span>Settings saved successfully!</span>
        </div>
      )}

      {resetSuccess && (
        <div className="glass-card" style={{ marginBottom: '1.5rem', background: 'rgba(16,185,129,0.15)', borderColor: 'rgba(16,185,129,0.4)', display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#6ee7b7' }}>
          <CheckCircle2 size={20} />
          <span>Lesson history has been reset successfully!</span>
        </div>
      )}

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Provider Presets */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-secondary)' }}>
            <Cpu size={20} />
            <span>Provider Presets</span>
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Select a preset to autofill the base URL and a suggested model, or configure them manually below.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
            {PROVIDER_PRESETS.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className="btn"
                style={{
                  padding: '0.4rem 0.9rem',
                  fontSize: '0.85rem',
                  background: selectedPreset.name === preset.name ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${selectedPreset.name === preset.name ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                  color: selectedPreset.name === preset.name ? '#fff' : 'var(--text-secondary)',
                }}
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        {/* Configuration */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-purple)' }}>
            <Key size={20} />
            <span>Configuration</span>
          </h3>

          <div className="input-group" style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>Base URL</span>
              <a href={selectedPreset.docsURL} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.78rem', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <ExternalLink size={12} /> {selectedPreset.name} docs
              </a>
            </label>
            <input
              type="text"
              value={baseURL}
              onChange={(e) => setBaseURL(e.target.value)}
              placeholder="https://api.openai.com/v1"
            />
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.25rem' }}>
              The OpenAI-compatible endpoint for your chosen provider.
            </span>
          </div>

          <div className="input-group" style={{ marginBottom: '1.25rem' }}>
            <label>Model</label>
            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="e.g. gpt-4o-mini"
              list="model-suggestions"
            />
            <datalist id="model-suggestions">
              {selectedPreset.exampleModels.map((m) => <option key={m} value={m} />)}
            </datalist>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.25rem' }}>
              Suggestions: {selectedPreset.exampleModels.join(', ')}
            </span>
          </div>

          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 'var(--radius-sm)', padding: '0.65rem 0.9rem' }}>
            🔑 The API key is configured via the <code style={{ fontFamily: 'monospace', color: 'var(--accent-primary)' }}>API_KEY</code> environment variable and is never stored in the database.
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit" className="btn btn-primary" style={{ minWidth: '180px' }} disabled={saving}>
            {saving ? (
              <><div className="spinner" /><span>Saving...</span></>
            ) : (
              <><Save size={18} /><span>Save Settings</span></>
            )}
          </button>
        </div>
      </form>

      {/* Danger Zone */}
      <div className="glass-card" style={{ marginTop: '1.5rem', borderColor: 'rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.05)' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-danger)' }}>
          <AlertTriangle size={20} />
          <span>Danger Zone</span>
        </h3>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          Reset all lesson history including completed lessons, recent lessons, and scores. Words and grammar rules in your bank will <strong>not</strong> be affected.
        </p>
        <button
          type="button"
          className="btn"
          style={{ background: 'rgba(239,68,68,0.15)', color: 'var(--accent-danger)', border: '1px solid rgba(239,68,68,0.3)' }}
          onClick={handleResetStats}
          disabled={resetting}
        >
          {resetting ? <><div className="spinner" /><span>Resetting...</span></> : <><Trash2 size={16} /><span>Reset Lesson History & Scores</span></>}
        </button>
      </div>
    </div>
  );
};
