import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../../../services/api';
import { useLanguages } from '../../../contexts/LanguageContext';
import {
  SettingsFormData,
  DEFAULT_SETTINGS,
  ProviderPreset,
  PROVIDER_PRESETS,
  ResetInclude,
  ExportInclude,
} from '../types';

export interface UseSettingsStateReturn {
  formData: SettingsFormData;
  savedSettings: SettingsFormData;
  hasApiKey: boolean;
  selectedPreset: ProviderPreset;
  activePreset: ProviderPreset;
  isLocalOllamaBaseURL: boolean;
  hasUnsavedChanges: boolean;
  loading: boolean;
  saving: boolean;
  savedSuccess: boolean;
  resetSuccess: boolean;
  resetMessage: string | null;

  // Form actions
  updateField: <K extends keyof SettingsFormData>(field: K, value: SettingsFormData[K]) => void;
  handleSelectPreset: (preset: ProviderPreset) => void;
  handleDiscard: () => void;
  handleSave: (e?: React.SubmitEvent) => Promise<void>;

  // Reset Modal state & actions
  showResetModal: boolean;
  setShowResetModal: (show: boolean) => void;
  resetInclude: ResetInclude;
  setResetInclude: React.Dispatch<React.SetStateAction<ResetInclude>>;
  resetting: boolean;
  resetError: string | null;
  handleResetData: () => Promise<void>;

  // Delete Account Modal state & actions
  showDeleteAccountModal: boolean;
  setShowDeleteAccountModal: (show: boolean) => void;
  deletingAccount: boolean;
  deleteAccountError: string | null;
  handleDeleteAccount: () => Promise<void>;

  // Import Modal state & actions
  showImportModal: boolean;
  setShowImportModal: (show: boolean) => void;
  overrideSettings: boolean;
  setOverrideSettings: (override: boolean) => void;
  importing: boolean;
  importSuccess: boolean;
  importError: string | null;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleImport: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;

  // Export Modal state & actions
  showExportModal: boolean;
  setShowExportModal: (show: boolean) => void;
  exportInclude: ExportInclude;
  setExportInclude: React.Dispatch<React.SetStateAction<ExportInclude>>;
  exporting: boolean;
  exportError: string | null;
  handleExport: () => Promise<void>;
}

export function useSettingsState(): UseSettingsStateReturn {
  const { refreshLanguages } = useLanguages();
  const [formData, setFormData] = useState<SettingsFormData>(DEFAULT_SETTINGS);
  const [savedSettings, setSavedSettings] = useState<SettingsFormData>(DEFAULT_SETTINGS);
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);
  const [selectedPreset, setSelectedPreset] = useState<ProviderPreset>(PROVIDER_PRESETS[0]);

  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [resetting, setResetting] = useState<boolean>(false);
  const [resetSuccess, setResetSuccess] = useState<boolean>(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  // Reset State
  const [showResetModal, setShowResetModal] = useState<boolean>(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetInclude, setResetInclude] = useState<ResetInclude>({
    settings: false,
    words: false,
    rules: false,
    lessons: false,
  });

  // Delete Account State
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState<boolean>(false);
  const [deletingAccount, setDeletingAccount] = useState<boolean>(false);
  const [deleteAccountError, setDeleteAccountError] = useState<string | null>(null);

  // Import State
  const [showImportModal, setShowImportModal] = useState<boolean>(false);
  const [overrideSettings, setOverrideSettings] = useState<boolean>(false);
  const [importing, setImporting] = useState<boolean>(false);
  const [importSuccess, setImportSuccess] = useState<boolean>(false);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Export State
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [exporting, setExporting] = useState<boolean>(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [exportInclude, setExportInclude] = useState<ExportInclude>({
    settings: true,
    words: true,
    rules: true,
    lessons: true,
  });

  const { model, baseURL, apiKey, nativeLanguage, targetLanguage } = formData;

  const updateField = useCallback(
    <K extends keyof SettingsFormData>(field: K, value: SettingsFormData[K]) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const isLocalOllamaBaseURL = /(^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0):11434\/v1$)|ollama/i.test(
    baseURL,
  );
  const activePreset =
    PROVIDER_PRESETS.find((preset) => preset.baseURL === baseURL) || selectedPreset;

  const hasUnsavedChanges =
    !loading &&
    (baseURL !== savedSettings.baseURL ||
      model !== savedSettings.model ||
      nativeLanguage !== savedSettings.nativeLanguage ||
      targetLanguage !== savedSettings.targetLanguage ||
      (apiKey.trim().length > 0 && !isLocalOllamaBaseURL));

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getSettings();
      const loaded: SettingsFormData = {
        model: data.AI_MODEL || DEFAULT_SETTINGS.model,
        baseURL: data.AI_BASE_URL || DEFAULT_SETTINGS.baseURL,
        apiKey: '',
        nativeLanguage: data.NATIVE_LANGUAGE || DEFAULT_SETTINGS.nativeLanguage,
        targetLanguage: data.TARGET_LANGUAGE || DEFAULT_SETTINGS.targetLanguage,
      };
      setHasApiKey(!!data.hasApiKey);
      setFormData(loaded);
      setSavedSettings(loaded);
      const matchedPreset = PROVIDER_PRESETS.find((p) => p.baseURL === loaded.baseURL);
      if (matchedPreset) setSelectedPreset(matchedPreset);
    } catch (err) {
      console.error('Failed to load settings', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleSelectPreset = useCallback((preset: ProviderPreset) => {
    setSelectedPreset(preset);
    setFormData((prev) => ({
      ...prev,
      baseURL: preset.baseURL,
      model: preset.defaultModel,
      ...(preset.name === 'Ollama (local)' ? { apiKey: '' } : {}),
    }));
  }, []);

  const handleDiscard = useCallback(() => {
    setFormData(savedSettings);
    const matchedPreset = PROVIDER_PRESETS.find(
      (p) => p.baseURL === savedSettings.baseURL,
    );
    if (matchedPreset) setSelectedPreset(matchedPreset);
  }, [savedSettings]);

  const handleSave = useCallback(
    async (e?: React.SubmitEvent) => {
      if (e) e.preventDefault();
      if (nativeLanguage === targetLanguage) return;
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
        }
        const updatedSaved: SettingsFormData = {
          ...formData,
          apiKey: '',
        };
        setFormData(updatedSaved);
        setSavedSettings(updatedSaved);
        setTimeout(() => setSavedSuccess(false), 3000);
      } catch (err) {
        console.error('Failed to save settings', err);
      } finally {
        setSaving(false);
      }
    },
    [
      nativeLanguage,
      targetLanguage,
      model,
      baseURL,
      apiKey,
      isLocalOllamaBaseURL,
      formData,
      refreshLanguages,
    ],
  );

  const handleResetData = useCallback(async () => {
    const selectedKeys = (Object.keys(resetInclude) as (keyof ResetInclude)[]).filter(
      (k) => resetInclude[k],
    );
    if (selectedKeys.length === 0) return;

    const itemsFormatted = selectedKeys
      .map((k) => k.charAt(0).toUpperCase() + k.slice(1))
      .join(', ');

    if (
      !window.confirm(
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
      setResetError(
        err.response?.data?.message ||
          err.message ||
          'Failed to reset data. Please try again.',
      );
    } finally {
      setResetting(false);
    }
  }, [resetInclude, refreshLanguages, loadSettings]);

  const handleDeleteAccount = useCallback(async () => {
    try {
      setDeletingAccount(true);
      setDeleteAccountError(null);
      await api.deleteAccount();
      window.location.href = '/login';
    } catch (err: any) {
      console.error('Failed to delete account', err);
      setDeleteAccountError(
        err.response?.data?.message ||
          err.message ||
          'Failed to delete account. Please try again.',
      );
      setDeletingAccount(false);
    }
  }, []);

  const handleImport = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
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
        await refreshLanguages();
        await loadSettings();
        setImportSuccess(true);
        setShowImportModal(false);
        setTimeout(() => setImportSuccess(false), 4000);
      } catch (err: any) {
        console.error('Failed to import data', err);
        setImportError(
          err.response?.data?.message ||
            err.message ||
            'Failed to import data. Please check your JSON format.',
        );
      } finally {
        setImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    },
    [overrideSettings, refreshLanguages, loadSettings],
  );

  const handleExport = useCallback(async () => {
    try {
      setExporting(true);
      setExportError(null);
      const data = await api.exportData(exportInclude);
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `language-learner-export-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setShowExportModal(false);
    } catch (err: any) {
      setExportError(
        err.response?.data?.message || err.message || 'Export failed. Please try again.',
      );
    } finally {
      setExporting(false);
    }
  }, [exportInclude]);

  return {
    formData,
    savedSettings,
    hasApiKey,
    selectedPreset,
    activePreset,
    isLocalOllamaBaseURL,
    hasUnsavedChanges,
    loading,
    saving,
    savedSuccess,
    resetSuccess,
    resetMessage,

    updateField,
    handleSelectPreset,
    handleDiscard,
    handleSave,

    showResetModal,
    setShowResetModal,
    resetInclude,
    setResetInclude,
    resetting,
    resetError,
    handleResetData,

    showDeleteAccountModal,
    setShowDeleteAccountModal,
    deletingAccount,
    deleteAccountError,
    handleDeleteAccount,

    showImportModal,
    setShowImportModal,
    overrideSettings,
    setOverrideSettings,
    importing,
    importSuccess,
    importError,
    fileInputRef,
    handleImport,

    showExportModal,
    setShowExportModal,
    exportInclude,
    setExportInclude,
    exporting,
    exportError,
    handleExport,
  };
}
