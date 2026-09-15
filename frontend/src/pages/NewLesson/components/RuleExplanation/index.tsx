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
      <div className="rule-explanation-header-wrapper">
        <div className="rule-explanation-badge-row">
          <Scroll size={16} color="var(--accent-purple)" />
          <span>Rule Explanation</span>
        </div>
        {lessonContent.rule.title && (
          <h2 className="rule-explanation-title kr-text">
            {lessonContent.rule.title}
          </h2>
        )}
      </div>
      <div className="rule-explanation-body">
        {lessonContent.rule.explanation
          ?.split(/\n\s*\n|(?=(?:^|\n)\s*\d+\.\s+)/)
          .map((part) => part.trim())
          .filter(Boolean)
          .map((section, idx) => (
            <p key={idx} className="rule-explanation-paragraph">
              {section}
            </p>
          ))}
      </div>
      {lessonContent.rule.examples?.map((ex, idx) => (
        <div key={idx} className="rule-example-card">
          <div className="kr-text rule-example-target">{ex.targetLanguage}</div>
          <div className="rule-example-native">{ex.nativeLanguage}</div>
          {ex.explanation && (
            <div className="rule-example-expl">{ex.explanation}</div>
          )}
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
