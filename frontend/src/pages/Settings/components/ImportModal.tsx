import React from 'react';
import { Upload } from 'lucide-react';
import { Modal } from '../../../components/Modal';
import { LoadingSpinner } from '../../../components/LoadingSpinner';

export interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  overrideSettings: boolean;
  onOverrideSettingsChange: (override: boolean) => void;
  importing: boolean;
  importError: string | null;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
}

const IMPORT_SCHEMA_SAMPLE = `{
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
}`;

export const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  overrideSettings,
  onOverrideSettingsChange,
  importing,
  importError,
  fileInputRef,
  onFileChange,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Import Data" maxWidth="600px">
      <p className="settings-modal-description">
        Your JSON file should have the following structure. Any fields not matching the format will be skipped.
      </p>

      <pre className="code-block settings-schema-code">
        {IMPORT_SCHEMA_SAMPLE}
      </pre>

      {importError && (
        <div className="settings-modal-error">{importError}</div>
      )}

      <div className="settings-modal-checkbox-row">
        <input
          type="checkbox"
          id="overrideSettings"
          checked={overrideSettings}
          onChange={(e) => onOverrideSettingsChange(e.target.checked)}
        />
        <label
          htmlFor="overrideSettings"
          className="settings-modal-checkbox-label"
        >
          Override settings if data exists
        </label>
      </div>

      <div className="settings-modal-actions">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onClose}
          disabled={importing}
        >
          Cancel
        </button>
        <label className="btn btn-primary settings-file-upload-btn">
          {importing ? (
            <LoadingSpinner
              variant="button"
              size={18}
              message="Importing..."
            />
          ) : (
            <>
              <Upload size={18} />
              <span>Select &amp; Import JSON</span>
            </>
          )}
          <input
            type="file"
            accept=".json,application/json"
            className="settings-hidden-input"
            ref={fileInputRef}
            onChange={onFileChange}
            disabled={importing}
          />
        </label>
      </div>
    </Modal>
  );
};
