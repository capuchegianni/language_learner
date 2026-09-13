import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Scroll, CheckCircle2, Award } from 'lucide-react';
import { DashboardStats } from '../../../types';

export interface StatsOverviewProps {
  stats: DashboardStats | null;
  loading: boolean;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ stats, loading }) => {
  const navigate = useNavigate();

  return (
    <div className="stats-grid" id="tutorial-stats-grid">
      <button
        type="button"
        className="glass-card stat-card stat-card-clickable"
        onClick={() => navigate('/words')}
        aria-label="View Words in Bank"
        title="Go to Word Bank"
      >
        <div className="stat-icon">
          <BookOpen size={24} />
        </div>
        <div>
          <div className="stat-value">{loading ? '-' : stats?.totalWords ?? 0}</div>
          <div className="stat-label">Words in Bank</div>
        </div>
      </button>

      <button
        type="button"
        className="glass-card stat-card stat-card-clickable"
        onClick={() => navigate('/rules')}
        aria-label="View Mastered Rules"
        title="Go to Rule Bank"
      >
        <div className="stat-icon" style={{ color: 'var(--accent-purple)' }}>
          <Scroll size={24} />
        </div>
        <div>
          <div className="stat-value">{loading ? '-' : stats?.totalRules ?? 0}</div>
          <div className="stat-label">Mastered Rules</div>
        </div>
      </button>

      <button
        type="button"
        className="glass-card stat-card stat-card-clickable"
        onClick={() => navigate('/history?status=GRADED')}
        aria-label="View Completed Lessons"
        title="Go to History (Graded Lessons)"
      >
        <div className="stat-icon" style={{ color: 'var(--accent-success)' }}>
          <CheckCircle2 size={24} />
        </div>
        <div>
          <div className="stat-value">{loading ? '-' : stats?.completedLessons ?? 0}</div>
          <div className="stat-label">Completed Lessons</div>
        </div>
      </button>

      <div className="glass-card stat-card">
        <div className="stat-icon" style={{ color: 'var(--accent-warning)' }}>
          <Award size={24} />
        </div>
        <div>
          <div className="stat-value">{loading ? '-' : `${stats?.averageScore ?? 0}%`}</div>
          <div className="stat-label">Average Score</div>
        </div>
      </div>
    </div>
  );
};
