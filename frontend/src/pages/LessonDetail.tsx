import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Lesson, LessonContent, GradingResult } from '../types';
import { ArrowLeft, BookOpen, Scroll, Award, CheckCircle2, Copy, Check } from 'lucide-react';

interface LessonDetailProps {
  lessonId: string;
  onBack: () => void;
}

export const LessonDetail: React.FC<LessonDetailProps> = ({ lessonId, onBack }) => {
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        setLoading(true);
        const data = await api.getLessonById(lessonId);
        setLesson(data);
      } catch (err) {
        console.error('Failed to load lesson', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLesson();
  }, [lessonId]);

  if (loading) {
    return (
      <div className="glass-card" style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="glass-card" style={{ textAlign: 'center', padding: '2rem' }}>
        <p>Lesson not found.</p>
        <button className="btn btn-secondary" onClick={onBack} style={{ marginTop: '1rem' }}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  const lessonContent: LessonContent | null = lesson.lessonData ? JSON.parse(lesson.lessonData) : null;
  const aiFeedback: GradingResult | null = lesson.aiFeedback ? JSON.parse(lesson.aiFeedback) : null;
  const userSubmission = lesson.userSubmission ? JSON.parse(lesson.userSubmission) : null;

  const handleCopyPrompt = () => {
    if (lesson.rawPrompt) {
      navigator.clipboard.writeText(lesson.rawPrompt);
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2500);
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <button className="btn btn-secondary" onClick={onBack} style={{ marginBottom: '1.5rem' }}>
        <ArrowLeft size={18} />
        <span>Back</span>
      </button>

      <div className="glass-card" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <h1 className="kr-text" style={{ fontSize: '1.6rem', fontWeight: 700 }}>
              {lesson.rule?.title || lesson.title}
            </h1>
            {lesson.isReview && <span className="pill pill-warning">Review</span>}
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Completed on {new Date(lesson.createdAt).toLocaleDateString()} • {lesson.wordsCount} Target Words
          </p>
        </div>

        {lesson.overallScore !== null && lesson.overallScore !== undefined && (
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-success)' }}>
              {lesson.overallScore}%
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Overall Score</div>
          </div>
        )}
      </div>

      {/* Words Learned */}
      {lessonContent?.newWords && (
        <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BookOpen size={18} color="var(--accent-secondary)" />
            <span>Words Introduced in this Lesson</span>
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
            {lessonContent.newWords.map((w, idx) => (
              <div key={idx} style={{ background: 'rgba(15,23,42,0.6)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                <div className="kr-text" style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-secondary)' }}>{w.korean}</div>
                <div style={{ fontSize: '0.85rem' }}>{w.english}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rule Details */}
      {lessonContent?.rule && (
        <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Scroll size={18} color="var(--accent-purple)" />
            <span>Rule Explanation</span>
          </h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>{lessonContent.rule.explanation}</p>
          {lessonContent.rule.examples?.map((ex, idx) => (
            <div key={idx} style={{ background: 'rgba(15,23,42,0.5)', padding: '0.5rem 0.85rem', borderRadius: 'var(--radius-sm)', marginBottom: '0.5rem' }}>
              <div className="kr-text" style={{ fontWeight: 600 }}>{ex.korean}</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{ex.english}</div>
            </div>
          ))}
        </div>
      )}

      {/* AI Teacher Corrections & Submissions */}
      {aiFeedback && (
        <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--accent-success)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Award size={20} />
            <span>AI Teacher Grading & Feedback</span>
          </h3>
          <p style={{ marginBottom: '1.25rem', color: 'var(--text-primary)', background: 'rgba(15,23,42,0.6)', padding: '0.85rem', borderRadius: 'var(--radius-sm)' }}>
            "{aiFeedback.generalFeedback}"
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ borderLeft: '3px solid var(--accent-primary)', paddingLeft: '0.75rem' }}>
              <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Exercise 1 (Score: {aiFeedback.exercise1?.score}%)</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{aiFeedback.exercise1?.feedback}</div>
            </div>

            <div style={{ borderLeft: '3px solid var(--accent-primary)', paddingLeft: '0.75rem' }}>
              <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Exercise 2 (Score: {aiFeedback.exercise2?.score}%)</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{aiFeedback.exercise2?.feedback}</div>
            </div>

            <div style={{ borderLeft: '3px solid var(--accent-primary)', paddingLeft: '0.75rem' }}>
              <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Exercise 3 (Score: {aiFeedback.exercise3?.score}%)</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{aiFeedback.exercise3?.feedback}</div>
            </div>
          </div>
        </div>
      )}

      {/* Raw Prompt */}
      {lesson.rawPrompt && (
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Raw Generated Prompt</h3>
            <button className="btn btn-secondary" style={{ padding: '0.3rem 0.75rem', fontSize: '0.8rem' }} onClick={handleCopyPrompt}>
              {copiedPrompt ? <Check size={14} /> : <Copy size={14} />}
              <span>{copiedPrompt ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <pre className="code-block">{lesson.rawPrompt}</pre>
        </div>
      )}
    </div>
  );
};
