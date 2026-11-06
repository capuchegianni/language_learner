import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconChronicle, IconHazardAlert, IconManiculeRight, IconTrashShears } from '../../../components/icons';
import { Lesson, DashboardStats } from '../../../types';
import { LoadingSpinner, EmptyState, LessonCard, Button, Card, Modal } from '../../../components';

export interface RecentLessonsListProps {
  stats: DashboardStats | null;
  loading: boolean;
  onDeleteLesson: (id: string) => Promise<void>;
}

export const RecentLessonsList: React.FC<RecentLessonsListProps> = ({
  stats,
  loading,
  onDeleteLesson,
}) => {
  const navigate = useNavigate();
  const [lessonToDelete, setLessonToDelete] = useState<Lesson | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  if (loading) {
    return (
      <div className="dashboard-recent-column">
        <h2 className="dashboard-section-title">Recent Lessons</h2>
        <LoadingSpinner variant="card" />
      </div>
    );
  }

  const recentLessons = stats?.recentLessons || [];

  if (recentLessons.length === 0) {
    return (
      <div className="dashboard-recent-column">
        <h2 className="dashboard-section-title">Recent Lessons</h2>
        <EmptyState
          icon={<IconChronicle size={40} />}
          message="No lessons generated yet."
          action={
            <Button
              variant="primary"
              onClick={() => navigate('/lessons/new')}
            >
              Create Your First Lesson
            </Button>
          }
        />
      </div>
    );
  }

  const displayedLessons = recentLessons.slice(
    0,
    recentLessons.length >= 3 ? 2 : recentLessons.length,
  );

  return (
    <div className="dashboard-recent-column">
      <h2 className="dashboard-section-title">Recent Lessons</h2>

      {displayedLessons.map((lesson: Lesson) => (
        <LessonCard
          key={lesson.id}
          lesson={lesson}
          onDelete={() => setLessonToDelete(lesson)}
        />
      ))}

      {recentLessons.length >= 3 && (
        <Card
          isInteractive
          className="quick-hub-card"
          onClick={() => navigate('/history')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              navigate('/history');
            }
          }}
        >
          <div className="quick-hub-card-content">
            <div className="quick-hub-icon">
              <IconChronicle size={24} />
            </div>
            <div className="quick-hub-text">
              <h3 className="quick-hub-title">View All Past Lessons</h3>
              <p className="quick-hub-desc">
                Browse full history, scores, submissions, and detailed feedback.
              </p>
            </div>
            <div className="quick-hub-arrow-wrapper">
              <IconManiculeRight size={18} className="quick-hub-arrow" />
            </div>
          </div>
        </Card>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={lessonToDelete !== null}
        onClose={() => !isDeleting && setLessonToDelete(null)}
        icon={<IconHazardAlert size={20} />}
        title="Delete Lesson"
        maxWidth="440px"
        danger
      >
        <p className="modal-prompt-text">
          Are you sure you want to delete this lesson from history? This action cannot be undone.
        </p>
        <div className="modal-actions">
          <Button
            variant="secondary"
            onClick={() => setLessonToDelete(null)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            disabled={isDeleting}
            icon={isDeleting ? undefined : <IconTrashShears size={16} />}
            onClick={async () => {
              if (!lessonToDelete) return;
              setIsDeleting(true);
              try {
                await onDeleteLesson(lessonToDelete.id);
                setLessonToDelete(null);
              } finally {
                setIsDeleting(false);
              }
            }}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </Modal>
    </div>
  );
};
