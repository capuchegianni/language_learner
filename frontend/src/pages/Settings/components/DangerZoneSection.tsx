import React from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';

export interface DangerZoneSectionProps {
  onOpenResetModal: () => void;
  onOpenDeleteAccountModal: () => void;
}

export const DangerZoneSection: React.FC<DangerZoneSectionProps> = ({
  onOpenResetModal,
  onOpenDeleteAccountModal,
}) => {
  return (
    <div className="glass-card settings-danger-card">
      <h3 className="settings-section-title danger-title">
        <AlertTriangle size={20} />
        <span>Danger Zone</span>
      </h3>
      <p className="settings-section-desc">
        Irreversible actions for your data and account. Proceed with caution.
      </p>

      <div className="settings-danger-list">
        {/* Reset Specific Data */}
        <div className="danger-zone-item settings-danger-divider">
          <div>
            <div className="danger-zone-item-title">
              Reset Specific Data
            </div>
            <div className="danger-zone-item-desc">
              Select specific data categories (Settings, Words, Rules, Lessons) to permanently clear.
            </div>
          </div>
          <button
            type="button"
            className="btn btn-danger"
            id="open-reset-modal-btn"
            onClick={onOpenResetModal}
          >
            <Trash2 size={16} />
            <span>Reset Data</span>
          </button>
        </div>

        {/* Delete Account */}
        <div className="danger-zone-item">
          <div>
            <div className="danger-zone-item-title">
              Delete Account
            </div>
            <div className="danger-zone-item-desc">
              Permanently delete your user account and all associated data.
            </div>
          </div>
          <button
            type="button"
            className="btn btn-danger"
            id="open-delete-account-modal-btn"
            onClick={onOpenDeleteAccountModal}
          >
            <Trash2 size={16} />
            <span>Delete Account</span>
          </button>
        </div>
      </div>
    </div>
  );
};
