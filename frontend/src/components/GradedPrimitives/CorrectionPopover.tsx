import React from 'react';
import { StructuredCorrection } from '../../types';
import './GradedPrimitives.css';

export interface CorrectionPopoverProps {
  correction: StructuredCorrection;
  className?: string;
}

export const CorrectionPopover: React.FC<CorrectionPopoverProps> = ({
  correction,
  className = '',
}) => {
  const getBadgeClass = (type: string) => {
    switch (type) {
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

  return (
    <div className={`correction-popover ${className}`} role="tooltip">
      <div className="popover-header">
        <span className={`popover-badge ${getBadgeClass(correction.errorType)}`}>
          {correction.errorType.toUpperCase()}
        </span>
      </div>

      <div className="popover-diff">
        <span className="diff-original">{correction.original || '(empty)'}</span>
        <span className="diff-arrow">➔</span>
        <span className="diff-expected">{correction.expected}</span>
      </div>

      {correction.explanation && (
        <p className="popover-explanation">{correction.explanation}</p>
      )}
    </div>
  );
};

