import React from 'react';
import './DeleteAccountModal.css';
import { IconHazardAlert, IconTrashShears } from '../../../../components/icons';
import { Modal, Button, LoadingSpinner } from '../../../../components';
import { useAuth } from '../../../../contexts/AuthContext';

export interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  deletingAccount: boolean;
  deleteAccountError: string | null;
  onDeleteAccount: () => Promise<void>;
}

export const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({
  isOpen,
  onClose,
  deletingAccount,
  deleteAccountError,
  onDeleteAccount,
}) => {
  const { user } = useAuth();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Account"
      icon={<IconHazardAlert size={22} color="var(--accent-danger)" />}
      danger={true}
      maxWidth="500px"
    >
      <p className="settings-modal-description">
        Are you sure you want to permanently delete your account (<strong>{user?.email}</strong>)?
      </p>
      <div className="settings-modal-warning-box">
        <IconHazardAlert size={16} />
        <span><strong>Warning:</strong> All your progress, vocabulary words, grammar rules, completed lessons, exercise scores, and settings will be permanently wiped. You will be logged out immediately and cannot recover this data.</span>
      </div>

      {deleteAccountError && (
        <div className="settings-modal-error">{deleteAccountError}</div>
      )}

      <div className="settings-modal-actions">
        <Button
          variant="secondary"
          onClick={onClose}
          disabled={deletingAccount}
        >
          Cancel
        </Button>
        <Button
          variant="danger"
          id="confirm-delete-account-btn"
          disabled={deletingAccount}
          onClick={onDeleteAccount}
          icon={deletingAccount ? undefined : <IconTrashShears size={16} />}
        >
          {deletingAccount ? (
            <LoadingSpinner
              variant="button"
              size={18}
              message="Deleting Account..."
            />
          ) : (
            <span>Permanently Delete Account</span>
          )}
        </Button>
      </div>
    </Modal>
  );
};
