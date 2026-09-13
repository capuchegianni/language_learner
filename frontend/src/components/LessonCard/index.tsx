import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { Lesson } from '../../types';
import { Pill, PillVariant } from '../Pill';
import { IconButton } from '../IconButton';
import './LessonCard.css';

export interface LessonCardProps {
  lesson: Lesson;
  onDelete?: (e: React.MouseEvent, id: string) => void | Promise<void>;
  showStatusPill?: boolean;
  onClick?: (lesson: Lesson) => void;
  className?: string;
}

export const LessonCard: React.FC<LessonCardProps> = ({
  lesson,
  onDelete,
  showStatusPill = false,
  onClick,
  className = '',
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick(lesson);
      return;
    }

    if (lesson.status === 'GENERATED' || lesson.status === 'SUBMITTED') {
      navigate(`/lessons/${lesson.id}/resume`);
    } else {
      navigate(`/lessons/${lesson.id}`);
    }
  };

  const title = lesson.rule?.title || lesson.title || 'Untitled Lesson';

  const getStatusPillVariant = (): PillVariant => {
    switch (lesson.status) {
      case 'GRADED':
        return 'success';
      case 'SUBMITTED':
        return 'primary';
      case 'GENERATED':
      default:
        return 'warning';
    }
  };

  return (
    <div
      className={`glass-card app-lesson-card ${className}`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      aria-label={`Lesson: ${title}`}
    >
      <div className="app-lesson-card-info">
        <div className="app-lesson-card-title-row">
          <span className="kr-text app-lesson-card-title">{title}</span>
          <div className="app-lesson-card-pills">
            {lesson.isReview && <Pill variant="warning">Review</Pill>}
            {showStatusPill && (
              <Pill variant={getStatusPillVariant()}>
                {lesson.status}
              </Pill>
            )}
          </div>
        </div>
        <div className="app-lesson-card-meta">
          <span>{new Date(lesson.createdAt).toLocaleDateString()}</span>
          <span>•</span>
          <span>{lesson.wordsCount} Words</span>
        </div>
      </div>

      <div className="app-lesson-card-actions">
        {lesson.overallScore !== null && lesson.overallScore !== undefined ? (
          <Pill variant={lesson.overallScore >= 80 ? 'success' : 'primary'}>
            {lesson.overallScore}% Score
          </Pill>
        ) : !showStatusPill ? (
          <Pill variant="warning">Pending</Pill>
        ) : null}

        {onDelete && (
          <IconButton
            variant="delete"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(e, lesson.id);
            }}
            title="Delete lesson"
            aria-label={`Delete lesson: ${title}`}
            icon={<Trash2 />}
          />
        )}
      </div>
    </div>
  );
};
