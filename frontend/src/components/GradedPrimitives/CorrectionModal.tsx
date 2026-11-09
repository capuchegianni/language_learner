import React from 'react';
import { StructuredCorrection } from '../../types';
import { Modal } from '../Modal';
import { Button } from '../Button';
import './GradedPrimitives.css';

export interface CorrectionModalProps {
  correction: StructuredCorrection | StructuredCorrection[] | null;
  isOpen: boolean;
  onClose: () => void;
}

export const getCorrectionBadgeClass = (type?: string): string => {
  switch (type?.toLowerCase()) {
    case 'spelling':
      return 'badge-spelling';
    case 'conjugation':
      return 'badge-conjugation';
    case 'grammar':
      return 'badge-grammar';
    case 'vocabulary':
      return 'badge-vocabulary';
    case 'syntax':
      return 'badge-syntax';
    default:
      return 'badge-other';
  }
};

export const CorrectionModal: React.FC<CorrectionModalProps> = ({
  correction,
  isOpen,
  onClose,
}) => {
  if (!correction) return null;

  const items = Array.isArray(correction) ? correction : [correction];
  if (items.length === 0) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={items.length > 1 ? 'Correction Details' : 'Correction Detail'}
      maxWidth="420px"
      contentClassName="correction-modal-content"
    >
      <div className="correction-modal-body">
        {items.map((item, idx) => (
          <div key={idx} className="correction-modal-item">
            {idx > 0 && <div className="correction-modal-divider" />}
            <div className="popover-header">
              <span className={`popover-badge ${getCorrectionBadgeClass(item.errorType)}`}>
                {(item.errorType || 'Correction').toUpperCase()}
              </span>
            </div>

            <div className="popover-diff">
              <span className="diff-original">{item.original || '(empty)'}</span>
              <span className="diff-arrow">→</span>
              <span className="diff-expected">{item.expected}</span>
            </div>

            {item.explanation && (
              <p className="popover-explanation">{item.explanation}</p>
            )}
          </div>
        ))}

        <div className="correction-modal-actions">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default CorrectionModal;

