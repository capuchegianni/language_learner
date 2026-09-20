import React from 'react';
import { Settings as SettingsIcon, CheckCircle2 } from 'lucide-react';
import { useSettingsState } from './hooks/useSettingsState';
import { PageHeader, LoadingSpinner, Card } from '../../components';
import { AccountSection } from './components/AccountSection/AccountSection';
import { LanguageSection } from './components/LanguageSection/LanguageSection';
import { ProviderPresetsSection } from './components/ProviderPresetsSection/ProviderPresetsSection';
import { AiConfigSection } from './components/AiConfigSection/AiConfigSection';
import { ImportExportSection } from './components/ImportExportSection/ImportExportSection';
import { DangerZoneSection } from './components/DangerZoneSection/DangerZoneSection';
import { ImportModal } from './components/ImportModal/ImportModal';
import { ExportModal } from './components/ExportModal/ExportModal';
import { ResetDataModal } from './components/ResetDataModal/ResetDataModal';
import { DeleteAccountModal } from './components/DeleteAccountModal/DeleteAccountModal';
import { UnsavedChangesBanner } from './components/UnsavedChangesBanner/UnsavedChangesBanner';
import './Settings.css';

export const Settings: React.FC = () => {
  const {
    formData,
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
  } = useSettingsState();

  if (loading) {
    return <LoadingSpinner variant="card" size={32} />;
  }

  const { baseURL, model, apiKey, nativeLanguage, targetLanguage } = formData;
  const canSave = nativeLanguage !== targetLanguage;

  return (
    <div className="settings-container">
      <PageHeader
        icon={<SettingsIcon className="settings-header-icon" />}
        title="AI &amp; Application Settings"
        subtitle="Configure any OpenAI-compatible AI provider. All providers share the same unified API format."
      />

      {/* Account Section */}
      <AccountSection />

      {/* Save Success Alert */}
      {savedSuccess && (
        <Card className="settings-success-alert">
          <CheckCircle2 size={20} />
          <span>Settings saved successfully!</span>
        </Card>
      )}

      {/* Reset Success Alert */}
      {resetSuccess && (
        <Card className="settings-success-alert">
          <CheckCircle2 size={20} />
          <span>{resetMessage || 'Data has been reset successfully!'}</span>
        </Card>
      )}

      <form onSubmit={handleSave} className="settings-form">
        {/* Language Preferences */}
        <LanguageSection
          nativeLanguage={nativeLanguage}
          targetLanguage={targetLanguage}
          onUpdateField={updateField}
        />

        {/* Provider Presets */}
        <ProviderPresetsSection
          selectedPreset={selectedPreset}
          onSelectPreset={handleSelectPreset}
        />

        {/* Configuration */}
        <AiConfigSection
          baseURL={baseURL}
          model={model}
          apiKey={apiKey}
          hasApiKey={hasApiKey}
          activePreset={activePreset}
          isLocalOllamaBaseURL={isLocalOllamaBaseURL}
          onUpdateField={updateField}
        />
      </form>

      {/* Import / Export Section */}
      <ImportExportSection
        onOpenImportModal={() => setShowImportModal(true)}
        onOpenExportModal={() => {
          setShowExportModal(true);
        }}
        importSuccess={importSuccess}
      />

      {/* Danger Zone */}
      <DangerZoneSection
        onOpenResetModal={() => setShowResetModal(true)}
        onOpenDeleteAccountModal={() => setShowDeleteAccountModal(true)}
      />

      {/* Modals */}
      <ImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        overrideSettings={overrideSettings}
        onOverrideSettingsChange={setOverrideSettings}
        importing={importing}
        importError={importError}
        fileInputRef={fileInputRef}
        onFileChange={handleImport}
      />

      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        exportInclude={exportInclude}
        onExportIncludeChange={setExportInclude}
        exporting={exporting}
        exportError={exportError}
        onExport={handleExport}
      />

      <ResetDataModal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        resetInclude={resetInclude}
        onResetIncludeChange={setResetInclude}
        resetting={resetting}
        resetError={resetError}
        onResetData={handleResetData}
      />

      <DeleteAccountModal
        isOpen={showDeleteAccountModal}
        onClose={() => setShowDeleteAccountModal(false)}
        deletingAccount={deletingAccount}
        deleteAccountError={deleteAccountError}
        onDeleteAccount={handleDeleteAccount}
      />

      {/* Floating Unsaved Changes Warning Bubble */}
      <UnsavedChangesBanner
        hasUnsavedChanges={hasUnsavedChanges}
        saving={saving}
        canSave={canSave}
        onDiscard={handleDiscard}
        onSave={handleSave}
      />
    </div>
  );
};

export default Settings;
