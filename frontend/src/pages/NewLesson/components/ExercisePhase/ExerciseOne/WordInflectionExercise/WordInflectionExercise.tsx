import React from 'react';
import { ArrowRight, Sparkles, Pin, Bookmark } from 'lucide-react';
import { ExerciseOneComponentProps } from '../types';
import './wordInflection.css';

export const WordInflectionExercise: React.FC<ExerciseOneComponentProps> = ({
  instruction,
  targetWords,
  type,
  answers,
  onAnswerChange,
}) => {
  const isParticle = type === 'particle_case_attachment';
  const isCreativeSentence = type === 'creative_sentence_production';

  const badgeConfig = isParticle
    ? { icon: <Pin size={13} />, label: 'Particle & Case Attachment' }
    : isCreativeSentence
      ? { icon: <Sparkles size={13} />, label: 'Sentence Construction Drill' }
      : { icon: <Bookmark size={13} />, label: 'Stem & Ending Inflection' };

  const getPlaceholder = (word: string) => {
    if (isParticle) return `Attach particle to "${word}"...`;
    if (isCreativeSentence) return `Write a natural sentence using "${word}"...`;
    return `Enter transformed form for "${word}"...`;
  };

  return (
    <div className="ex1-container">
      <div className="ex1-header-block">
        <span className="ex1-type-badge">
          {badgeConfig.icon}
          {badgeConfig.label}
        </span>
        <p className="ex1-instruction">{instruction}</p>
      </div>

      <div className="ex1-inflection-grid">
        {targetWords.map((word, idx) => (
          <div key={idx} className="ex1-inflection-row">
            <div className="ex1-inflection-prompt">
              <span className="ex1-inflection-word kr-text">{word}</span>
              <ArrowRight size={14} className="ex1-inflection-arrow" />
            </div>
            <input
              type="text"
              id={`ex1-inflect-${idx}`}
              placeholder={getPlaceholder(word)}
              value={answers[idx] || ''}
              onChange={(e) => onAnswerChange(idx, e.target.value)}
              className="exercise-text-input ex1-inflection-input"
            />
          </div>
        ))}
      </div>
    </div>
  );
};
