import React from 'react';
import { ChevronRight } from 'lucide-react';
import './StepIndicator.css';

export type LessonPhase = 'PROPOSAL' | 'GENERATED_WORKSPACE' | 'GRADED';

export interface StepIndicatorProps {
  phase: LessonPhase;
  className?: string;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({ phase, className = '' }) => {
  return (
    <div className={`step-indicator-container ${className}`.trim()}>
      <div
        className={`step-indicator-item ${phase === 'PROPOSAL' ? 'active' : 'completed'}`}
      >
        <div className="step-badge">1</div>
        <span className="step-label">Pick Daily Rule</span>
        <span className="step-label-mobile">Rule</span>
      </div>
      <ChevronRight size={16} className="step-separator" />
      <div
        className={`step-indicator-item ${phase === 'GENERATED_WORKSPACE' ? 'active' : phase === 'GRADED' ? 'completed' : 'pending'}`}
      >
        <div className="step-badge">2</div>
        <span className="step-label">Practice Exercises</span>
        <span className="step-label-mobile">Exercises</span>
      </div>
      <ChevronRight size={16} className="step-separator" />
      <div
        className={`step-indicator-item ${phase === 'GRADED' ? 'completed' : 'pending'}`}
      >
        <div className="step-badge">3</div>
        <span className="step-label">AI Feedback &amp; Score</span>
        <span className="step-label-mobile">Results</span>
      </div>
    </div>
  );
};

export default StepIndicator;
