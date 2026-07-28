import React from 'react';
import { BookOpen, Scroll } from 'lucide-react';
import { LessonContent } from '../../types';

interface RuleExplanationProps {
  lessonContent: LessonContent;
}

export const RuleExplanation: React.FC<RuleExplanationProps> = ({ lessonContent }) => {
  return (
    <>
      {/* Rule Details */}
      {lessonContent.rule && (
        <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Scroll size={18} color="var(--accent-purple)" />
            <span>Rule Explanation</span>
          </h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{lessonContent.rule.explanation}</p>
          {lessonContent.rule.examples?.map((ex, idx) => (
            <div key={idx} style={{ background: 'rgba(15,23,42,0.5)', padding: '0.5rem 0.85rem', borderRadius: 'var(--radius-sm)', marginBottom: '0.5rem', borderLeft: '3px solid var(--accent-primary)' }}>
              <div className="kr-text" style={{ fontWeight: 600 }}>{ex.korean}</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{ex.english}</div>
            </div>
          ))}
          {lessonContent.rule.exceptions && (
            <div style={{ fontSize: '0.85rem', color: 'var(--accent-warning)', background: 'rgba(245,158,11,0.1)', padding: '0.6rem 1rem', borderRadius: 'var(--radius-sm)', marginTop: '0.75rem', whiteSpace: 'pre-wrap' }}>
              <strong>Note / Exceptions:</strong> {lessonContent.rule.exceptions}
            </div>
          )}
        </div>
      )}
    </>
  );
};
