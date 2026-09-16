import React, { useEffect } from 'react';
import { IconCloseDismiss } from '../icons';
import { IconButton } from '../IconButton';
import './Modal.css';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  icon?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: string | number;
  className?: string;
  contentClassName?: string;
  ariaLabel?: string;
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
  danger?: boolean;
}


export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  icon,
  children,
  footer,
  maxWidth,
  className = '',
  contentClassName = '',
  ariaLabel,
  closeOnBackdropClick = true,
  closeOnEscape = true,
  danger = false,
}) => {
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeOnEscape, onClose]);

  if (!isOpen) return null;

  const handleBackdropMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnBackdropClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className={`modal-overlay ${className}`.trim()}
      onMouseDown={handleBackdropMouseDown}
      role="dialog"
      aria-modal="true"
      aria-label={typeof title === 'string' ? title : ariaLabel}
    >
      <div
        className={`modal-content ${danger ? 'modal-danger' : ''} ${contentClassName}`.trim()}
        style={maxWidth ? { maxWidth } : undefined}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {(title || icon) && (
          <div className="modal-header">
            <h3 className="modal-title">
              {icon && <span className="modal-title-icon">{icon}</span>}
              <span className="modal-title-text">{title}</span>
            </h3>
            <IconButton
              icon={<IconCloseDismiss size={16} />}
              size={36}
              iconSize={16}
              onClick={onClose}
              title="Close dialog"
              aria-label="Close dialog"
            />
          </div>
        )}

        <div className="modal-body">{children}</div>

        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
};

export default Modal;
