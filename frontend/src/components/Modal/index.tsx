import React, { useEffect } from 'react';
import { X } from 'lucide-react';
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
      className={`app-modal-overlay ${className}`}
      onMouseDown={handleBackdropMouseDown}
      role="dialog"
      aria-modal="true"
      aria-label={typeof title === 'string' ? title : ariaLabel}
    >
      <div
        className={`app-modal-content ${danger ? 'app-modal-danger' : ''} ${contentClassName}`}
        style={maxWidth ? { maxWidth } : undefined}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {(title || icon) && (
          <div className="app-modal-header">
            <h3 className="app-modal-title">
              {icon}
              <span>{title}</span>
            </h3>
            <IconButton
              icon={<X />}
              size={36}
              iconSize={18}
              onClick={onClose}
              title="Close dialog"
              aria-label="Close dialog"
            />
          </div>
        )}

        <div className="app-modal-body">{children}</div>

        {footer && <div className="app-modal-footer">{footer}</div>}
      </div>
    </div>
  );
};
