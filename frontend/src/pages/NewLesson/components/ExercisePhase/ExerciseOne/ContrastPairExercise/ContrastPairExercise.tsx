import React from 'react';
import { IconApprovalCheck } from '../../../../../../components/icons';
import { GradedSelect } from '../../../../../../components';
import { useExerciseReview } from '../../../../../../contexts/ExerciseReviewContext';
import { ExerciseOneComponentProps } from '../types';
import './contrastPair.css';

const parseFrame = (item: string): { sentenceFrame: string; options: string | null } => {
  const match = item.match(/^(.*?)\s*[\(\[]([^\(\)\[\]]+)[\)\]]\s*$/);
  if (match) {
    return { sentenceFrame: match[1].trim(), options: match[2].trim() };
  }
  return { sentenceFrame: item, options: null };
};

/**
 * Splits "Before ___ after." into [before, after] parts,
 * handling any blank format (__ or ___ or ____ or [] or ())
 * and trimming boundary whitespace so that the inline select's
 * typography and margins provide consistent, natural spacing between words.
 */
const formatFrameParts = (sentenceFrame: string): { before: string; after: string } => {
  const blankMatch = sentenceFrame.match(/_{2,}|\[\s*\]|\(\s*\)/);
  if (!blankMatch || blankMatch.index === undefined) {
    return { before: sentenceFrame, after: '' };
  }

  const idx = blankMatch.index;
  const blankLength = blankMatch[0].length;

  const before = sentenceFrame.slice(0, idx).trimEnd();
  const after = sentenceFrame.slice(idx + blankLength).trimStart();

  return { before, after };
};

export const ContrastPairExercise: React.FC<ExerciseOneComponentProps> = ({
  instruction,
  targetWords,
  answers,
  onAnswerChange,
}) => {
  const {
    isReviewMode,
    getCorrectionsForInput,
    hasLegacyCorrections,
    openCorrectionModal,
  } = useExerciseReview();

  const isLegacy = hasLegacyCorrections(1);

  return (
    <div className="ex1-container">
      <div className="ex1-header-block">
        <span className="ex1-type-badge">
          <IconApprovalCheck size={13} />
          Contrast Pair Drill
        </span>
        <p className="ex1-instruction">{instruction}</p>
      </div>

      <div className="ex1-contrast-list">
        {targetWords.map((item, idx) => {
          const { sentenceFrame, options } = parseFrame(item);
          const choices = options ? options.split(/\s*\/\s*/) : [];
          const { before, after } = formatFrameParts(sentenceFrame);

          const inputId = String(idx);
          const corrections = isReviewMode ? getCorrectionsForInput(1, inputId) : [];
          const hasMistakes = isReviewMode && !isLegacy && corrections.length > 0;

          const punctuationRegex = /^[,.;:!?)]/;
          const afterNeedsSpace = after && !punctuationRegex.test(after);

          return (
            <div key={idx} className="ex1-contrast-card">
              <div className="ex1-contrast-sentence target-text">
                <span className="ex1-contrast-num">{idx + 1}. </span>
                {before && <span className="ex1-contrast-before">{before} </span>}
                <GradedSelect
                  exerciseNumber={1}
                  inputId={inputId}
                  id={`ex1-contrast-${idx}`}
                  className="ex1-contrast-select"
                  value={answers[idx] || ''}
                  onChange={(e) => onAnswerChange(idx, e.target.value)}
                  inline
                  showCorrections={false}
                  aria-label={`Select option for question ${idx + 1}`}
                >
                  <option value="" disabled>
                    —
                  </option>
                  {choices.map((choice) => (
                    <option key={choice} value={choice}>
                      {choice}
                    </option>
                  ))}
                </GradedSelect>
                {after && (
                  <span className="ex1-contrast-after">
                    {afterNeedsSpace ? ` ${after}` : after}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
