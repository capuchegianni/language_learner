import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { Lesson } from '../types';
import { Clock, Trash2 } from 'lucide-react';
import { FilterInput } from '../components/FilterInput';

export const LessonHistory: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [filterStatus, setFilterStatus] = useState(searchParams.get('status') || '');

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
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 700, margin: 0 }}>
          Lesson History
        </h1>
      </div>

      {/* Search Input and Filter */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <FilterInput
          value={search}
          onChange={setSearch}
          placeholder="Search lessons by rule title..."
          containerStyle={{ flex: 1, minWidth: '250px' }}
        />
        <div className="glass-card" style={{ padding: '0.85rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Filter Status:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{ background: 'transparent', color: '#fff', border: 'none', outline: 'none', fontSize: '1rem', cursor: 'pointer' }}
          >
            <option value="" style={{ background: '#1e293b' }}>All Lessons</option>
            <option value="GENERATED" style={{ background: '#1e293b' }}>Generated</option>
            <option value="GRADED" style={{ background: '#1e293b' }}>Graded</option>
            <option value="SUBMITTED" style={{ background: '#1e293b' }}>Submitted</option>
          </select>
        </div>
      </div>

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
              className="glass-card"
              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', transition: 'all 0.2s ease' }}
              onClick={() => {
                if (lesson.status === 'GENERATED' || lesson.status === 'SUBMITTED') {
                  navigate(`/lessons/${lesson.id}/resume`);
                } else {
                  navigate(`/lessons/${lesson.id}`);
                }
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <span className="kr-text" style={{ fontWeight: 600, fontSize: '1rem' }}>
                    {lesson.rule?.title || lesson.title}
                  </span>
                  {lesson.isReview && <span className="pill pill-warning">Review</span>}
                  <span className={`pill ${lesson.status === 'GRADED' ? 'pill-success' : lesson.status === 'SUBMITTED' ? 'pill-primary' : 'pill-warning'}`}>
                    {lesson.status}
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {new Date(lesson.createdAt).toLocaleDateString()} • {lesson.wordsCount} Words
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {lesson.overallScore !== null && lesson.overallScore !== undefined ? (
                  <span className={`pill ${lesson.overallScore >= 80 ? 'pill-success' : 'pill-primary'}`}>
                    {lesson.overallScore}% Score
                  </span>
                ) : null}
                <button
                  className="btn"
                  style={{ padding: '0.4rem', color: 'var(--accent-danger)' }}
                  onClick={(e) => handleDelete(e, lesson.id)}
                  title="Delete Lesson"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
