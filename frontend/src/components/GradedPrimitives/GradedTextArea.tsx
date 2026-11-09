import React from 'react';
import { useExerciseReview } from '../../contexts/ExerciseReviewContext';
import { StructuredCorrection } from '../../types';
import { IconApprovalCheck, IconHazardAlert } from '../icons';
import './GradedPrimitives.css';

export interface GradedTextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  exerciseNumber: number;
  inputId?: string;
  label?: string;
}

interface TextSegment {
  text: string;
  correction?: StructuredCorrection;
}

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function findMatchIndex(text: string, orig: string, searchFrom: number): number {
  const isWordStart = /^[\p{L}\p{N}]/u.test(orig);
  const isWordEnd = /[\p{L}\p{N}]$/u.test(orig);
  // Word boundary check supporting Unicode alphabets and ideographs
  const boundaryStart = isWordStart ? '(?:^|[^\\p{L}\\p{N}_])' : '';
  const boundaryEnd = isWordEnd ? '(?:$|[^\\p{L}\\p{N}_])' : '';
  const pattern = new RegExp(boundaryStart + '(' + escapeRegExp(orig) + ')' + boundaryEnd, 'iu');

  const slice = text.slice(searchFrom);
  const match = pattern.exec(slice);
  if (match) {
    const offsetInMatch = match[0].indexOf(match[1]);
    return searchFrom + match.index + offsetInMatch;
  }
  return -1;
}

function splitTextByCorrections(
  text: string,
  corrections: StructuredCorrection[],
): TextSegment[] {
  if (!text || corrections.length === 0) {
    return [{ text }];
  }

  const matches: Array<{ start: number; end: number; correction: StructuredCorrection }> = [];
  let cursor = 0;

  for (const c of corrections) {
    const orig = c.original?.trim();
    if (!orig) continue;

    // Search sequentially from cursor position, fallback to beginning if not found after cursor
    let idx = findMatchIndex(text, orig, cursor);
    if (idx === -1 && cursor > 0) {
      idx = findMatchIndex(text, orig, 0);
    }

    if (idx !== -1) {
      matches.push({ start: idx, end: idx + orig.length, correction: c });
      cursor = Math.max(cursor, idx + orig.length);
    }
  }

  if (matches.length === 0) {
    return [{ text }];
  }

  // Sort matches by start index
  matches.sort((a, b) => a.start - b.start);

  const segments: TextSegment[] = [];
  let lastIndex = 0;

  for (const m of matches) {
    if (m.start > lastIndex) {
      segments.push({ text: text.slice(lastIndex, m.start) });
    }
    if (m.start >= lastIndex) {
      segments.push({
        text: text.slice(m.start, m.end),
        correction: m.correction,
      });
      lastIndex = m.end;
    }
  }

  if (lastIndex < text.length) {
    segments.push({ text: text.slice(lastIndex) });
  }

  return segments;
}

export const GradedTextArea: React.FC<GradedTextAreaProps> = ({
  exerciseNumber,
  inputId = '0',
  label,
  className = '',
  value = '',
  disabled,
  ...props
}) => {
  const { isReviewMode, getCorrectionsForInput, hasLegacyCorrections, openCorrectionModal } = useExerciseReview();

  const textValue = String(value || '');

  if (!isReviewMode) {
    return (
      <div className="input-group">
        {label && <label htmlFor={props.id}>{label}</label>}
        <textarea
          {...props}
          value={value}
          disabled={disabled}
          className={`textarea-field ${className}`}
        />
      </div>
    );
  }

  const isLegacy = hasLegacyCorrections(exerciseNumber);
  const corrections = getCorrectionsForInput(exerciseNumber, inputId);
  const isCorrect = !isLegacy && corrections.length === 0 && Boolean(textValue.trim());
  const hasMistakes = !isLegacy && corrections.length > 0;

  const stateClass = isLegacy
    ? 'graded-legacy'
    : isCorrect
    ? 'graded-correct'
    : hasMistakes
    ? 'graded-mistake'
    : 'graded-neutral';

  const segments = splitTextByCorrections(textValue, corrections);

  return (
    <div className={`graded-textarea-container ${stateClass}`}>
      {label && <label htmlFor={props.id}>{label}</label>}

      <div className={`graded-textarea-review-box ${stateClass}`}>
        <div className="graded-textarea-content target-text">
          {segments.map((seg, idx) => {
            if (!seg.correction) {
              return <span key={idx}>{seg.text}</span>;
            }
            const c = seg.correction;
            return (
              <span
                key={idx}
                className="inline-mistake-highlight"
                role="button"
                tabIndex={0}
                onClick={() => openCorrectionModal(c)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openCorrectionModal(c);
                  }
                }}
                title="Click to view correction details"
              >
                <span className="inline-mistake-original">{seg.text}</span>
                <span className="inline-mistake-badge">→ {c.expected}</span>
              </span>
            );
          })}
        </div>

        {isCorrect && (
          <span className="graded-textarea-status-icon correct" title="Correct">
            <IconApprovalCheck size={18} />
          </span>
        )}

        {hasMistakes && (
          <span className="graded-textarea-status-icon mistake" title={`${corrections.length} correction(s)`}>
            <IconHazardAlert size={18} />
          </span>
        )}
      </div>
    </div>
  );
};

