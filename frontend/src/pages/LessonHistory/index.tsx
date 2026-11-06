import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconChronicle, IconNewDispatch, IconTrashShears, IconHazardAlert } from '../../components/icons';
import { useLanguages } from '../../contexts/LanguageContext';
import { useLessonHistory } from './hooks/useLessonHistory';
import { HistoryFilterBar } from './components/HistoryFilterBar';
import { PageHeader, LessonCard, LoadingSpinner, EmptyState, Button, Modal } from '../../components';
import { Lesson } from '../../types';
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
  const [lessonToDelete, setLessonToDelete] = useState<Lesson | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  return (
    <div className="history-container">
      <PageHeader
        id="tutorial-history-header"
        icon={<IconChronicle size={40} />}
        title="Lesson History"
        subtitle={
          <>
            <span>All past generated, submitted, and graded {targetLanguage} lessons.</span>
            <br />
            <span>Total: {lessons.length} lesson{lessons.length !== 1 ? 's' : ''}.</span>
          </>
        }
        actions={
          <Button
            variant="primary"
            onClick={() => navigate('/lessons/new')}
            icon={<IconNewDispatch size={18} />}
          >
            <span>New Lesson</span>
          </Button>
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
            icon={<IconChronicle size={40} />}
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
                onDelete={() => setLessonToDelete(lesson)}
                showStatusPill={true}
              />
            ))}
          </div>
        )}
      </div>

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
          Are you sure you want to delete this lesson? This action cannot be undone.
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
                await deleteLesson(lessonToDelete.id);
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

export default LessonHistory;
