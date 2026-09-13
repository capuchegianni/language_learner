import React from 'react';
import { useNavigate } from 'react-router-dom';
import { History, Sparkles, Clock } from 'lucide-react';
import { useLanguages } from '../../contexts/LanguageContext';
import { useLessonHistory } from './hooks/useLessonHistory';
import { HistoryFilterBar } from './components/HistoryFilterBar';
import { PageHeader } from '../../components/PageHeader';
import { LessonCard } from '../../components/LessonCard';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { EmptyState } from '../../components/EmptyState';
import './LessonHistory.css';

export const LessonHistory: React.FC = () => {
  const { targetLanguage } = useLanguages();
  const navigate = useNavigate();
  const {
    lessons,
    displayedLessons,
    loading,
    search,
    setSearch,
    filterStatus,
    setFilterStatus,
    deleteLesson,
  } = useLessonHistory();

  return (
    <div className="history-container">
      <PageHeader
        id="tutorial-history-header"
        icon={<History style={{ color: 'var(--accent-primary)' }} />}
        title="Lesson History"
        subtitle={`All past generated, submitted, and graded ${targetLanguage} lessons. Total: ${lessons.length} lesson${lessons.length !== 1 ? 's' : ''}.`}
        actions={
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => navigate('/lessons/new')}
          >
            <Sparkles size={18} />
            <span>New Lesson</span>
          </button>
        }
      />

      <HistoryFilterBar
        search={search}
        onSearchChange={setSearch}
        filterStatus={filterStatus}
        onFilterStatusChange={setFilterStatus}
      />

      <div id="tutorial-history-list">
        {loading ? (
          <LoadingSpinner variant="card" />
        ) : displayedLessons.length === 0 ? (
          <EmptyState
            icon={<Clock size={40} />}
            message={
              search || filterStatus
                ? 'No lessons match your search and filter criteria.'
                : 'No lessons yet.'
            }
          />
        ) : (
          <div className="history-list-container">
            {displayedLessons.map((lesson) => (
              <LessonCard
                key={lesson.id}
                lesson={lesson}
                onDelete={deleteLesson}
                showStatusPill={true}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LessonHistory;
