import React from 'react';
import { Download } from 'lucide-react';
import { Modal } from '../../../components/Modal';
import { LoadingSpinner } from '../../../components/LoadingSpinner';
import { ExportInclude } from '../types';

export interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  exportInclude: ExportInclude;
  onExportIncludeChange: React.Dispatch<React.SetStateAction<ExportInclude>>;
  exporting: boolean;
  exportError: string | null;
  onExport: () => Promise<void>;
}

const EXPORT_CATEGORIES: (keyof ExportInclude)[] = ['settings', 'words', 'rules', 'lessons'];

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  exportInclude,
  onExportIncludeChange,
  exporting,
  exportError,
  onExport,
}) => {
  const hasSelection = Object.values(exportInclude).some(Boolean);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Export Data" maxWidth="500px">
      <p className="settings-modal-description">
        Select which data you would like to include in the exported JSON file.
      </p>
      <div className="settings-modal-notice-box">
        ⚠️ Your API key is never included in the export for security reasons.
      </div>

      <div className="settings-checkbox-group">
        {EXPORT_CATEGORIES.map((key) => {
          const isChecked = exportInclude[key];
          return (
            <label
              key={key}
              className={`settings-checkbox-item ${isChecked ? 'primary-active' : 'inactive'}`}
            >
              <input
                type="checkbox"
                checked={isChecked}
                onChange={(e) =>
                  onExportIncludeChange((prev) => ({
                    ...prev,
                    [key]: e.target.checked,
                  }))
                }
              />
              <span className="settings-checkbox-label">
                {key}
              </span>
            </label>
          );
        })}
      </div>

      {exportError && (
        <div className="settings-modal-error">{exportError}</div>
      )}

      <div className="settings-modal-actions">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onClose}
          disabled={exporting}
        >
          Cancel
        </button>
        <button
          type="button"
          className="btn btn-primary"
          disabled={exporting || !hasSelection}
          onClick={onExport}
        >
          {exporting ? (
            <LoadingSpinner
              variant="button"
              size={18}
              message="Exporting..."
            />
          ) : (
            <>
              <Download size={18} />
              <span>Download JSON</span>
            </>
          )}
        </button>
      </div>
    </Modal>
  );
};
