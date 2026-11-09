import React from 'react';
import { useExerciseReview } from '../../contexts/ExerciseReviewContext';
import { IconApprovalCheck, IconHazardAlert } from '../icons';
import './GradedPrimitives.css';

export interface GradedSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  exerciseNumber: number;
  inputId?: string;
  label?: string;
  options?: Array<{ value: string; label: string }>;
  children?: React.ReactNode;
  inline?: boolean;
  containerClassName?: string;
  showCorrections?: boolean;
}

export const GradedSelect: React.FC<GradedSelectProps> = ({
  exerciseNumber,
  inputId = '0',
  label,
  options,
  children,
  className = '',
  value = '',
  disabled,
  inline = false,
  containerClassName = '',
  showCorrections = true,
  ...props
}) => {
  const { isReviewMode, getCorrectionsForInput, hasLegacyCorrections, openCorrectionModal } = useExerciseReview();
  const isInline = inline || className.includes('select-inline') || className.includes('inline') || className.includes('contrast-select');

  if (!isReviewMode) {
    const selectElem = (
      <select
        {...props}
        value={value}
        disabled={disabled}
        className={['select-field', isInline ? 'select-inline graded-select-inline' : '', className].filter(Boolean).join(' ')}
      >
        {options
          ? options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))
          : children}
      </select>
    );

    if (isInline) {
      return (
        <span className={`graded-inline-container ${containerClassName}`.trim()}>
          {label && <label htmlFor={props.id} className="input-label select-label select-inline-label">{label}</label>}
          <span className="graded-input-wrapper graded-inline-wrapper">
            {selectElem}
          </span>
        </span>
      );
    }

    return (
      <div className={`input-group ${containerClassName}`.trim()}>
        {label && <label htmlFor={props.id}>{label}</label>}
        {selectElem}
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

  const selectReviewElem = (
    <select
      {...props}
      value={value}
      disabled
      className={['select-field', isInline ? 'select-inline graded-select-inline' : '', 'graded-field', stateClass, className].filter(Boolean).join(' ')}
    >
      {options
        ? options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))
        : children}
    </select>
  );

  const iconsElem = (
    <>
      {isCorrect && (
        <span className="graded-status-icon correct" title="Correct">
          <IconApprovalCheck size={14} />
        </span>
      )}
      {hasMistakes && (
        <span className="graded-status-icon mistake" title={`${corrections.length} correction(s)`}>
          <IconHazardAlert size={14} />
        </span>
      )}
    </>
  );

  const correctionsStrip = hasMistakes && showCorrections && (
    <span className={`graded-corrections-strip ${isInline ? 'graded-corrections-inline' : ''}`.trim()}>
      {corrections.map((c, idx) => (
        <button
          key={idx}
          type="button"
          className="graded-correction-btn"
          onClick={(e) => {
            e.stopPropagation();
            openCorrectionModal(c);
          }}
          aria-label={`View correction: ${c.original || 'empty'} to ${c.expected}`}
        >
          <span className="chip-mistake">{c.original || '(empty)'}</span>
          <span className="chip-arrow">→</span>
          <span className="chip-expected">{c.expected}</span>
        </button>
      ))}
    </span>
  );

  if (isInline) {
    return (
      <span
        className={`graded-inline-container graded-inline ${stateClass} ${containerClassName}`.trim()}
        onClick={() => {
          if (hasMistakes && corrections.length > 0) {
            openCorrectionModal(corrections);
          }
        }}
        onKeyDown={(e) => {
          if (hasMistakes && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            openCorrectionModal(corrections);
          }
        }}
        tabIndex={hasMistakes ? 0 : undefined}
        role={hasMistakes ? 'button' : undefined}
        title={hasMistakes ? 'Click to view correction details' : undefined}
      >
        {label && <label htmlFor={props.id} className="input-label select-label select-inline-label">{label}</label>}

        <span className="graded-input-wrapper graded-inline-wrapper">
          {selectReviewElem}
          {iconsElem}
        </span>

        {correctionsStrip}
      </span>
    );
  }

  return (
    <div className={`graded-input-container ${stateClass} ${containerClassName}`.trim()}>
      {label && <label htmlFor={props.id}>{label}</label>}

      <div className="graded-input-wrapper">
        {selectReviewElem}
        {iconsElem}
      </div>

      {correctionsStrip}
    </div>
  );
};

