import React, { useEffect, useState, useRef } from 'react';
import { api, API_BASE } from '../services/api';
import { Settings as SettingsIcon, Key, Cpu, Save, CheckCircle2, Trash2, AlertTriangle, ExternalLink, LogOut, User, Upload, Download, X, Globe } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguages } from '../contexts/LanguageContext';

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
  const { user } = useAuth();
  const { refreshLanguages, languages } = useLanguages();
  const [model, setModel] = useState('gpt-4o-mini');
  const [baseURL, setBaseURL] = useState('https://api.openai.com/v1');
  const [apiKey, setApiKey] = useState('');
  const [hasApiKey, setHasApiKey] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<ProviderPreset>(PROVIDER_PRESETS[0]);
  const [nativeLanguage, setNativeLanguage] = useState('English');
  const [targetLanguage, setTargetLanguage] = useState('Korean');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  // Reset State
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetInclude, setResetInclude] = useState({
    settings: false,
    words: false,
    rules: false,
    lessons: false,
  });

  // Delete Account State
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deleteAccountError, setDeleteAccountError] = useState<string | null>(null);

  // Import State
  const [showImportModal, setShowImportModal] = useState(false);
  const [overrideSettings, setOverrideSettings] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Export State
  const [showExportModal, setShowExportModal] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [exportInclude, setExportInclude] = useState({
    settings: true,
    words: true,
    rules: true,
    lessons: true,
  });

  const isLocalOllamaBaseURL = /(^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0):11434\/v1$)|ollama/i.test(baseURL);
  const activePreset = PROVIDER_PRESETS.find((preset) => preset.baseURL === baseURL) || selectedPreset;

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await api.getSettings();
      const savedBaseURL = data.AI_BASE_URL || 'https://api.openai.com/v1';
      const savedModel = data.AI_MODEL || 'gpt-4o-mini';
      setHasApiKey(!!data.hasApiKey);
      setApiKey('');
      setBaseURL(savedBaseURL);
      setModel(savedModel);
      const matchedPreset = PROVIDER_PRESETS.find((p) => p.baseURL === savedBaseURL);
      if (matchedPreset) setSelectedPreset(matchedPreset);
      setNativeLanguage(data.NATIVE_LANGUAGE || 'English');
      setTargetLanguage(data.TARGET_LANGUAGE || 'Korean');
    } catch (err) {
      console.error('Failed to load settings', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSelectPreset = (preset: ProviderPreset) => {
    setSelectedPreset(preset);
    setBaseURL(preset.baseURL);
    setModel(preset.defaultModel);
    if (preset.name === 'Ollama (local)') {
      setApiKey('');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await api.updateSettings({
        AI_MODEL: model,
        AI_BASE_URL: baseURL,
        NATIVE_LANGUAGE: nativeLanguage,
        TARGET_LANGUAGE: targetLanguage,
        ...(apiKey.trim() && !isLocalOllamaBaseURL ? { api_key: apiKey.trim() } : {}),
      });
      await refreshLanguages();
      setSavedSuccess(true);
      if (apiKey.trim() && !isLocalOllamaBaseURL) {
        setHasApiKey(true);
        setApiKey('');
      }
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save settings', err);
    } finally {
      setSaving(false);
    }
  };

  const handleResetData = async () => {
    const selectedKeys = (Object.keys(resetInclude) as (keyof typeof resetInclude)[]).filter(
      (k) => resetInclude[k],
    );
    if (selectedKeys.length === 0) return;

    const itemsFormatted = selectedKeys
      .map((k) => k.charAt(0).toUpperCase() + k.slice(1))
      .join(', ');

    if (
      !confirm(
        `Are you sure you want to permanently reset: ${itemsFormatted}? This action cannot be undone.`,
      )
    ) {
      return;
    }

    try {
      setResetting(true);
      setResetError(null);
      const res = await api.resetData(resetInclude);

      if (resetInclude.settings) {
        await refreshLanguages();
        await loadSettings();
      }

      setResetSuccess(true);
      setResetMessage(res.message || 'Data reset successfully!');
      setShowResetModal(false);
      setTimeout(() => {
        setResetSuccess(false);
        setResetMessage(null);
      }, 4000);
    } catch (err: any) {
      console.error('Failed to reset data', err);
      setResetError(err.response?.data?.message || err.message || 'Failed to reset data. Please try again.');
    } finally {
      setResetting(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setDeletingAccount(true);
      setDeleteAccountError(null);
      await api.deleteAccount();
      window.location.href = '/login';
    } catch (err: any) {
      console.error('Failed to delete account', err);
      setDeleteAccountError(err.response?.data?.message || err.message || 'Failed to delete account. Please try again.');
      setDeletingAccount(false);
    }
  };


  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setImporting(true);
      setImportError(null);
      setImportSuccess(false);

      const text = await file.text();
      const jsonData = JSON.parse(text);
      jsonData.overrideSettings = overrideSettings;

      await api.importData(jsonData);
      setImportSuccess(true);
      setShowImportModal(false);
      setTimeout(() => setImportSuccess(false), 4000);

      // reload settings just in case they were updated
      const data = await api.getSettings();
      const savedBaseURL = data.AI_BASE_URL || 'https://api.openai.com/v1';
      const savedModel = data.AI_MODEL || 'gpt-4o-mini';
      setHasApiKey(!!data.hasApiKey);
      setApiKey('');
      setBaseURL(savedBaseURL);
      setModel(savedModel);
      const matchedPreset = PROVIDER_PRESETS.find((p) => p.baseURL === savedBaseURL);
      if (matchedPreset) setSelectedPreset(matchedPreset);
      setNativeLanguage(data.NATIVE_LANGUAGE || 'English');
      setTargetLanguage(data.TARGET_LANGUAGE || 'Korean');
    } catch (err: any) {
      console.error('Failed to import data', err);
      setImportError(err.response?.data?.message || err.message || 'Failed to import data. Please check your JSON format.');
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (loading) {
    return (
      <div className="glass-card" style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
        <div className="spinner" />
      </div>
    );
  }

  const handleLogout = () => {
    window.location.href = `${API_BASE}/auth/logout`;
  };

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

      {/* Account Section */}
      <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-success)' }}>
          <User size={20} />
          <span>Account</span>
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.displayName}
                style={{ width: 48, height: 48, borderRadius: '50%', border: '2px solid var(--border-color-glow)' }}
                referrerPolicy="no-referrer"
              />
            ) : (
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--gradient-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 700 }}>
                {user?.displayName?.[0] || '?'}
              </div>
            )}
            <div>
              <div style={{ fontWeight: 600, fontSize: '1rem' }}>{user?.displayName}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{user?.email}</div>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleLogout}
            style={{ gap: '0.5rem' }}
            id="logout-button"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
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
          <span>{resetMessage || 'Data has been reset successfully!'}</span>
        </div>
      )}

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Language Preferences */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-secondary)' }}>
            <Globe size={20} />
            <span>Language Preferences</span>
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
            Choose your native language and the language you want to learn. All AI-generated lessons, exercises, and feedback will adapt to your selection.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <div className="input-group">
              <label>I speak (native language)</label>
              <select
                value={nativeLanguage}
                onChange={(e) => setNativeLanguage(e.target.value)}
                id="native-language-select"
                style={{ width: '100%' }}
              >
                {languages.map((lang) => (
                  <option key={`native-${lang.name}`} value={lang.name}>{lang.name}</option>
                ))}
              </select>
            </div>
            <div className="input-group">
              <label>I want to learn</label>
              <select
                value={targetLanguage}
                onChange={(e) => setTargetLanguage(e.target.value)}
                id="target-language-select"
                style={{ width: '100%' }}
              >
                {languages.filter((lang) => lang.name !== nativeLanguage).map((lang) => (
                  <option key={`target-${lang.name}`} value={lang.name}>{lang.name}</option>
                ))}
              </select>
            </div>
          </div>

          {nativeLanguage === targetLanguage && (
            <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: 'var(--accent-danger)', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--radius-sm)', padding: '0.6rem 0.85rem' }}>
              ⚠️ Native and target languages cannot be the same.
            </div>
          )}
        </div>

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
              <a href={activePreset.docsURL} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.78rem', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <ExternalLink size={12} /> {activePreset.name} docs
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
              {activePreset.exampleModels.map((m) => <option key={m} value={m} />)}
            </datalist>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.25rem' }}>
              Suggestions: {activePreset.exampleModels.join(', ')}
            </span>
          </div>

          {!isLocalOllamaBaseURL ? (
            <>
              <div className="input-group" style={{ marginBottom: '1.25rem' }}>
                <label>API Key</label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={hasApiKey ? 'Stored securely - enter a new key to replace it' : 'sk-...'}
                  autoComplete="new-api-key"
                  spellCheck={false}
                />
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.25rem' }}>
                  {hasApiKey && !apiKey ? 'A key is already stored securely. Leave this blank to keep it unchanged.' : 'The key is encrypted in the database and never returned to the browser.'}
                </span>
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 'var(--radius-sm)', padding: '0.65rem 0.9rem', marginBottom: '1.25rem' }}>
                🔑 The API key is stored encrypted in the database and is never sent back to the browser.
              </div>
            </>
          ) : (
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 'var(--radius-sm)', padding: '0.65rem 0.9rem', marginBottom: '1.25rem' }}>
              Ollama runs locally and does not require an API key.
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-primary" style={{ minWidth: '180px' }} disabled={saving}>
              {saving ? (
                <><div className="spinner" /><span>Saving...</span></>
              ) : (
                <><Save size={18} /><span>Save Settings</span></>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Import / Export Data Section */}
      <div className="glass-card" style={{ marginTop: '1.5rem', borderColor: 'rgba(99,102,241,0.3)', background: 'rgba(99,102,241,0.05)' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-primary)' }}>
          <Upload size={20} />
          <span>Import / Export Data</span>
        </h3>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          Import or export your words, rules, lessons, and settings as a JSON file.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setShowImportModal(true)}
          >
            <Download size={16} />
            <span>Import JSON File</span>
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => { setExportError(null); setShowExportModal(true); }}
          >
            <Upload size={16} />
            <span>Export Data</span>
          </button>
        </div>
      </div>

      {importSuccess && (
        <div className="glass-card" style={{ marginTop: '1.5rem', background: 'rgba(16,185,129,0.15)', borderColor: 'rgba(16,185,129,0.4)', display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#6ee7b7' }}>
          <CheckCircle2 size={20} />
          <span>Data imported successfully!</span>
        </div>
      )}

      {/* Danger Zone */}
      <div className="glass-card" style={{ marginTop: '1.5rem', borderColor: 'rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.05)' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-danger)' }}>
          <AlertTriangle size={20} />
          <span>Danger Zone</span>
        </h3>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
          Irreversible actions for your data and account. Proceed with caution.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Reset Specific Data */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', paddingBottom: '1.25rem', borderBottom: '1px solid rgba(239,68,68,0.15)' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#fff' }}>Reset Specific Data</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                Select specific data categories (Settings, Words, Rules, Lessons) to permanently clear.
              </div>
            </div>
            <button
              type="button"
              className="btn"
              id="open-reset-modal-btn"
              style={{ background: 'rgba(239,68,68,0.15)', color: 'var(--accent-danger)', border: '1px solid rgba(239,68,68,0.3)', whiteSpace: 'nowrap' }}
              onClick={() => {
                setResetError(null);
                setShowResetModal(true);
              }}
            >
              <Trash2 size={16} />
              <span>Reset Data...</span>
            </button>
          </div>

          {/* Delete Account */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#fff' }}>Delete Account</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                Permanently delete your user account and all associated data.
              </div>
            </div>
            <button
              type="button"
              className="btn"
              id="open-delete-account-modal-btn"
              style={{ background: 'rgba(239,68,68,0.15)', color: 'var(--accent-danger)', border: '1px solid rgba(239,68,68,0.3)', whiteSpace: 'nowrap' }}
              onClick={() => {
                setDeleteAccountError(null);
                setShowDeleteAccountModal(true);
              }}
            >
              <Trash2 size={16} />
              <span>Delete Account...</span>
            </button>
          </div>
        </div>

      </div>

      {/* Import Modal */}
      {showImportModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-card" style={{ width: '90%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
            <button
              onClick={() => setShowImportModal(false)}
              style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
            >
              <X size={24} />
            </button>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '1rem', color: '#fff' }}>Import Data</h3>

            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Your JSON file should have the following structure. Any fields not matching the format will be skipped.
            </p>
            <pre style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', color: 'var(--text-muted)', overflowX: 'auto', marginBottom: '1rem' }}>
              {`{
  "settings": [{ "key": "AI_MODEL", "value": "gpt-4o-mini" }],
  "words": [
    { "targetLanguage": "안녕하세요", "nativeLanguage": "Hello", "pronunciation": "annyeonghaseyo", "partOfSpeech": "noun", "notes": "" }
  ],
  "rules": [
    { "title": "Present Tense", "explanation": "Add -아요/어요", "examples": "[]" }
  ],
  "lessons": [
    { "title": "First Lesson", "ruleTitle": "Present Tense", "lessonData": "{}", "targetWords": ["안녕하세요"] }
  ]
}`}
            </pre>

            {importError && (
              <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.5)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', color: '#fca5a5', marginBottom: '1rem', fontSize: '0.85rem' }}>
                {importError}
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <input
                type="checkbox"
                id="overrideSettings"
                checked={overrideSettings}
                onChange={(e) => setOverrideSettings(e.target.checked)}
              />
              <label htmlFor="overrideSettings" style={{ fontSize: '0.9rem', color: '#fff', cursor: 'pointer' }}>
                Override settings if data exists
              </label>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button className="btn btn-secondary" onClick={() => setShowImportModal(false)}>Cancel</button>
              <label className="btn btn-primary" style={{ cursor: 'pointer' }}>
                {importing ? (
                  <><div className="spinner" /><span>Importing...</span></>
                ) : (
                  <><Upload size={18} /><span>Select & Import JSON</span></>
                )}
                <input
                  type="file"
                  accept=".json,application/json"
                  style={{ display: 'none' }}
                  ref={fileInputRef}
                  onChange={handleImport}
                  disabled={importing}
                />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-card" style={{ width: '90%', maxWidth: '500px', position: 'relative' }}>
            <button
              onClick={() => setShowExportModal(false)}
              style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
            >
              <X size={24} />
            </button>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem', color: '#fff' }}>Export Data</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Select which data you would like to include in the exported JSON file.
            </p>
            <div style={{ fontSize: '0.82rem', color: '#fbbf24', background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.3)', borderRadius: 'var(--radius-sm)', padding: '0.6rem 0.85rem', marginBottom: '1.5rem' }}>
              ⚠️ Your API key is never included in the export for security reasons.
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
              {(['settings', 'words', 'rules', 'lessons'] as const).map((key) => (
                <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', padding: '0.65rem 0.9rem', borderRadius: 'var(--radius-sm)', border: `1px solid ${exportInclude[key] ? 'var(--accent-primary)' : 'var(--border-color)'}`, background: exportInclude[key] ? 'rgba(99,102,241,0.1)' : 'transparent', transition: 'all 0.15s ease' }}>
                  <input
                    type="checkbox"
                    checked={exportInclude[key]}
                    onChange={(e) => setExportInclude((prev) => ({ ...prev, [key]: e.target.checked }))}
                  />
                  <span style={{ fontWeight: 600, textTransform: 'capitalize', color: exportInclude[key] ? '#fff' : 'var(--text-secondary)' }}>{key}</span>
                </label>
              ))}
            </div>

            {exportError && (
              <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.5)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', color: '#fca5a5', marginBottom: '1rem', fontSize: '0.85rem' }}>
                {exportError}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button className="btn btn-secondary" onClick={() => setShowExportModal(false)}>Cancel</button>
              <button
                className="btn btn-primary"
                disabled={exporting || !Object.values(exportInclude).some(Boolean)}
                onClick={async () => {
                  try {
                    setExporting(true);
                    setExportError(null);
                    const data = await api.exportData(exportInclude);
                    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `language-learner-export-${new Date().toISOString().slice(0, 10)}.json`;
                    a.click();
                    URL.revokeObjectURL(url);
                    setShowExportModal(false);
                  } catch (err: any) {
                    setExportError(err.response?.data?.message || err.message || 'Export failed. Please try again.');
                  } finally {
                    setExporting(false);
                  }
                }}
              >
                {exporting ? (
                  <><div className="spinner" /><span>Exporting...</span></>
                ) : (
                  <><Download size={18} /><span>Download JSON</span></>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Modal */}
      {showResetModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-card" style={{ width: '90%', maxWidth: '520px', position: 'relative', borderColor: 'rgba(239,68,68,0.4)' }}>
            <button
              onClick={() => setShowResetModal(false)}
              style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
            >
              <X size={24} />
            </button>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--accent-danger)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertTriangle size={22} />
              <span>Reset Data</span>
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Select which data you would like to permanently delete from your account.
            </p>
            <div style={{ fontSize: '0.82rem', color: '#fca5a5', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-sm)', padding: '0.6rem 0.85rem', marginBottom: '1.25rem' }}>
              ⚠️ Warning: Selected data will be permanently removed. This action cannot be undone.
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Choose items to delete:</span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  style={{ background: 'transparent', border: 'none', color: 'var(--accent-primary)', fontSize: '0.78rem', cursor: 'pointer', textDecoration: 'underline' }}
                  onClick={() => setResetInclude({ settings: true, words: true, rules: true, lessons: true })}
                >
                  Select All
                </button>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>|</span>
                <button
                  type="button"
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '0.78rem', cursor: 'pointer', textDecoration: 'underline' }}
                  onClick={() => setResetInclude({ settings: false, words: false, rules: false, lessons: false })}
                >
                  Deselect All
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
              {(['settings', 'words', 'rules', 'lessons'] as const).map((key) => (
                <label
                  key={key}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    cursor: 'pointer',
                    padding: '0.65rem 0.9rem',
                    borderRadius: 'var(--radius-sm)',
                    border: `1px solid ${resetInclude[key] ? 'var(--accent-danger)' : 'var(--border-color)'}`,
                    background: resetInclude[key] ? 'rgba(239,68,68,0.1)' : 'transparent',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={resetInclude[key]}
                    onChange={(e) => setResetInclude((prev) => ({ ...prev, [key]: e.target.checked }))}
                  />
                  <span style={{ fontWeight: 600, textTransform: 'capitalize', color: resetInclude[key] ? '#fca5a5' : 'var(--text-secondary)' }}>
                    {key}
                  </span>
                </label>
              ))}
            </div>

            {resetError && (
              <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.5)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', color: '#fca5a5', marginBottom: '1rem', fontSize: '0.85rem' }}>
                {resetError}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button className="btn btn-secondary" onClick={() => setShowResetModal(false)} disabled={resetting}>
                Cancel
              </button>
              <button
                className="btn"
                id="confirm-reset-btn"
                style={{ background: 'var(--accent-danger)', color: '#fff' }}
                disabled={resetting || !Object.values(resetInclude).some(Boolean)}
                onClick={handleResetData}
              >
                {resetting ? (
                  <><div className="spinner" /><span>Resetting...</span></>
                ) : (
                  <><Trash2 size={18} /><span>Reset Selected Data</span></>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteAccountModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-card" style={{ width: '90%', maxWidth: '500px', position: 'relative', borderColor: 'rgba(239,68,68,0.5)' }}>
            <button
              onClick={() => setShowDeleteAccountModal(false)}
              style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
            >
              <X size={24} />
            </button>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--accent-danger)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertTriangle size={22} />
              <span>Delete Account</span>
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Are you sure you want to permanently delete your account (<strong>{user?.email}</strong>)?
            </p>
            <div style={{ fontSize: '0.82rem', color: '#fca5a5', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 0.9rem', marginBottom: '1.25rem', lineHeight: '1.4' }}>
              ⚠️ <strong>Warning:</strong> All your progress, vocabulary words, grammar rules, completed lessons, exercise scores, and settings will be permanently wiped. You will be logged out immediately and cannot recover this data.
            </div>

            {deleteAccountError && (
              <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.5)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', color: '#fca5a5', marginBottom: '1rem', fontSize: '0.85rem' }}>
                {deleteAccountError}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button className="btn btn-secondary" onClick={() => setShowDeleteAccountModal(false)} disabled={deletingAccount}>
                Cancel
              </button>
              <button
                className="btn"
                id="confirm-delete-account-btn"
                style={{ background: 'var(--accent-danger)', color: '#fff' }}
                disabled={deletingAccount}
                onClick={handleDeleteAccount}
              >
                {deletingAccount ? (
                  <><div className="spinner" /><span>Deleting Account...</span></>
                ) : (
                  <><Trash2 size={16} /><span>Permanently Delete Account</span></>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


