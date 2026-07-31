import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Lesson } from '../types';
import { Clock, Trash2, Search } from 'lucide-react';

interface LessonHistoryProps {
  onSelectLesson: (id: string, status: string) => void;
  initialSearch?: string;
}

export const LessonHistory: React.FC<LessonHistoryProps> = ({ onSelectLesson, initialSearch = '' }) => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(initialSearch);

  useEffect(() => {
    setSearch(initialSearch);
  }, [initialSearch]);

  const loadLessons = async () => {
    try {
      setLoading(true);
      const data = await api.getLessons();
      setLessons(data);
    } catch (err) {
      console.error('Failed to load lessons', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLessons();
  }, []);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this lesson?')) {
      await api.deleteLesson(id);
      loadLessons();
    }
  };

  const filtered = lessons.filter((l) => {
    const title = (l.rule?.title || l.title || '').toLowerCase();
    return title.includes(search.toLowerCase());
  });

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          Lesson History
        </h1>
      </div>

      {/* Search Input */}
      <div className="glass-card" style={{ padding: '0.85rem 1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Search size={20} color="var(--text-secondary)" />
        <input
          type="text"
          placeholder="Search lessons by rule title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ background: 'transparent', border: 'none', color: '#fff', outline: 'none', width: '100%', fontSize: '1rem' }}
        />
      </div>

      {loading ? (
        <div className="glass-card" style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
          <div className="spinner" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-secondary)' }}>
          <Clock size={40} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
          <p>{search ? 'No lessons match your search.' : 'No lessons yet.'}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filtered.map((lesson) => (
            <div
              key={lesson.id}
              className="glass-card"
              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', transition: 'all 0.2s ease' }}
              onClick={() => onSelectLesson(lesson.id, lesson.status)}
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
                  style={{ padding: '0.4rem', color: 'var(--text-muted)' }}
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
