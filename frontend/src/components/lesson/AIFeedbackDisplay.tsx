import React from 'react';
import { Award } from 'lucide-react';
import { GradingResult } from '../../types';

interface AIFeedbackDisplayProps {
  gradingResult: GradingResult;
  userSubmission?: { ex1?: string; ex2?: string; ex3?: string } | null;
  title?: string;
}

export const AIFeedbackDisplay: React.FC<AIFeedbackDisplayProps> = ({ gradingResult, userSubmission, title = "AI Grading Results" }) => {
  return (
    <div>
      {/* Overall Score Banner */}
      <div className="glass-card" style={{ textAlign: 'center', marginBottom: '1.5rem', background: 'var(--gradient-glow)' }}>
        <Award size={48} style={{ color: 'var(--accent-warning)', margin: '0 auto 0.5rem' }} />
        <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.25rem' }}>
          {title}
        </h2>
        <div style={{ fontSize: '2.5rem', fontWeight: 800, color: gradingResult.overallScore >= 80 ? 'var(--accent-success)' : 'var(--accent-warning)', marginBottom: '0.5rem' }}>
          {gradingResult.overallScore}%
        </div>
        <p style={{ color: 'var(--text-primary)', maxWidth: '600px', margin: '0 auto', fontSize: '1rem', whiteSpace: 'pre-wrap' }}>
          {gradingResult.generalFeedback}
        </p>
      </div>

      {/* OCR Box if image uploaded */}
      {gradingResult.handwrittenOcrText && (
        <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--accent-secondary)', marginBottom: '0.5rem' }}>
            Vision AI OCR Handwritten Transcription:
          </h3>
          <p className="kr-text" style={{ background: 'rgba(15,23,42,0.6)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', fontSize: '0.95rem', whiteSpace: 'pre-wrap' }}>
            {gradingResult.handwrittenOcrText}
          </p>
        </div>
      )}

      {/* Exercise 1 Breakdown */}
      <div className="glass-card" style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Exercise 1: Rule Application</h3>
          <span className="pill pill-success">{gradingResult.exercise1.score}% Score</span>
        </div>
        {userSubmission?.ex1 && (
          <div style={{ background: 'rgba(99, 102, 241, 0.08)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '0.75rem', borderLeft: '3px solid var(--accent-secondary)' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-secondary)', marginBottom: '0.25rem' }}>Your Answer:</div>
            <p className="kr-text" style={{ fontSize: '0.9rem', whiteSpace: 'pre-wrap' }}>{userSubmission.ex1}</p>
          </div>
        )}
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', whiteSpace: 'pre-wrap' }}>
          {gradingResult.exercise1.feedback}
        </p>
        {gradingResult.exercise1.corrections?.length > 0 && (
          <div style={{ background: 'rgba(15,23,42,0.6)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-primary)', marginBottom: '0.25rem' }}>Corrections & Notes:</div>
            <ul style={{ fontSize: '0.85rem', paddingLeft: '1.2rem', color: 'var(--text-primary)' }}>
              {gradingResult.exercise1.corrections.map((c, i) => <li key={i} style={{ whiteSpace: 'pre-wrap' }}>{c}</li>)}
            </ul>
          </div>
        )}
      </div>

      {/* Exercise 2 Breakdown */}
      <div className="glass-card" style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Exercise 2: Sentence Translations</h3>
          <span className="pill pill-success">{gradingResult.exercise2.score}% Score</span>
        </div>
        {userSubmission?.ex2 && (
          <div style={{ background: 'rgba(99, 102, 241, 0.08)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '0.75rem', borderLeft: '3px solid var(--accent-secondary)' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-secondary)', marginBottom: '0.25rem' }}>Your Answer:</div>
            <p className="kr-text" style={{ fontSize: '0.9rem', whiteSpace: 'pre-wrap' }}>{userSubmission.ex2}</p>
          </div>
        )}
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', whiteSpace: 'pre-wrap' }}>
          {gradingResult.exercise2.feedback}
        </p>
        {gradingResult.exercise2.corrections?.length > 0 && (
          <div style={{ background: 'rgba(15,23,42,0.6)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-primary)', marginBottom: '0.25rem' }}>Corrections & Notes:</div>
            <ul style={{ fontSize: '0.85rem', paddingLeft: '1.2rem', color: 'var(--text-primary)' }}>
              {gradingResult.exercise2.corrections.map((c, i) => <li key={i} style={{ whiteSpace: 'pre-wrap' }}>{c}</li>)}
            </ul>
          </div>
        )}
      </div>

      {/* Exercise 3 Breakdown */}
      <div className="glass-card" style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Exercise 3: Mini Story Translation</h3>
          <span className="pill pill-success">{gradingResult.exercise3.score}% Score</span>
        </div>
        {userSubmission?.ex3 && (
          <div style={{ background: 'rgba(99, 102, 241, 0.08)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '0.75rem', borderLeft: '3px solid var(--accent-secondary)' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-secondary)', marginBottom: '0.25rem' }}>Your Answer:</div>
            <p className="kr-text" style={{ fontSize: '0.9rem', whiteSpace: 'pre-wrap' }}>{userSubmission.ex3}</p>
          </div>
        )}
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', whiteSpace: 'pre-wrap' }}>
          {gradingResult.exercise3.feedback}
        </p>
        {gradingResult.exercise3.corrections?.length > 0 && (
          <div style={{ background: 'rgba(15,23,42,0.6)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-primary)', marginBottom: '0.25rem' }}>Corrections & Notes:</div>
            <ul style={{ fontSize: '0.85rem', paddingLeft: '1.2rem', color: 'var(--text-primary)' }}>
              {gradingResult.exercise3.corrections.map((c, i) => <li key={i} style={{ whiteSpace: 'pre-wrap' }}>{c}</li>)}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
