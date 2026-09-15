import React from 'react';
import { Link2, Plus } from 'lucide-react';
import { ExerciseOneComponentProps } from '../types';
import './clauseCombination.css';

export const ClauseCombinationExercise: React.FC<ExerciseOneComponentProps> = ({
  instruction,
  targetWords,
  answers,
  onAnswerChange,
}) => {
  const parseClauses = (item: string) => {
    const parts = item.split(/\s*\/\s*/);
    if (parts.length >= 2) {
      return { clauseA: parts[0], clauseB: parts.slice(1).join(' / ') };
    }
    return { clauseA: item, clauseB: null };
  };

  return (
    <div className="ex1-container">
      <div className="ex1-header-block">
        <span className="ex1-type-badge">
          <Link2 size={13} />
          Clause Connector Combination
        </span>
        <p className="ex1-instruction">{instruction}</p>
      </div>

      <div className="ex1-clause-list">
        {targetWords.map((item, idx) => {
          const { clauseA, clauseB } = parseClauses(item);

          return (
            <div key={idx} className="ex1-clause-card">
              <div className="ex1-clause-pair-display">
                <span className="ex1-clause-pill kr-text">{clauseA}</span>
                {clauseB && (
                  <>
                    <span className="ex1-clause-plus">
                      <Plus size={12} /> connector
                    </span>
                    <span className="ex1-clause-pill kr-text">{clauseB}</span>
                  </>
                )}
              </div>
              <input
                type="text"
                id={`ex1-clause-${idx}`}
                placeholder="Combine clauses into a single sentence using the rule..."
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
