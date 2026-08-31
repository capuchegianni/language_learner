import React from 'react';
import { Award } from 'lucide-react';
import { GradingResult, LessonContent } from '../../../../types';
import { Pill } from '../../../../components/Pill';
import './AIFeedbackDisplay.css';

export interface AIFeedbackDisplayProps {
  gradingResult: GradingResult;
  userSubmission?: { ex1?: string; ex2?: string; ex3?: string } | null;
  lessonContent?: LessonContent | null;
  title?: string;
  className?: string;
}

export const AIFeedbackDisplay: React.FC<AIFeedbackDisplayProps> = ({
  gradingResult,
  userSubmission,
  lessonContent,
  title = 'AI Grading Results',
  className = '',
}) => {
  return (
    <div className={`feedback-display-container ${className}`.trim()}>
      {/* Overall Score Banner */}
      <div className="glass-card feedback-score-banner">
        <Award size={48} className="feedback-score-icon" />
        <h2 className="feedback-score-title">{title}</h2>
        <div
          className={`feedback-score-value ${gradingResult.overallScore >= 80 ? 'high' : 'low'}`}
        >
          {gradingResult.overallScore}%
        </div>
        <p className="feedback-general-text">{gradingResult.generalFeedback}</p>
      </div>

      {/* OCR Box if image uploaded */}
      {gradingResult.handwrittenOcrText && (
        <div className="glass-card feedback-ocr-card">
          <h3 className="feedback-ocr-header">
            Vision AI OCR Handwritten Transcription:
          </h3>
          <p className="kr-text feedback-ocr-text">{gradingResult.handwrittenOcrText}</p>
        </div>
      )}

      {/* Exercise 1 Breakdown */}
      <div className="glass-card feedback-exercise-card">
        <div className="feedback-exercise-header">
          <h3 className="feedback-exercise-title">
            Exercise 1: Rule Application
          </h3>
          <Pill variant={gradingResult.exercise1.score >= 80 ? 'success' : 'warning'}>
            {gradingResult.exercise1.score}% Score
          </Pill>
        </div>

        {lessonContent?.exercise1 && (
          <div className="feedback-task-box">
            <div className="feedback-task-label">Original Task &amp; Target Words:</div>
            <p className="feedback-task-content">
              {lessonContent.exercise1.instruction}
              {lessonContent.exercise1.targetWords &&
                lessonContent.exercise1.targetWords.length > 0 && (
                  <span className="feedback-task-target">
                    (Target:{' '}
                    <strong className="kr-text feedback-task-target-words">
                      {lessonContent.exercise1.targetWords.join(', ')}
                    </strong>
                    )
                  </span>
                )}
            </p>
          </div>
        )}

        {userSubmission?.ex1 && (
          <div className="feedback-submission-box">
            <div className="feedback-submission-label">Your Answer:</div>
            <p className="kr-text feedback-submission-text">{userSubmission.ex1}</p>
          </div>
        )}

        <p className="feedback-text-desc">{gradingResult.exercise1.feedback}</p>

        {gradingResult.exercise1.corrections?.length > 0 && (
          <div className="feedback-corrections-box">
            <div className="feedback-corrections-label">Corrections &amp; Notes:</div>
            <ul className="feedback-corrections-list">
              {gradingResult.exercise1.corrections.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Exercise 2 Breakdown */}
      <div className="glass-card feedback-exercise-card">
        <div className="feedback-exercise-header">
          <h3 className="feedback-exercise-title">
            Exercise 2: Sentence Translations
          </h3>
          <Pill variant={gradingResult.exercise2.score >= 80 ? 'success' : 'warning'}>
            {gradingResult.exercise2.score}% Score
          </Pill>
        </div>

        {lessonContent?.exercise2 && (
          <div className="feedback-task-box">
            <div className="feedback-task-label">Original English Sentences:</div>
            <ul className="feedback-task-list">
              {lessonContent.exercise2.sentencesToTranslate?.map((s, i) => (
                <li key={i} className="feedback-task-list-item">
                  {s}
                </li>
              ))}
            </ul>
          </div>
        )}

        {userSubmission?.ex2 && (
          <div className="feedback-submission-box">
            <div className="feedback-submission-label">Your Translation:</div>
            <p className="kr-text feedback-submission-text">{userSubmission.ex2}</p>
          </div>
        )}

        <p className="feedback-text-desc">{gradingResult.exercise2.feedback}</p>

        {gradingResult.exercise2.corrections?.length > 0 && (
          <div className="feedback-corrections-box">
            <div className="feedback-corrections-label">Corrections &amp; Notes:</div>
            <ul className="feedback-corrections-list">
              {gradingResult.exercise2.corrections.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Exercise 3 Breakdown */}
      <div className="glass-card feedback-exercise-card">
        <div className="feedback-exercise-header">
          <h3 className="feedback-exercise-title">
            Exercise 3: Free Paragraph Creation
          </h3>
          <Pill variant={gradingResult.exercise3.score >= 80 ? 'success' : 'warning'}>
            {gradingResult.exercise3.score}% Score
          </Pill>
        </div>

        {lessonContent?.exercise3 && (
          <div className="feedback-task-box">
            <div className="feedback-task-label">Original English Story:</div>
            <p className="feedback-task-content">{lessonContent.exercise3.textToTranslate}</p>
          </div>
        )}

        {userSubmission?.ex3 && (
          <div className="feedback-submission-box">
            <div className="feedback-submission-label">Your Submission:</div>
            <p className="kr-text feedback-submission-text">{userSubmission.ex3}</p>
          </div>
        )}

        <p className="feedback-text-desc">{gradingResult.exercise3.feedback}</p>

        {gradingResult.exercise3.corrections?.length > 0 && (
          <div className="feedback-corrections-box">
            <div className="feedback-corrections-label">Corrections &amp; Notes:</div>
            <ul className="feedback-corrections-list">
              {gradingResult.exercise3.corrections.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIFeedbackDisplay;
