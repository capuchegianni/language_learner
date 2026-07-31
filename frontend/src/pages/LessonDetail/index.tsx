import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { Lesson, LessonContent, GradingResult } from '../../types';
import { ArrowLeft, Check, Copy } from 'lucide-react';
import { RuleExplanation } from '../../components/lesson/RuleExplanation';
import { WordsLearned } from '../../components/lesson/WordsLearned';
import { AIFeedbackDisplay } from '../../components/lesson/AIFeedbackDisplay';

export const LessonDetail: React.FC = () => {
  const { id: lessonId } = useParams<{ id: string }>();
  const navigate = useNavigate();
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

  if (!lessonId) {
    return null;
  }

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
        <button className="btn btn-secondary" onClick={() => navigate(-1)} style={{ marginTop: '1rem' }}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  const lessonContent: LessonContent | null = lesson.lessonData ? JSON.parse(lesson.lessonData) : null;
  const aiFeedback: GradingResult | null = lesson.aiFeedback ? JSON.parse(lesson.aiFeedback) : null;
  const userSubmission: { ex1?: string; ex2?: string; ex3?: string } | null = lesson.userSubmission ? JSON.parse(lesson.userSubmission) : null;

  const handleCopyPrompt = () => {
    if (lesson.rawPrompt) {
      navigator.clipboard.writeText(lesson.rawPrompt);
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2500);
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <button className="btn btn-secondary" onClick={() => navigate(-1)} style={{ marginBottom: '1.5rem' }}>
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

      {/* Rule Details & Words Learned */}
      {lessonContent && <WordsLearned lessonContent={lessonContent} />}
      {lessonContent && <RuleExplanation lessonContent={lessonContent} />}

      {/* AI Teacher Grading & User Answers */}
      {aiFeedback && <AIFeedbackDisplay gradingResult={aiFeedback} userSubmission={userSubmission} />}

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
