import React from 'react';
import './UnsavedChangesBanner.css';
import { Card, Button, LoadingSpinner } from '../../../../components';
import { IconHazardAlert, IconSaveLedger } from '../../../../components/icons';

export interface UnsavedChangesBannerProps {
  hasUnsavedChanges: boolean;
  saving: boolean;
  canSave: boolean;
  onDiscard: () => void;
  onSave: () => Promise<void>;
}

export const UnsavedChangesBanner: React.FC<UnsavedChangesBannerProps> = ({
  hasUnsavedChanges,
  saving,
  canSave,
  onDiscard,
  onSave,
}) => {
  if (!hasUnsavedChanges) return null;

  return (
    <Card
      className="unsaved-changes-bubble"
      role="alert"
      id="unsaved-changes-warning"
    >
      <div className="unsaved-changes-content">
        <div className="unsaved-changes-icon-badge">
          <IconHazardAlert size={20} />
        </div>
        <div className="unsaved-changes-text">
          <div className="unsaved-changes-title">Unsaved Changes</div>
          <div className="unsaved-changes-desc">
            Settings changes haven't been saved yet.
          </div>
        </div>
      </div>
      <div className="unsaved-changes-actions">
        <Button
          variant="secondary"
          className="unsaved-changes-btn unsaved-changes-discard-btn"
          onClick={onDiscard}
          disabled={saving}
          id="discard-settings-btn"
        >
          Discard
        </Button>
        <Button
          variant="primary"
          className="unsaved-changes-btn unsaved-changes-save-btn"
          onClick={() => onSave()}
          disabled={saving || !canSave}
          id="save-settings-btn"
          icon={saving ? undefined : <IconSaveLedger size={16} />}
        >
          {saving ? (
            <LoadingSpinner
              variant="button"
              size={14}
              message="Saving..."
            />
          ) : (
            <span>Save Settings</span>
          )}
        </Button>
      </div>
    </Card>
  );
};
