import React from 'react';
import { BookOpen } from 'lucide-react';
import { LessonContent } from '../../types';

interface WordsLearnedProps {
  lessonContent: LessonContent;
}

export const WordsLearned: React.FC<WordsLearnedProps> = ({ lessonContent }) => {
  if (!lessonContent.newWords) return null;

  return (
    <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <BookOpen size={18} color="var(--accent-secondary)" />
        <span>Words Introduced in this Lesson</span>
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
        {lessonContent.newWords.map((w, idx) => (
          <div key={idx} style={{ background: 'rgba(15,23,42,0.6)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
            <div className="kr-text" style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-secondary)' }}>{w.targetLanguage}</div>
            <div style={{ fontSize: '0.85rem' }}>{w.nativeLanguage}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
