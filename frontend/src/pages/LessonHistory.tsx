import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { Lesson } from '../types';
import { History, Clock, Trash2, Sparkles } from 'lucide-react';
import { FilterInput } from '../components/FilterInput';
import { useLanguages } from '../contexts/LanguageContext';

export const LessonHistory: React.FC = () => {
  const { targetLanguage } = useLanguages();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [filterStatus, setFilterStatus] = useState(searchParams.get('status') || '');
  const statusSelectRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    const statusParam = searchParams.get('status') || '';
    const qParam = searchParams.get('q') || '';
    setFilterStatus(statusParam);
    setSearch(qParam);
  }, [searchParams]);

  const loadLessons = async (q?: string, status?: string) => {
    try {
      setLoading(true);
      const data = await api.getLessons({ q: q || undefined, status: status || undefined });
      setLessons(data);
    } catch (err) {
      console.error('Failed to load lessons', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLessons(search, filterStatus);
  }, [search, filterStatus]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this lesson?')) {
      await api.deleteLesson(id);
      loadLessons(search, filterStatus);
    }
  };

  const displayedLessons = lessons.filter((lesson) => {
    const title = (lesson.rule?.title || lesson.title || '').toLowerCase();
    const matchesSearch = !search || title.includes(search.toLowerCase());
    const matchesStatus = !filterStatus || lesson.status?.toUpperCase() === filterStatus.toUpperCase();
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="history-container">
      {/* Header */}
      <div className="page-header" id="tutorial-history-header">
        <div>
          <h1 className="page-title">
            <History style={{ color: 'var(--accent-primary)' }} />
            <span>Lesson History</span>
          </h1>
          <p className="page-subtitle">
            All past generated, submitted, and graded {targetLanguage} lessons. Total: {lessons.length} lesson{lessons.length !== 1 ? 's' : ''}.
          </p>
        </div>

        <button className="btn btn-primary page-header-btn" onClick={() => navigate('/lessons/new')}>
          <Sparkles size={18} />
          <span>New Lesson</span>
        </button>
      </div>

      {/* Search Input and Filter */}
      <div className="filter-bar" id="tutorial-history-filter">
        <FilterInput
          value={search}
          onChange={setSearch}
          placeholder="Search lessons by rule title..."
          containerStyle={{ flex: 1 }}
        />
        <label
          htmlFor="history-status-filter"
          className="glass-card filter-select-card"
          onClick={(e) => {
            if (e.target !== statusSelectRef.current) {
              try { statusSelectRef.current?.showPicker?.(); } catch {}
              statusSelectRef.current?.focus();
            }
          }}
        >
          <span className="filter-select-label">Status:</span>
          <select
            id="history-status-filter"
            ref={statusSelectRef}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select-input"
          >
            <option value="" style={{ background: '#1e293b' }}>All Lessons</option>
            <option value="GENERATED" style={{ background: '#1e293b' }}>Generated</option>
            <option value="GRADED" style={{ background: '#1e293b' }}>Graded</option>
            <option value="SUBMITTED" style={{ background: '#1e293b' }}>Submitted</option>
          </select>
        </label>
      </div>

      {/* History List */}
      <div id="tutorial-history-list">
        {loading ? (
          <div className="glass-card" style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
            <div className="spinner" />
          </div>
        ) : displayedLessons.length === 0 ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-secondary)' }}>
            <Clock size={40} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
            <p>{search || filterStatus ? 'No lessons match your search and filter criteria.' : 'No lessons yet.'}</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {displayedLessons.map((lesson) => (
            <div
              key={lesson.id}
              className="glass-card history-item-card"
              style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
              onClick={() => {
                if (lesson.status === 'GENERATED' || lesson.status === 'SUBMITTED') {
                  navigate(`/lessons/${lesson.id}/resume`);
                } else {
                  navigate(`/lessons/${lesson.id}`);
                }
              }}
            >
              <div className="history-item-info">
                <div className="history-item-title-row">
                  <span className="kr-text history-item-title">
                    {lesson.rule?.title || lesson.title}
                  </span>
                  <div className="history-item-pills">
                    {lesson.isReview && <span className="pill pill-warning">Review</span>}
                    <span className={`pill ${lesson.status === 'GRADED' ? 'pill-success' : lesson.status === 'SUBMITTED' ? 'pill-primary' : 'pill-warning'}`}>
                      {lesson.status}
                    </span>
                  </div>
                </div>
                <div className="history-item-meta">
                  {new Date(lesson.createdAt).toLocaleDateString()} • {lesson.wordsCount} Words
                </div>
              </div>

              <div className="history-item-actions">
                {lesson.overallScore !== null && lesson.overallScore !== undefined ? (
                  <span className={`pill ${lesson.overallScore >= 80 ? 'pill-success' : 'pill-primary'}`}>
                    {lesson.overallScore}% Score
                  </span>
                ) : null}
                <button
                  type="button"
                  className="icon-btn icon-btn-delete"
                  onClick={(e) => handleDelete(e, lesson.id)}
                  title="Delete lesson"
                  aria-label={`Delete lesson: ${lesson.rule?.title || lesson.title}`}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  );
};
