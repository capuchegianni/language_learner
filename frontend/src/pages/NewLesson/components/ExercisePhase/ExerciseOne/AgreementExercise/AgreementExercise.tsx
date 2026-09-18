import React from 'react';
import { IconTypesetSliders, IconManiculeRight } from '../../../../../../components/icons';
import { ExerciseOneComponentProps } from '../types';
import './agreementExercise.css';

export const AgreementExercise: React.FC<ExerciseOneComponentProps> = ({
  instruction,
  targetWords,
  answers,
  onAnswerChange,
}) => {
  const parsePrompt = (item: string) => {
    const match = item.match(/^(.*?)\s*\((.*?)\)$/);
    if (match) {
      return {
        baseWord: match[1].trim(),
        condition: match[2].trim(),
      };
    }
    return {
      baseWord: item,
      condition: null,
    };
  };

  return (
    <div className="ex1-container">
      <div className="ex1-header-block">
        <span className="ex1-type-badge">
          <IconTypesetSliders size={13} />
          Gender &amp; Number Agreement Drill
        </span>
        <p className="ex1-instruction">{instruction}</p>
      </div>

      <div className="ex1-agreement-list">
        {targetWords.map((item, idx) => {
          const { baseWord, condition } = parsePrompt(item);

          return (
            <div key={idx} className="ex1-agreement-item">
              <div className="ex1-agreement-prompt-row">
                <IconManiculeRight
                  size={16}
                  className="ex1-agreement-arrow"
                />
                <span className="ex1-agreement-base-word target-text">{baseWord}</span>
                {condition && (
                  <span className="ex1-agreement-condition">
                    {condition}
                  </span>
                )}
              </div>
              <input
                type="text"
                id={`ex1-agree-${idx}`}
                placeholder={`Enter inflected form for "${baseWord}"...`}
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
};
