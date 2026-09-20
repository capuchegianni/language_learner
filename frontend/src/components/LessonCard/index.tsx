import React from 'react';
import { useNavigate } from 'react-router-dom';
import { IconTrashShears } from '../icons';
import { Lesson } from '../../types';
import { Pill, PillVariant } from '../Pill';
import { IconButton } from '../Button';
import { Card } from '../Card';
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

  const formattedDate = new Date(lesson.createdAt).toLocaleDateString();

  return (
    <Card
      className={`lesson-card ${className}`.trim()}
      onClick={handleClick}
      role="button"
      isInteractive
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      aria-label={`Lesson: ${title}`}
    >
      <div className="lesson-card-info">
        <div className="lesson-card-title-row">
          <span className="target-text lesson-card-title">{title}</span>
          <div className="lesson-card-pills">
            {showStatusPill && (
              <Pill variant={getStatusPillVariant()} isStamp>
                {lesson.status}
              </Pill>
            )}
          </div>
        </div>

        <div className="lesson-card-meta">
          <span>{formattedDate}</span>
          <span>•</span>
          <span>
            {lesson.wordsCount} {lesson.wordsCount === 1 ? 'Word' : 'Words'}
          </span>
        </div>
      </div>

      <div className="lesson-card-actions">
        {lesson.overallScore !== null && lesson.overallScore !== undefined && lesson.status === 'GRADED' ? (
          <Pill
            variant={lesson.overallScore >= 80 ? 'success' : 'primary'}
            isStamp
            heavyBorder
          >
            {lesson.overallScore}% Score
          </Pill>
        ) : !showStatusPill ? (
          <Pill variant="warning" isStamp>
            Pending
          </Pill>
        ) : null}

        {onDelete && (
          <IconButton
            variant="delete"
            size="sm"
            iconSize={15}
            onClick={(e) => {
              e.stopPropagation();
              onDelete(e, lesson.id);
            }}
            title="Delete lesson"
            aria-label={`Delete lesson: ${title}`}
            icon={<IconTrashShears size={15} />}
          />
        )}
      </div>
    </Card>
  );
};

export default LessonCard;
