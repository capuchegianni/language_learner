import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { IconManiculeLeft } from '../../components/icons';
import { api } from '../../services/api';
import {
  parseLessonContent,
  parseAiFeedback,
  parseUserSubmission,
  ParsedUserSubmissionResult,
} from '../../services/lesson-adapter';
import { Lesson, LessonContent, GradingResult } from '../../types';
import { RuleExplanation } from '../NewLesson/components/RuleExplanation';
import { WordsLearned } from '../NewLesson/components/WordsLearned';
import { ExercisePhase } from '../NewLesson/components/ExercisePhase';
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

  const lessonContent: LessonContent | null = parseLessonContent(lesson);
  const aiFeedback: GradingResult | null = parseAiFeedback(lesson);
  const userSubmission: ParsedUserSubmissionResult | null =
    parseUserSubmission(lesson);

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
      </Card>

      {/* Rule Details & Words Learned (hidden when lesson has been graded) */}
      {lessonContent && lesson.status !== 'GRADED' && !aiFeedback && (
        <>
          <WordsLearned lessonContent={lessonContent} />
          <RuleExplanation lessonContent={lessonContent} />
        </>
      )}

      {/* Graded Inline Exercise Review */}
      {aiFeedback && lessonContent && (
        <ExercisePhase
          lessonContent={lessonContent}
          ex1Answers={userSubmission?.ex1Answers || (userSubmission?.ex1 ? [userSubmission.ex1] : [])}
          ex2Answers={userSubmission?.ex2Answers || (userSubmission?.ex2 ? [userSubmission.ex2] : [])}
          ex3Answer={userSubmission?.ex3Answer || userSubmission?.ex3 || ''}
          isReviewMode={true}
          gradingResult={aiFeedback}
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
