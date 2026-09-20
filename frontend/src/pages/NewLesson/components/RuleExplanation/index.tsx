import React from 'react';
import { IconGrammarGazette, IconHazardAlert } from '../../../../components/icons';
import { LessonContent } from '../../../../types';
import { Card } from '../../../../components';
import './RuleExplanation.css';

export interface RuleExplanationProps {
  lessonContent: LessonContent;
  className?: string;
}

export const RuleExplanation: React.FC<RuleExplanationProps> = ({ lessonContent, className = '' }) => {
  if (!lessonContent.rule) return null;

  const hasExamples = Boolean(lessonContent.rule.examples && lessonContent.rule.examples.length > 0);

  return (
    <Card className={`${className}`.trim()}>
      <div className="rule-explanation-header-wrapper">
        <div className="rule-explanation-badge-row">
          <IconGrammarGazette size={16} />
          <span>Rule Explanation</span>
        </div>
        {lessonContent.rule.title && (
          <h2 className="rule-explanation-title target-text">
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

      {hasExamples && (
        <div className="rule-examples-section">
          <h4 className="rule-section-label">Examples:</h4>
          <div className="rule-examples-list">
            {lessonContent.rule.examples?.map((ex, idx) => (
              <div key={idx} className="rule-example-card">
                <div className="target-text rule-example-target">{ex.targetLanguage}</div>
                <div className="rule-example-native">{ex.nativeLanguage}</div>
                {ex.explanation && (
                  <div className="rule-example-expl">{ex.explanation}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {lessonContent.rule.exceptions && (
        <div className="rule-exceptions-callout">
          <div className="rule-exceptions-header">
            <IconHazardAlert size={16} />
            <span>Note / Exceptions</span>
          </div>
          <p className="rule-exceptions-text">{lessonContent.rule.exceptions}</p>
        </div>
      )}
    </Card>
  );
};

export default RuleExplanation;

