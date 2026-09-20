import React from 'react';
import { Card, Button } from '../../../../components';
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
      <Card className="settings-card settings-import-export-card" id="tutorial-import-export">
        <h3 className="settings-section-title">
          <IconUploadPress size={20} />
          <span>Import / Export Data</span>
        </h3>
        <p className="settings-section-desc">
          Import or export your words, rules, lessons, and settings as a JSON file.
        </p>
        <div className="settings-import-export-actions">
          <Button
            variant="secondary"
            onClick={onOpenImportModal}
            icon={<IconUploadPress size={16} />}
          >
            <span>Import JSON File</span>
          </Button>
          <Button
            variant="secondary"
            onClick={onOpenExportModal}
            icon={<IconDownloadPress size={16} />}
          >
            <span>Export Data</span>
          </Button>
        </div>
      </Card>

      {importSuccess && (
        <Card className="settings-success-alert">
          <IconApprovalCheck size={20} />
          <span>Data imported successfully!</span>
        </Card>
      )}
    </>
  );
};
