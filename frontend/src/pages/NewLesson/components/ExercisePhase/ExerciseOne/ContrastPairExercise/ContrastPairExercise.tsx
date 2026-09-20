import React from 'react';
import { IconApprovalCheck } from '../../../../../../components/icons';
import { Select } from '../../../../../../components';
import { ExerciseOneComponentProps } from '../types';
import './contrastPair.css';

const parseFrame = (item: string): { sentenceFrame: string; options: string | null } => {
  const match = item.match(/^(.*?)\s*\((.*?)\)\s*$/);
  if (match) {
    return { sentenceFrame: match[1].trim(), options: match[2].trim() };
  }
  return { sentenceFrame: item, options: null };
};

/** Splits "Before ___ after." into [before, after] parts. */
const splitOnBlank = (sentence: string): [string, string] => {
  const idx = sentence.indexOf('___');
  if (idx === -1) return [sentence, ''];
  return [sentence.slice(0, idx), sentence.slice(idx + 3)];
};

export const ContrastPairExercise: React.FC<ExerciseOneComponentProps> = ({
  instruction,
  targetWords,
  answers,
  onAnswerChange,
}) => (
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
        const [before, after] = splitOnBlank(sentenceFrame);

        return (
          <div key={idx} className="ex1-contrast-card">
            <p className="ex1-contrast-sentence target-text">
              <span>{idx + 1}.&nbsp;{before}</span>
              <Select
                id={`ex1-contrast-${idx}`}
                size="sm"
                className="ex1-contrast-select"
                value={answers[idx] || ''}
                onChange={(e) => onAnswerChange(idx, e.target.value)}
              >
                <option value="" disabled>—</option>
                {choices.map((choice) => (
                  <option key={choice} value={choice}>{choice}</option>
                ))}
              </Select>
              <span>{after}</span>
            </p>
          </div>
        );
      })}
    </div>
  </div>
);
