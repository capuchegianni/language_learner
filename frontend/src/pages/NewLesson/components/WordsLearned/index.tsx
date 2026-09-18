import React from 'react';
import { IconLexicon } from '../../../../components/icons';
import { LessonContent } from '../../../../types';
import './WordsLearned.css';

export interface WordsLearnedProps {
  lessonContent: LessonContent;
  className?: string;
}

export const WordsLearned: React.FC<WordsLearnedProps> = ({ lessonContent, className = '' }) => {
  if (!lessonContent.newWords || lessonContent.newWords.length === 0) return null;

  return (
    <div className={`card words-learned-card ${className}`.trim()}>
      <h3 className="words-learned-header">
        <IconLexicon size={18} />
        <span>Words Introduced in this Lesson</span>
      </h3>
      <div className="words-learned-grid">
        {lessonContent.newWords.map((w, idx) => (
          <div key={idx} className="word-learned-item">
            <div className="target-text word-learned-target">{w.targetLanguage}</div>
            <div className="word-learned-native">{w.nativeLanguage}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WordsLearned;
