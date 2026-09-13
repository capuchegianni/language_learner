import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, History, ArrowRight } from 'lucide-react';
import { Lesson, DashboardStats } from '../../../types';
import { LoadingSpinner } from '../../../components/LoadingSpinner';
import { EmptyState } from '../../../components/EmptyState';
import { LessonCard } from '../../../components/LessonCard';

export interface RecentLessonsListProps {
  stats: DashboardStats | null;
  loading: boolean;
  onDeleteLesson: (e: React.MouseEvent, id: string) => Promise<void>;
}

export const RecentLessonsList: React.FC<RecentLessonsListProps> = ({
  stats,
  loading,
  onDeleteLesson,
}) => {
  const navigate = useNavigate();

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
          icon={<Clock size={40} />}
          message="No lessons generated yet."
          action={
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => navigate('/lessons/new')}
            >
              Create Your First Lesson
            </button>
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
          onDelete={onDeleteLesson}
        />
      ))}

      {recentLessons.length >= 3 && (
        <div
          className="glass-card quick-hub-card"
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
            <div
              className="quick-hub-icon"
              style={{ background: 'rgba(234, 179, 8, 0.2)', color: 'var(--accent-warning)' }}
            >
              <History size={24} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>View All Past Lessons</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Browse full history, scores, submissions, and detailed feedback.
              </p>
            </div>
            <div className="quick-hub-arrow-wrapper">
              <ArrowRight size={18} color="var(--text-secondary)" className="quick-hub-arrow" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
