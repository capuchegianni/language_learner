import React from 'react';
import { Scroll } from 'lucide-react';
import { LessonContent } from '../../../../types';
import './RuleExplanation.css';

export interface RuleExplanationProps {
  lessonContent: LessonContent;
  className?: string;
}

export const RuleExplanation: React.FC<RuleExplanationProps> = ({ lessonContent, className = '' }) => {
  if (!lessonContent.rule) return null;

  return (
    <div className={`glass-card rule-explanation-card ${className}`.trim()}>
      <h3 className="rule-explanation-header">
        <Scroll size={18} color="var(--accent-purple)" />
        <span>Rule Explanation</span>
      </h3>
      <p className="rule-explanation-desc">{lessonContent.rule.explanation}</p>
      {lessonContent.rule.examples?.map((ex, idx) => (
        <div key={idx} className="rule-example-card">
          <div className="kr-text rule-example-target">{ex.targetLanguage}</div>
          <div className="rule-example-native">{ex.nativeLanguage}</div>
        </div>
      ))}
      {lessonContent.rule.exceptions && (
        <div className="rule-exceptions-callout">
          <strong>Note / Exceptions:</strong> {lessonContent.rule.exceptions}
        </div>
      )}
    </div>
  );
};

export default RuleExplanation;
