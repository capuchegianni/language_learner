import { AlertTriangle, Save } from 'lucide-react';
import { LoadingSpinner } from '../../../components/LoadingSpinner';

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
    <div
      className="unsaved-changes-bubble"
      role="alert"
      id="unsaved-changes-warning"
    >
      <div className="unsaved-changes-content">
        <div className="unsaved-changes-icon-badge">
          <AlertTriangle size={20} />
        </div>
        <div className="unsaved-changes-text">
          <div className="unsaved-changes-title">Unsaved Changes</div>
          <div className="unsaved-changes-desc">
            Settings changes haven't been saved yet.
          </div>
        </div>
      </div>
      <div className="unsaved-changes-actions">
        <button
          type="button"
          className="btn btn-secondary unsaved-changes-btn unsaved-changes-discard-btn"
          onClick={onDiscard}
          disabled={saving}
          id="discard-settings-btn"
        >
          Discard
        </button>
        <button
          type="button"
          className="btn btn-primary unsaved-changes-btn unsaved-changes-save-btn"
          onClick={() => onSave()}
          disabled={saving || !canSave}
          id="save-settings-btn"
        >
          {saving ? (
            <LoadingSpinner
              variant="button"
              size={14}
              message="Saving..."
            />
          ) : (
            <>
              <Save size={16} />
              <span>Save Settings</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
