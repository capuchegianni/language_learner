import React from 'react';
import { Upload, Download, CheckCircle2 } from 'lucide-react';

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
      <div className="glass-card settings-import-export-card">
        <h3 className="settings-section-title import-export-title">
          <Upload size={20} />
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
            <Download size={16} />
            <span>Import JSON File</span>
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onOpenExportModal}
          >
            <Upload size={16} />
            <span>Export Data</span>
          </button>
        </div>
      </div>

      {importSuccess && (
        <div className="glass-card settings-success-alert">
          <CheckCircle2 size={20} />
          <span>Data imported successfully!</span>
        </div>
      )}
    </>
  );
};
