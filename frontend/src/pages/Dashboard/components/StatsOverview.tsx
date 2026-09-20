import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../../components';
import {
  IconLexicon,
  IconGrammarGazette,
  IconApprovalCheck,
  IconAwardLaurel,
} from '../../../components/icons';
import { DashboardStats } from '../../../types';

export interface StatsOverviewProps {
  stats: DashboardStats | null;
  loading: boolean;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ stats, loading }) => {
  const navigate = useNavigate();

  return (
    <div className="stats-grid" id="tutorial-stats-grid">
      <Card
        as="button"
        isInteractive
        className="stat-card"
        onClick={() => navigate('/words')}
        aria-label="View Words in Bank"
        title="Go to Word Bank"
      >
        <div className="stat-icon">
          <IconLexicon size={32} />
        </div>
        <div className="stat-content">
          <div className="stat-value">{loading ? '-' : stats?.totalWords ?? 0}</div>
          <div className="stat-label">Words in Bank</div>
        </div>
      </Card>

      <Card
        as="button"
        isInteractive
        className="stat-card"
        onClick={() => navigate('/rules')}
        aria-label="View Mastered Rules"
        title="Go to Rule Bank"
      >
        <div className="stat-icon">
          <IconGrammarGazette size={32} />
        </div>
        <div className="stat-content">
          <div className="stat-value">{loading ? '-' : stats?.totalRules ?? 0}</div>
          <div className="stat-label">Mastered Rules</div>
        </div>
      </Card>

      <Card
        as="button"
        isInteractive
        className="stat-card"
        onClick={() => navigate('/history?status=GRADED')}
        aria-label="View Completed Lessons"
        title="Go to History (Graded Lessons)"
      >
        <div className="stat-icon">
          <IconApprovalCheck size={32} />
        </div>
        <div className="stat-content">
          <div className="stat-value">{loading ? '-' : stats?.completedLessons ?? 0}</div>
          <div className="stat-label">Completed Lessons</div>
        </div>
      </Card>

      <Card className="stat-card">
        <div className="stat-icon">
          <IconAwardLaurel size={32} />
        </div>
        <div className="stat-content">
          <div className="stat-value">{loading ? '-' : `${stats?.averageScore ?? 0}%`}</div>
          <div className="stat-label">Average Score</div>
        </div>
      </Card>
    </div>
  );
};
