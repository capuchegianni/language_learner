import React, { useRef } from 'react';
import {
  IconDaguerreotype,
  IconUploadPress,
  IconSendTelegraph,
  IconDraftingEdit,
  IconCloseDismiss,
  IconHazardAlert,
  IconAwardLaurel,
} from '../../../../components/icons';
import { LessonContent, UsageInfo, GradingResult } from '../../../../types';
import { LoadingSpinner, Card, Button, Pill } from '../../../../components';
import { GradedTextInput, GradedTextArea } from '../../../../components/GradedPrimitives';
import { ExerciseReviewProvider, useExerciseReview } from '../../../../contexts/ExerciseReviewContext';
import { ExerciseOneDispatcher } from './ExerciseOne/ExerciseOneDispatcher';
import './ExercisePhase.css';

export const getScorePillVariant = (score: number): 'success' | 'warning' | 'danger' => {
  if (score >= 75) return 'success';
  if (score >= 25) return 'warning';
  return 'danger';
};

export interface ExercisePhaseProps {
  lessonContent: LessonContent;
  ex1Answers: string[];
  setEx1Answers?: React.Dispatch<React.SetStateAction<string[]>>;
  ex2Answers: string[];
  setEx2Answers?: React.Dispatch<React.SetStateAction<string[]>>;
  ex3Answer: string;
  setEx3Answer?: (ans: string) => void;
  imageFiles?: File[];
  imagePreviews?: string[];
  handleImageChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage?: (index: number) => void;
  submitting?: boolean;
  onSubmit?: (e: React.FormEvent) => void;
  onBack?: () => void;
  onFinish?: () => void;
  usageInfo?: UsageInfo | null;
  className?: string;
  isReviewMode?: boolean;
  gradingResult?: GradingResult | null;
}

const ExercisePhaseContent: React.FC<ExercisePhaseProps> = ({
  lessonContent,
  ex1Answers,
  setEx1Answers,
  ex2Answers,
  setEx2Answers,
  ex3Answer,
  setEx3Answer,
  imageFiles = [],
  imagePreviews = [],
  handleImageChange,
  onRemoveImage,
  submitting = false,
  onSubmit,
  onBack,
  onFinish,
  usageInfo,
  className = '',
}) => {
  const { isReviewMode, gradingResult, hasLegacyCorrections, getLegacyCorrections } = useExerciseReview();

  const isCustomPlan = usageInfo?.isCustom ?? false;
  const correctionUsage = usageInfo?.usage.LESSON_CORRECTION;
  const isRestricted = !isCustomPlan && !!(usageInfo?.isRestricted || usageInfo?.restriction);
  const restriction = usageInfo?.restriction;

  const isCorrectionLimitReached =
    !isCustomPlan &&
    correctionUsage?.limit !== null &&
    correctionUsage?.limit !== undefined &&
    correctionUsage.used >= correctionUsage.limit;

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isReviewMode && onSubmit) {
      onSubmit(e);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    // Prevent accidental form submission when pressing Enter in any single-line text input
    if (e.key === 'Enter' && (e.target as HTMLElement).tagName === 'INPUT') {
      e.preventDefault();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      onKeyDown={handleKeyDown}
      className={`exercise-phase-form ${className}`.trim()}
    >
      {/* Top Evaluation Banner in Review Mode */}
      {isReviewMode && gradingResult && (
        <Card className="exercise-review-summary-banner">
          <div className="review-summary-top">
            <div className="review-score-badge">
              <IconAwardLaurel size={24} className="review-score-icon" />
              <span className="review-score-value">{gradingResult.overallScore}%</span>
              <span className="review-score-label">Overall Score</span>
            </div>
            <div className="review-feedback-content">
              <h3 className="review-feedback-title">Teacher's Evaluation</h3>
              <p className="review-feedback-text">{gradingResult.generalFeedback}</p>
              {gradingResult.handwrittenOcrText && (
                <div className="review-ocr-box">
                  <span className="review-ocr-label">Transcribed Handwriting:</span>
                  <p className="review-ocr-text">{gradingResult.handwrittenOcrText}</p>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      <Card className="exercise-phase-card">
        <h3 className="exercise-phase-header">
          <IconDraftingEdit size={16} />
          <span>{isReviewMode ? 'Graded Exercise Review' : 'Interactive Exercise Worksheet'}</span>
        </h3>

        {/* Exercise 1: Dynamic Archetype Rendering */}
        {lessonContent.exercise1 && (
          <div className="exercise-group">
            <div className="exercise-group-header-row">
              <h4 className="exercise-group-title">
                Part 1: Practice Rule Patterns
              </h4>
              {isReviewMode && gradingResult && (
                <Pill variant={getScorePillVariant(gradingResult.exercise1.score)}>
                  {gradingResult.exercise1.score}% Score
                </Pill>
              )}
            </div>
            {isReviewMode && gradingResult?.exercise1.feedback && (
              <p className="exercise-section-feedback">{gradingResult.exercise1.feedback}</p>
            )}

            <ExerciseOneDispatcher
              instruction={lessonContent.exercise1.instruction}
              targetWords={lessonContent.exercise1.targetWords || []}
              type={lessonContent.exercise1.type}
              subjectPronouns={lessonContent.exercise1.subjectPronouns}
              answers={ex1Answers}
              onAnswerChange={(idx, val) => {
                if (setEx1Answers) {
                  const updated = [...ex1Answers];
                  updated[idx] = val;
                  setEx1Answers(updated);
                }
              }}
            />

            {isReviewMode && hasLegacyCorrections(1) && (
              <div className="exercise-legacy-corrections-box">
                <div className="legacy-corrections-label">Recorded Corrections:</div>
                <ul className="legacy-corrections-list">
                  {getLegacyCorrections(1).map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Exercise 2: Translate Sentences */}
        {lessonContent.exercise2 && (
          <div className="exercise-group">
            <div className="exercise-group-header-row">
              <h4 className="exercise-group-title">
                Part 2: English to Target Language Translations
              </h4>
              {isReviewMode && gradingResult && (
                <Pill variant={getScorePillVariant(gradingResult.exercise2.score)}>
                  {gradingResult.exercise2.score}% Score
                </Pill>
              )}
            </div>
            {isReviewMode && gradingResult?.exercise2.feedback && (
              <p className="exercise-section-feedback">{gradingResult.exercise2.feedback}</p>
            )}
            <p className="exercise-group-desc">
              Translate each sentence using the grammar rule:
            </p>

            <div className="exercise-sentences-container">
              {lessonContent.exercise2.sentencesToTranslate?.map((sentence, idx) => (
                <div key={idx} className="exercise-sentence-item">
                  <GradedTextInput
                    exerciseNumber={2}
                    inputId={String(idx)}
                    id={`ex2-sentence-${idx}`}
                    label={`${idx + 1}. ${sentence}`}
                    labelProps={{ className: 'exercise-target-words-highlight' }}
                    placeholder="Type translation..."
                    value={ex2Answers[idx] || ''}
                    onChange={(e) => {
                      if (setEx2Answers) {
                        const updated = [...ex2Answers];
                        updated[idx] = e.target.value;
                        setEx2Answers(updated);
                      }
                    }}
                    className="exercise-sentence-input"
                  />
                </div>
              ))}
            </div>

            {isReviewMode && hasLegacyCorrections(2) && (
              <div className="exercise-legacy-corrections-box">
                <div className="legacy-corrections-label">Recorded Corrections:</div>
                <ul className="legacy-corrections-list">
                  {getLegacyCorrections(2).map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Exercise 3: Free Paragraph/Story Translation */}
        {lessonContent.exercise3 && (
          <div className="exercise-group">
            <div className="exercise-group-header-row">
              <h4 className="exercise-group-title">
                Part 3: Mini Story Paragraph
              </h4>
              {isReviewMode && gradingResult && (
                <Pill variant={getScorePillVariant(gradingResult.exercise3.score)}>
                  {gradingResult.exercise3.score}% Score
                </Pill>
              )}
            </div>
            {isReviewMode && gradingResult?.exercise3.feedback && (
              <p className="exercise-section-feedback">{gradingResult.exercise3.feedback}</p>
            )}
            <p className="exercise-group-desc">
              Translate the short story paragraph below:
            </p>
            <div className="exercise-story-prompt">
              "{lessonContent.exercise3.textToTranslate}"
            </div>
            <GradedTextArea
              exerciseNumber={3}
              inputId="0"
              rows={4}
              placeholder="Write the full translated paragraph here..."
              value={ex3Answer}
              onChange={(e) => setEx3Answer && setEx3Answer(e.target.value)}
              className="exercise-story-textarea"
            />

            {isReviewMode && hasLegacyCorrections(3) && (
              <div className="exercise-legacy-corrections-box">
                <div className="legacy-corrections-label">Recorded Corrections:</div>
                <ul className="legacy-corrections-list">
                  {getLegacyCorrections(3).map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Multimodal Vision Upload Section */}
        {(!isReviewMode || imagePreviews.length > 0) && (
          <div className="vision-upload-section">
            <label className="vision-upload-label">
              <IconDaguerreotype size={18} />
              <span>
                {isReviewMode
                  ? 'Uploaded Handwritten Photos (Vision AI OCR)'
                  : 'Or Upload Photo of Handwritten Exercises (Vision AI OCR)'}
              </span>
            </label>
            {!isReviewMode && (
              <p className="vision-upload-desc">
                Wrote your answers in a physical notebook? Snap up to 3 photos and upload them! Vision AI will read your handwriting and evaluate it.
              </p>
            )}

            {imagePreviews.length > 0 && (
              <div className="vision-previews-container" aria-label="Uploaded exercise photos">
                {imagePreviews.map((preview, idx) => (
                  <div
                    key={idx}
                    className="vision-preview-card"
                    onClick={() => !isReviewMode && onRemoveImage && onRemoveImage(idx)}
                    onKeyDown={(e) => {
                      if (!isReviewMode && onRemoveImage && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault();
                        onRemoveImage(idx);
                      }
                    }}
                    role={!isReviewMode ? 'button' : undefined}
                    tabIndex={!isReviewMode ? 0 : undefined}
                    title={!isReviewMode ? 'Click to remove photo' : undefined}
                    aria-label={`Photo ${idx + 1}`}
                  >
                    <img
                      src={preview}
                      alt={`Handwritten preview ${idx + 1}`}
                      className="vision-preview-img"
                    />
                    {!isReviewMode && (
                      <div className="vision-preview-overlay">
                        <div className="vision-preview-remove-icon">
                          <IconCloseDismiss size={20} />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {!isReviewMode && (
              <div className="vision-upload-controls">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  disabled={imageFiles.length >= 3}
                  onChange={handleImageChange}
                  className="vision-hidden-input"
                />
                <Button
                  type="button"
                  variant="secondary"
                  icon={<IconUploadPress size={18} />}
                  disabled={imageFiles.length >= 3}
                  onClick={handleUploadClick}
                >
                  {imageFiles.length >= 3 ? '3 Photos Uploaded (Max)' : 'Choose Photo(s)'}
                </Button>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Limit Warning (active mode only) */}
      {!isReviewMode && isCorrectionLimitReached && (
        <div className="exercise-limit-warning" role="alert">
          <IconHazardAlert size={16} />
          <span>
            Daily lesson correction limit reached ({correctionUsage?.used}/{correctionUsage?.limit}). Resets at midnight UTC.
          </span>
        </div>
      )}

      {/* Editorial Restriction Alert Banner (active mode only) */}
      {!isReviewMode && isRestricted && (
        <div className="exercise-restriction-banner" role="alert">
          <IconHazardAlert size={18} />
          <div className="exercise-restriction-content">
            <strong>AI Access Suspended</strong>
            <span className="exercise-restriction-expiry">
              {restriction?.isPermanent || !restriction?.blockedUntil
                ? 'This restriction is permanent. Contact administration for review.'
                : `Active until ${new Date(restriction.blockedUntil).toLocaleString()}.`}
            </span>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="exercise-action-buttons">
        {isReviewMode ? (
          (onFinish || onBack) ? (
            <Button
              type="button"
              variant="primary"
              className="exercise-btn"
              onClick={onFinish || onBack}
            >
              Finish Lesson &amp; Return to Dashboard
            </Button>
          ) : null
        ) : (
          <>
            <Button
              variant="secondary"
              className="exercise-btn"
              onClick={onBack}
              disabled={submitting}
            >
              Back to Selection
            </Button>

            <Button
              type="submit"
              variant="primary"
              className="exercise-btn"
              disabled={submitting || isCorrectionLimitReached || isRestricted}
              icon={!submitting ? <IconSendTelegraph size={18} /> : undefined}
            >
              {submitting ? (
                <LoadingSpinner
                  variant="button"
                  size={18}
                  message="Grading with AI Teacher..."
                />
              ) : isRestricted ? (
                'AI Access Restricted'
              ) : isCorrectionLimitReached ? (
                `Daily Limit Reached (${correctionUsage?.used}/${correctionUsage?.limit})`
              ) : (
                'Submit for AI Grading'
              )}
            </Button>
          </>
        )}
      </div>
    </form>
  );
};

export const ExercisePhase: React.FC<ExercisePhaseProps> = (props) => {
  return (
    <ExerciseReviewProvider isReviewMode={props.isReviewMode} gradingResult={props.gradingResult}>
      <ExercisePhaseContent {...props} />
    </ExerciseReviewProvider>
  );
};

export default ExercisePhase;
