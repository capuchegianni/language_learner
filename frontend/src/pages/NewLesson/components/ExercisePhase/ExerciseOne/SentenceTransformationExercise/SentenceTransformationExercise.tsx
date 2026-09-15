import React from 'react';
import { RefreshCw, ArrowRight } from 'lucide-react';
import { ExerciseOneComponentProps } from '../types';
import './sentenceTransformation.css';

export const SentenceTransformationExercise: React.FC<ExerciseOneComponentProps> = ({
  instruction,
  targetWords,
  answers,
  onAnswerChange,
}) => {
  return (
    <div className="ex1-container">
      <div className="ex1-header-block">
        <span className="ex1-type-badge">
          <RefreshCw size={13} />
          Sentence Structure Transformation
        </span>
        <p className="ex1-instruction">{instruction}</p>
      </div>

      <div className="ex1-sentence-trans-list">
        {targetWords.map((sentence, idx) => (
          <div key={idx} className="ex1-sentence-trans-card">
            <div className="ex1-original-sentence-box">
              <ArrowRight size={16} className="ex1-trans-arrow" />
              <div className="ex1-original-sentence-text kr-text">
                {sentence}
              </div>
            </div>
            <input
              type="text"
              id={`ex1-trans-${idx}`}
              placeholder="Write the transformed sentence..."
              value={answers[idx] || ''}
              onChange={(e) => onAnswerChange(idx, e.target.value)}
              className="exercise-text-input"
            />
          </div>
        ))}
      </div>
    </div>
  );
};
