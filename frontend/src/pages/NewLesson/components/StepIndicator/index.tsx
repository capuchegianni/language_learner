import React from 'react';
import { IconManiculeRight, IconApprovalCheck } from '../../../../components/icons';
import './StepIndicator.css';

export type LessonPhase = 'PROPOSAL' | 'GENERATED_WORKSPACE' | 'GRADED';

export interface StepIndicatorProps {
  phase: LessonPhase;
  className?: string;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({ phase, className = '' }) => {
  const isStep1Active = phase === 'PROPOSAL';
  const isStep1Completed = phase === 'GENERATED_WORKSPACE' || phase === 'GRADED';

  const isStep2Active = phase === 'GENERATED_WORKSPACE';
  const isStep2Completed = phase === 'GRADED';

  const isStep3Active = phase === 'GRADED';

  return (
    <div className={`step-indicator-container ${className}`.trim()}>
      <div
        className={`step-indicator-item ${isStep1Active ? 'active' : isStep1Completed ? 'completed' : 'pending'}`}
      >
        <div className="step-badge">
          {isStep1Completed ? <IconApprovalCheck size={14} /> : '1'}
        </div>
        <span className="step-label">Pick Daily Rule</span>
        <span className="step-label-mobile">Rule</span>
      </div>

      <IconManiculeRight size={16} className="step-separator" />

      <div
        className={`step-indicator-item ${isStep2Active ? 'active' : isStep2Completed ? 'completed' : 'pending'}`}
      >
        <div className="step-badge">
          {isStep2Completed ? <IconApprovalCheck size={14} /> : '2'}
        </div>
        <span className="step-label">Practice Exercises</span>
        <span className="step-label-mobile">Exercises</span>
      </div>

      <IconManiculeRight size={16} className="step-separator" />

      <div
        className={`step-indicator-item ${isStep3Active ? 'active' : 'pending'}`}
      >
        <div className="step-badge">3</div>
        <span className="step-label">AI Feedback &amp; Score</span>
        <span className="step-label-mobile">Results</span>
      </div>
    </div>
  );
};

export default StepIndicator;
