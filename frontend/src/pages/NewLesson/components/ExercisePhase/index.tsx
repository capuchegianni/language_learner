import React from 'react';
import { Image as ImageIcon, Upload, Send, PenTool } from 'lucide-react';
import { LessonContent } from '../../../../types';
import { LoadingSpinner } from '../../../../components/LoadingSpinner';
import './ExercisePhase.css';

export interface ExercisePhaseProps {
  lessonContent: LessonContent;
  ex1Answers: string[];
  setEx1Answers: React.Dispatch<React.SetStateAction<string[]>>;
  ex2Answers: string[];
  setEx2Answers: React.Dispatch<React.SetStateAction<string[]>>;
  ex3Answer: string;
  setEx3Answer: (ans: string) => void;
  imageFiles: File[];
  imagePreviews: string[];
  handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  clearImages: () => void;
  submitting: boolean;
  onSubmit: (e: React.SubmitEvent) => void;
  onBack: () => void;
  className?: string;
}

export const ExercisePhase: React.FC<ExercisePhaseProps> = ({
  lessonContent,
  ex1Answers,
  setEx1Answers,
  ex2Answers,
  setEx2Answers,
  ex3Answer,
  setEx3Answer,
  imageFiles,
  imagePreviews,
  handleImageChange,
  clearImages,
  submitting,
  onSubmit,
  onBack,
  className = '',
}) => {
  return (
    <form onSubmit={onSubmit} className={`exercise-phase-form ${className}`.trim()}>
      <div className="glass-card exercise-phase-card">
        <h3 className="exercise-phase-header">
          <PenTool size={18} color="var(--accent-primary)" />
          <span>Interactive Exercise Worksheet</span>
        </h3>

        {/* Exercise 1: Form Sentences using Rule & Words */}
        {lessonContent.exercise1 && (
          <div className="exercise-group">
            <h4 className="exercise-group-title">
              Part 1: Practice Rule Patterns
            </h4>
            <p className="exercise-group-desc">
              {lessonContent.exercise1.instruction}
              {lessonContent.exercise1.targetWords &&
                lessonContent.exercise1.targetWords.length > 0 && (
                  <span>
                    {' '}
                    (Target words:{' '}
                    <strong className="kr-text exercise-target-words-highlight">
                      {lessonContent.exercise1.targetWords.join(', ')}
                    </strong>
                    )
                  </span>
                )}
            </p>

            <div className="exercise-rows-container">
              {lessonContent.exercise1.targetWords?.map((word, idx) => (
                <div key={idx} className="exercise-input-row">
                  <span className="kr-text exercise-target-word">{word}:</span>
                  <input
                    type="text"
                    placeholder={`Write a sentence using ${word}...`}
                    value={ex1Answers[idx] || ''}
                    onChange={(e) => {
                      const updated = [...ex1Answers];
                      updated[idx] = e.target.value;
                      setEx1Answers(updated);
                    }}
                    className="exercise-text-input"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Exercise 2: Translate Sentences */}
        {lessonContent.exercise2 && (
          <div className="exercise-group">
            <h4 className="exercise-group-title">
              Part 2: English to Target Language Translations
            </h4>
            <p className="exercise-group-desc">
              Translate each sentence using the grammar rule:
            </p>

            <div className="exercise-sentences-container">
              {lessonContent.exercise2.sentencesToTranslate?.map((sentence, idx) => (
                <div key={idx} className="exercise-sentence-item">
                  <label htmlFor={`ex2-sentence-${idx}`} className="exercise-target-words-highlight">
                    {idx + 1}. {sentence}
                  </label>
                  <input
                    id={`ex2-sentence-${idx}`}
                    type="text"
                    placeholder="Type translation..."
                    value={ex2Answers[idx] || ''}
                    onChange={(e) => {
                      const updated = [...ex2Answers];
                      updated[idx] = e.target.value;
                      setEx2Answers(updated);
                    }}
                    className="exercise-sentence-input"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Exercise 3: Free Paragraph/Story Translation */}
        {lessonContent.exercise3 && (
          <div className="exercise-group">
            <h4 className="exercise-group-title">
              Part 3: Mini Story Paragraph
            </h4>
            <p className="exercise-group-desc">
              Translate the short story paragraph below:
            </p>
            <div className="exercise-story-prompt">
              "{lessonContent.exercise3.textToTranslate}"
            </div>
            <textarea
              rows={4}
              placeholder="Write the full translated paragraph here..."
              value={ex3Answer}
              onChange={(e) => setEx3Answer(e.target.value)}
              className="exercise-story-textarea"
            />
          </div>
        )}

        {/* Multimodal Vision Upload Option */}
        <div className="vision-upload-section">
          <label className="vision-upload-label">
            <ImageIcon size={18} />
            <span>Or Upload Photo of Handwritten Exercises (Vision AI OCR)</span>
          </label>
          <p className="vision-upload-desc">
            Wrote your answers in a physical notebook? Snap up to 3 photos and upload them! Vision AI will read your handwriting and evaluate it.
          </p>

          <div className="vision-upload-controls">
            <label className="btn btn-secondary vision-file-btn">
              <Upload size={18} />
              <span>Choose Photo(s)</span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="vision-hidden-input"
              />
            </label>

            {imageFiles.length > 0 && (
              <div className="vision-selected-files-list">
                {imageFiles.map((f, i) => (
                  <span key={i} className="vision-file-badge">
                    Selected: {f.name}
                  </span>
                ))}
                <button
                  type="button"
                  className="btn btn-danger vision-clear-btn"
                  onClick={clearImages}
                >
                  Clear Images
                </button>
              </div>
            )}
          </div>

          {imagePreviews.length > 0 && (
            <div className="vision-previews-container">
              {imagePreviews.map((preview, idx) => (
                <img
                  key={idx}
                  src={preview}
                  alt={`Handwritten preview ${idx + 1}`}
                  className="vision-preview-img"
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Submission Actions */}
      <div className="exercise-action-buttons">
        <button
          type="button"
          className="btn btn-secondary exercise-btn"
          onClick={onBack}
          disabled={submitting}
        >
          Back to Selection
        </button>

        <button
          type="submit"
          className="btn btn-primary exercise-btn"
          disabled={submitting}
        >
          {submitting ? (
            <LoadingSpinner
              variant="button"
              size={18}
              message="Grading with AI Teacher..."
            />
          ) : (
            <>
              <Send size={18} />
              <span>Submit for AI Grading</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default ExercisePhase;
