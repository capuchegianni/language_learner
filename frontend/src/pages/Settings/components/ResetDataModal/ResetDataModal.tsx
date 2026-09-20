import React from 'react';
import './ResetDataModal.css';
import { IconHazardAlert, IconTrashShears } from '../../../../components/icons';
import { Modal, Button, LoadingSpinner } from '../../../../components';
import { ResetInclude } from '../../types';

export interface ResetDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  resetInclude: ResetInclude;
  onResetIncludeChange: React.Dispatch<React.SetStateAction<ResetInclude>>;
  resetting: boolean;
  resetError: string | null;
  onResetData: () => Promise<void>;
}

const RESET_CATEGORIES: (keyof ResetInclude)[] = ['settings', 'words', 'rules', 'lessons'];

export const ResetDataModal: React.FC<ResetDataModalProps> = ({
  isOpen,
  onClose,
  resetInclude,
  onResetIncludeChange,
  resetting,
  resetError,
  onResetData,
}) => {
  const hasSelection = Object.values(resetInclude).some(Boolean);

  const selectAll = () => {
    onResetIncludeChange({
      settings: true,
      words: true,
      rules: true,
      lessons: true,
    });
  };

  const deselectAll = () => {
    onResetIncludeChange({
      settings: false,
      words: false,
      rules: false,
      lessons: false,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Reset Data"
      icon={<IconHazardAlert size={22} color="var(--accent-danger)" />}
      danger={true}
      maxWidth="520px"
    >
      <p className="settings-modal-description">
        Select which data you would like to permanently delete from your account.
      </p>
      <div className="settings-modal-warning-box">
        <IconHazardAlert size={16} />
        <span><strong>Warning:</strong> Selected data will be permanently removed. This action cannot be undone.</span>
      </div>

      <div className="settings-selection-toolbar">
        <span className="settings-selection-label">
          Choose items to delete:
        </span>
        <div className="settings-selection-actions">
          <button
            type="button"
            className="settings-text-btn primary"
            onClick={selectAll}
          >
            Select All
          </button>
          <span className="settings-selection-divider">|</span>
          <button
            type="button"
            className="settings-text-btn muted"
            onClick={deselectAll}
          >
            Deselect All
          </button>
        </div>
      </div>

      <div className="settings-checkbox-group">
        {RESET_CATEGORIES.map((key) => {
          const isChecked = resetInclude[key];
          return (
            <label
              key={key}
              className={`settings-checkbox-item ${isChecked ? 'danger-active' : 'inactive'}`}
            >
              <input
                type="checkbox"
                checked={isChecked}
                onChange={(e) =>
                  onResetIncludeChange((prev) => ({
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

      {resetError && (
        <div className="settings-modal-error">{resetError}</div>
      )}

      <div className="settings-modal-actions">
        <Button
          variant="secondary"
          onClick={onClose}
          disabled={resetting}
        >
          Cancel
        </Button>
        <Button
          variant="danger"
          className="settings-btn-danger-solid"
          id="confirm-reset-btn"
          disabled={resetting || !hasSelection}
          onClick={onResetData}
          icon={resetting ? undefined : <IconTrashShears size={18} />}
        >
          {resetting ? (
            <LoadingSpinner
              variant="button"
              size={18}
              message="Resetting..."
            />
          ) : (
            <span>Reset Selected Data</span>
          )}
        </Button>
      </div>
    </Modal>
  );
};
