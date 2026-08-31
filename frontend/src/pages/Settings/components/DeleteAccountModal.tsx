import React from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { Modal } from '../../../components/Modal';
import { LoadingSpinner } from '../../../components/LoadingSpinner';
import { useAuth } from '../../../contexts/AuthContext';

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
      icon={<AlertTriangle size={22} color="var(--accent-danger)" />}
      danger={true}
      maxWidth="500px"
    >
      <p className="settings-modal-description">
        Are you sure you want to permanently delete your account (<strong>{user?.email}</strong>)?
      </p>
      <div className="settings-modal-warning-box">
        ⚠️ <strong>Warning:</strong> All your progress, vocabulary words, grammar rules, completed lessons, exercise scores, and settings will be permanently wiped. You will be logged out immediately and cannot recover this data.
      </div>

      {deleteAccountError && (
        <div className="settings-modal-error">{deleteAccountError}</div>
      )}

      <div className="settings-modal-actions">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onClose}
          disabled={deletingAccount}
        >
          Cancel
        </button>
        <button
          type="button"
          className="btn settings-btn-danger-solid"
          id="confirm-delete-account-btn"
          disabled={deletingAccount}
          onClick={onDeleteAccount}
        >
          {deletingAccount ? (
            <LoadingSpinner
              variant="button"
              size={16}
              message="Deleting Account..."
            />
          ) : (
            <>
              <Trash2 size={16} />
              <span>Permanently Delete Account</span>
            </>
          )}
        </button>
      </div>
    </Modal>
  );
};
