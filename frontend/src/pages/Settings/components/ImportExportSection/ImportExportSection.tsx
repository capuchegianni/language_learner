import React from 'react';
import { IconUploadPress, IconDownloadPress, IconApprovalCheck } from '../../../../components/icons';
import './ImportExportSection.css';

export interface ImportExportSectionProps {
  onOpenImportModal: () => void;
  onOpenExportModal: () => void;
  importSuccess: boolean;
}

export const ImportExportSection: React.FC<ImportExportSectionProps> = ({
  onOpenImportModal,
  onOpenExportModal,
  importSuccess,
}) => {
  return (
    <>
      <div className="card settings-card settings-import-export-card" id="tutorial-import-export">
        <h3 className="settings-section-title import-export-title">
          <IconUploadPress size={20} />
          <span>Import / Export Data</span>
        </h3>
        <p className="settings-section-desc">
          Import or export your words, rules, lessons, and settings as a JSON file.
        </p>
        <div className="settings-import-export-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onOpenImportModal}
          >
            <IconUploadPress size={16} />
            <span>Import JSON File</span>
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onOpenExportModal}
          >
            <IconDownloadPress size={16} />
            <span>Export Data</span>
          </button>
        </div>
      </div>

      {importSuccess && (
        <div className="card settings-success-alert">
          <IconApprovalCheck size={20} />
          <span>Data imported successfully!</span>
        </div>
      )}
    </>
  );
};
