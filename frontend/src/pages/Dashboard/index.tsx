import React from 'react';
import { useDashboardStats } from './hooks/useDashboardStats';
import { WelcomeBanner } from './components/WelcomeBanner';
import { StatsOverview } from './components/StatsOverview';
import { QuickLearningHub } from './components/QuickLearningHub';
import { RecentLessonsList } from './components/RecentLessonsList';
import './Dashboard.css';

export const Dashboard: React.FC = () => {
  const { stats, loading, deleteLesson } = useDashboardStats();

  return (
    <div className="dashboard-container">
      <WelcomeBanner />
      <StatsOverview stats={stats} loading={loading} />
      <div className="dashboard-main-grid">
        <QuickLearningHub />
        <RecentLessonsList
          stats={stats}
          loading={loading}
          onDeleteLesson={deleteLesson}
        />
      </div>
    </div>
  );
};

export default Dashboard;
