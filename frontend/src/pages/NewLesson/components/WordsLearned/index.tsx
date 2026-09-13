import React from 'react';
import { BookOpen } from 'lucide-react';
import { LessonContent } from '../../../../types';
import './WordsLearned.css';

export interface WordsLearnedProps {
  lessonContent: LessonContent;
  className?: string;
}

export const WordsLearned: React.FC<WordsLearnedProps> = ({ lessonContent, className = '' }) => {
  if (!lessonContent.newWords || lessonContent.newWords.length === 0) return null;

  return (
    <div className={`glass-card words-learned-card ${className}`.trim()}>
      <h3 className="words-learned-header">
        <BookOpen size={18} color="var(--accent-secondary)" />
        <span>Words Introduced in this Lesson</span>
      </h3>
      <div className="words-learned-grid">
        {lessonContent.newWords.map((w, idx) => (
          <div key={idx} className="word-learned-item">
            <div className="kr-text word-learned-target">{w.targetLanguage}</div>
            <div className="word-learned-native">{w.nativeLanguage}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WordsLearned;
