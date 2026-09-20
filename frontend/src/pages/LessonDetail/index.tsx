import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { IconManiculeLeft } from '../../components/icons';
import { api } from '../../services/api';
import { Lesson, LessonContent, GradingResult } from '../../types';
import { RuleExplanation } from '../NewLesson/components/RuleExplanation';
import { WordsLearned } from '../NewLesson/components/WordsLearned';
import { AIFeedbackDisplay } from '../NewLesson/components/AIFeedbackDisplay';
import { LoadingSpinner, EmptyState, CodeBlock, Pill, Button, Card } from '../../components';
import './LessonDetail.css';

export interface LessonDetailProps {
  lesson?: Lesson | null;
  feedbackTitle?: string;
  showBackBtn?: boolean;
  showFinishBtn?: boolean;
  onFinish?: () => void;
}

export const LessonDetail: React.FC<LessonDetailProps> = ({
  lesson: initialLesson,
  feedbackTitle = 'AI Grading Results',
  showBackBtn = true,
  showFinishBtn = false,
  onFinish,
}) => {
  const { id: lessonId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<Lesson | null>(initialLesson || null);
  const [loading, setLoading] = useState<boolean>(!initialLesson && Boolean(lessonId));

  useEffect(() => {
    if (initialLesson) {
      setLesson(initialLesson);
      setLoading(false);
      return;
    }

    if (!lessonId) {
      setLoading(false);
      return;
    }

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
  }, [lessonId, initialLesson]);

  if (!initialLesson && !lessonId) {
    return null;
  }

  if (loading) {
    return (
      <div className="lesson-detail-container">
        <LoadingSpinner variant="card" />
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="lesson-detail-container">
        <EmptyState
          title="Lesson Not Found"
          message="The requested lesson could not be loaded or has been deleted."
          action={
            <Button
              variant="secondary"
              onClick={() => navigate(-1)}
            >
              Back to Dashboard
            </Button>
          }
        />
      </div>
    );
  }

  const lessonContent: LessonContent | null = lesson.lessonData
    ? JSON.parse(lesson.lessonData)
    : null;
  const aiFeedback: GradingResult | null = lesson.aiFeedback
    ? JSON.parse(lesson.aiFeedback)
    : null;
  const userSubmission: { ex1?: string; ex2?: string; ex3?: string } | null =
    lesson.userSubmission ? JSON.parse(lesson.userSubmission) : null;

  return (
    <div className="lesson-detail-container">
      {showBackBtn && (
        <Button
          variant="secondary"
          className="back-btn"
          onClick={() => navigate(-1)}
          icon={<IconManiculeLeft size={18} />}
        >
          <span>Back</span>
        </Button>
      )}

      <Card className="lesson-detail-header-card">
        <div className="lesson-detail-title-group">
          <div className="lesson-detail-title-row">
            <h1 className="target-text lesson-detail-title">
              {lesson.rule?.title || lesson.title}
            </h1>
            {lesson.isReview && <Pill variant="warning">Review</Pill>}
          </div>
          <p className="lesson-detail-meta">
            Completed on {new Date(lesson.createdAt).toLocaleDateString()} • {lesson.wordsCount} Target Words
          </p>
        </div>

        {lesson.overallScore !== null && lesson.overallScore !== undefined && (
          <div className="lesson-detail-score-box">
            <div
              className={`lesson-detail-score-value ${lesson.overallScore >= 80 ? 'high' : 'low'}`}
            >
              {lesson.overallScore}%
            </div>
            <div className="lesson-detail-score-label">
              Overall Score
            </div>
          </div>
        )}
      </Card>

      {/* Rule Details & Words Learned */}
      {lessonContent && <WordsLearned lessonContent={lessonContent} />}
      {lessonContent && <RuleExplanation lessonContent={lessonContent} />}

      {/* AI Teacher Grading & User Answers */}
      {aiFeedback && (
        <AIFeedbackDisplay
          gradingResult={aiFeedback}
          userSubmission={userSubmission}
          lessonContent={lessonContent}
          title={feedbackTitle}
        />
      )}

      {/* Raw Prompt */}
      {lesson.rawPrompt && (
        <CodeBlock
          title="Raw Generated Prompt"
          code={lesson.rawPrompt}
        />
      )}

      {showFinishBtn && (
        <Button
          variant="primary"
          className="lesson-detail-finish-btn"
          onClick={onFinish || (() => navigate('/'))}
        >
          Finish Lesson &amp; Return to Dashboard
        </Button>
      )}
    </div>
  );
};

export default LessonDetail;
