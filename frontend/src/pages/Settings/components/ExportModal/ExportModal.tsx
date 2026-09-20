import React from 'react';
import './ExportModal.css';
import { IconDownloadPress, IconHazardAlert } from '../../../../components/icons';
import { Modal, Button, LoadingSpinner } from '../../../../components';
import { ExportInclude } from '../../types';

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
        <IconHazardAlert size={16} />
        <span>Your API key is never included in the export for security reasons.</span>
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
        <Button
          variant="secondary"
          onClick={onClose}
          disabled={exporting}
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          disabled={exporting || !hasSelection}
          onClick={onExport}
          icon={exporting ? undefined : <IconDownloadPress size={18} />}
        >
          {exporting ? (
            <LoadingSpinner
              variant="button"
              size={18}
              message="Exporting..."
            />
          ) : (
            <span>Download JSON</span>
          )}
        </Button>
      </div>
    </Modal>
  );
};
