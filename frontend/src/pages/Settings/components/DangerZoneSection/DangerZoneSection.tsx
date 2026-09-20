import React from 'react';
import { Card, Button } from '../../../../components';
import { IconHazardAlert, IconTrashShears } from '../../../../components/icons';
import './DangerZoneSection.css';

export interface DangerZoneSectionProps {
  onOpenResetModal: () => void;
  onOpenDeleteAccountModal: () => void;
}

export const DangerZoneSection: React.FC<DangerZoneSectionProps> = ({
  onOpenResetModal,
  onOpenDeleteAccountModal,
}) => {
  return (
    <Card className="settings-card settings-danger-card" id="tutorial-danger-zone">
      <h3 className="settings-section-title danger-title">
        <IconHazardAlert size={20} />
        <span>Danger Zone</span>
      </h3>
      <p className="settings-section-desc">
        Irreversible actions for your data and account. Proceed with caution.
      </p>

      <div className="settings-danger-list">
        {/* Reset Specific Data */}
        <div className="danger-zone-item settings-danger-divider">
          <div className="danger-zone-item-info">
            <div className="danger-zone-item-title">
              Reset Specific Data
            </div>
            <div className="danger-zone-item-desc">
              Select specific data categories (Settings, Words, Rules, Lessons) to permanently clear.
            </div>
          </div>
          <Button
            variant="danger"
            id="open-reset-modal-btn"
            onClick={onOpenResetModal}
            icon={<IconTrashShears size={16} />}
          >
            <span>Reset Data</span>
          </Button>
        </div>

        {/* Delete Account */}
        <div className="danger-zone-item">
          <div className="danger-zone-item-info">
            <div className="danger-zone-item-title">
              Delete Account
            </div>
            <div className="danger-zone-item-desc">
              Permanently delete your user account and all associated data.
            </div>
          </div>
          <Button
            variant="danger"
            id="open-delete-account-modal-btn"
            onClick={onOpenDeleteAccountModal}
            icon={<IconTrashShears size={16} />}
          >
            <span>Delete Account</span>
          </Button>
        </div>
      </div>
    </Card>
  );
};
