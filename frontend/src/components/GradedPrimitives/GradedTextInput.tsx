import React from 'react';
import { useExerciseReview } from '../../contexts/ExerciseReviewContext';
import { IconApprovalCheck, IconHazardAlert } from '../icons';
import './GradedPrimitives.css';

export interface GradedTextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  exerciseNumber: number;
  inputId?: string;
  label?: string;
  labelProps?: React.LabelHTMLAttributes<HTMLLabelElement>;
}

export const GradedTextInput: React.FC<GradedTextInputProps> = ({
  exerciseNumber,
  inputId = '0',
  label,
  labelProps,
  className = '',
  value = '',
  disabled,
  ...props
}) => {
  const { isReviewMode, getCorrectionsForInput, hasLegacyCorrections, openCorrectionModal } = useExerciseReview();

  if (!isReviewMode) {
    return (
      <div className="input-group">
        {label && <label {...labelProps} htmlFor={props.id}>{label}</label>}
        <input
          {...props}
          value={value}
          disabled={disabled}
          className={`input-field ${className}`}
        />
      </div>
    );
  }

  const isLegacy = hasLegacyCorrections(exerciseNumber);
  const corrections = getCorrectionsForInput(exerciseNumber, inputId);
  const isCorrect = !isLegacy && corrections.length === 0 && Boolean(String(value).trim());
  const hasMistakes = !isLegacy && corrections.length > 0;

  const stateClass = isLegacy
    ? 'graded-legacy'
    : isCorrect
    ? 'graded-correct'
    : hasMistakes
    ? 'graded-mistake'
    : 'graded-neutral';

  return (
    <div className={`graded-input-container ${stateClass}`}>
      {label && <label {...labelProps} htmlFor={props.id}>{label}</label>}

      <div className="graded-input-wrapper">
        <input
          {...props}
          value={value}
          disabled
          readOnly
          className={`input-field graded-field ${stateClass} ${className}`}
        />

        {isCorrect && (
          <span className="graded-status-icon correct" title="Correct">
            <IconApprovalCheck size={16} />
          </span>
        )}

        {hasMistakes && (
          <span className="graded-status-icon mistake" title={`${corrections.length} correction(s)`}>
            <IconHazardAlert size={16} />
          </span>
        )}
      </div>

      {hasMistakes && (
        <div className="graded-corrections-strip">
          {corrections.map((c, idx) => (
            <button
              key={idx}
              type="button"
              className="graded-correction-btn"
              onClick={() => openCorrectionModal(c)}
              aria-label={`View correction: ${c.original || 'empty'} to ${c.expected}`}
            >
              <span className="chip-mistake">{c.original || '(empty)'}</span>
              <span className="chip-arrow">→</span>
              <span className="chip-expected">{c.expected}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

