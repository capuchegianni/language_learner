import React from 'react';
import { IconQueryNotice } from '../../../../../../components/icons';
import { ExerciseOneComponentProps } from '../types';
import './clozePattern.css';

const parseFrame = (item: string): { sentenceFrame: string; hint: string | null } => {
  const match = item.match(/^(.*?)\s*\((.*?)\)\s*$/);
  if (match) {
    return { sentenceFrame: match[1].trim(), hint: match[2].trim() };
  }
  return { sentenceFrame: item, hint: null };
};

export const ClozePatternExercise: React.FC<ExerciseOneComponentProps> = ({
  instruction,
  targetWords,
  answers,
  onAnswerChange,
}) => (
  <div className="ex1-container">
    <div className="ex1-header-block">
      <span className="ex1-type-badge">
        <IconQueryNotice size={13} />
        Contextual Frame / Cloze Drill
      </span>
      <p className="ex1-instruction">{instruction}</p>
    </div>

    <div className="ex1-cloze-list">
      {targetWords.map((item, idx) => {
        const { sentenceFrame, hint } = parseFrame(item);

        return (
          <div key={idx} className="ex1-cloze-card">
            <div className="ex1-cloze-prompt-box">
              <span className="ex1-cloze-sentence target-text">
                {idx + 1}. {sentenceFrame}
              </span>
              {hint && (
                <span className="ex1-cloze-choices-badge">
                  Target: {hint}
                </span>
              )}
            </div>
            <input
              type="text"
              id={`ex1-cloze-${idx}`}
              placeholder={`Fill in the blank using "${hint || 'target'}"...`}
              value={answers[idx] || ''}
              onChange={(e) => onAnswerChange(idx, e.target.value)}
              className="exercise-text-input"
            />
          </div>
        );
      })}
    </div>
  </div>
);
