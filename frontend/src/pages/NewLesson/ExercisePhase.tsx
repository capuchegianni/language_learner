import React from 'react';
import { Image as ImageIcon, Upload, Send, PenTool } from 'lucide-react';
import { LessonContent } from '../../types';

interface ExercisePhaseProps {
  lessonContent: LessonContent;
  ex1Answers: string[];
  setEx1Answers: (ans: string[]) => void;
  ex2Answers: string[];
  setEx2Answers: (ans: string[]) => void;
  ex3Answer: string;
  setEx3Answer: (ans: string) => void;
  imageFiles: File[];
  imagePreviews: string[];
  handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  clearImages: () => void;
  submitting: boolean;
  onSubmit: (e: React.ChangeEvent<HTMLFormElement>) => void;
  onBack: () => void;
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
}) => {
  return (
    <form onSubmit={onSubmit}>
      <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <PenTool size={18} color="var(--accent-primary)" />
          <span>Practice Exercises</span>
        </h3>

        {/* Exercise 1 */}
        <div className="input-group" style={{ marginBottom: '2.5rem' }}>
          <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>
            Exercise 1: Rule Application
          </h4>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            {lessonContent.exercise1.instruction} (Target: {lessonContent.exercise1.targetWords?.join(', ')})
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {lessonContent.exercise1.targetWords?.map((word, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span className="kr-text" style={{ minWidth: '80px', fontWeight: 600 }}>{word}</span>
                <input
                  type="text"
                  value={ex1Answers[idx] || ''}
                  onChange={(e) => {
                    const newAns = [...ex1Answers];
                    newAns[idx] = e.target.value;
                    setEx1Answers(newAns);
                  }}
                  placeholder="Conjugated answer..."
                  className="kr-text"
                  style={{ flex: 1, padding: '0.6rem 0.85rem', background: 'rgba(15,23,42,0.6)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: '#fff' }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Exercise 2 */}
        <div className="input-group" style={{ marginBottom: '2.5rem' }}>
          <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff', marginBottom: '1rem' }}>
            Exercise 2: Sentence Translation (3 Sentences)
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {lessonContent.exercise2.sentencesToTranslate?.map((sentence, idx) => (
              <div key={idx}>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>{idx + 1}. {sentence}</p>
                <input
                  type="text"
                  value={ex2Answers[idx] || ''}
                  onChange={(e) => {
                    const newAns = [...ex2Answers];
                    newAns[idx] = e.target.value;
                    setEx2Answers(newAns);
                  }}
                  placeholder="Your translation..."
                  className="kr-text"
                  style={{ width: '100%', padding: '0.6rem 0.85rem', background: 'rgba(15,23,42,0.6)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: '#fff' }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Exercise 3 */}
        <div className="input-group" style={{ marginBottom: '2.5rem' }}>
          <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff', marginBottom: '0.75rem' }}>
            Exercise 3: Mini Story Translation (30-50 words)
          </h4>
          <div style={{ background: 'rgba(15,23,42,0.6)', padding: '0.85rem', borderRadius: 'var(--radius-sm)', marginBottom: '0.75rem', fontSize: '0.9rem', fontStyle: 'italic', border: '1px solid var(--border-color)' }}>
            "{lessonContent.exercise3.textToTranslate}"
          </div>
          <textarea
            value={ex3Answer}
            onChange={(e) => setEx3Answer(e.target.value)}
            placeholder="Type your translation of the story..."
            className="kr-text"
          />
        </div>

        {/* Multimodal Vision Upload Option */}
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem', marginTop: '1.5rem' }}>
          <label style={{ fontWeight: 600, color: 'var(--accent-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <ImageIcon size={18} />
            <span>Or Upload Photo of Handwritten Exercises (Vision AI OCR)</span>
          </label>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
            Wrote your answers in a physical notebook? Snap up to 3 photos and upload them! Vision AI will read your handwriting and evaluate it.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <label className="btn btn-secondary" style={{ cursor: 'pointer' }}>
              <Upload size={18} />
              <span>Choose Photo(s)</span>
              <input type="file" accept="image/*" multiple onChange={handleImageChange} style={{ display: 'none' }} />
            </label>
            {imageFiles.length > 0 && (
              <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
                {imageFiles.map((f, i) => (
                  <span key={i} style={{ fontSize: '0.85rem', color: 'var(--accent-success)' }}>Selected: {f.name}</span>
                ))}
              </div>
            )}
            {imageFiles.length > 0 && (
              <button type="button" className="btn btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }} onClick={clearImages}>
                Clear
              </button>
            )}
          </div>

          {imagePreviews.length > 0 && (
            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
              {imagePreviews.map((preview, i) => (
                <img key={i} src={preview} alt={`Handwritten preview ${i + 1}`} style={{ height: '120px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color-glow)', objectFit: 'cover' }} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Submit Form Button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onBack}
        >
          Back to Selection
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          style={{ minWidth: '220px' }}
          disabled={submitting}
        >
          {submitting ? (
            <>
              <div className="spinner" />
              <span>AI Teacher Grading...</span>
            </>
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
