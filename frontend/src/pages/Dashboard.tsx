import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { DashboardStats, Lesson } from '../types';
import { Sparkles, BookOpen, Scroll, Award, ArrowRight, CheckCircle2, Clock, Trash2 } from 'lucide-react';
import { useLanguages } from '../contexts/LanguageContext';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { targetLanguage } = useLanguages();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await api.getDashboardStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleDeleteLesson = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this lesson from history?')) {
      await api.deleteLesson(id);
      loadStats();
    }
  };

  return (
    <div className="dashboard-container">
      {/* Welcome Banner */}
      <div className="glass-card welcome-banner" id="tutorial-welcome-banner" style={{ marginBottom: '2rem', background: 'var(--gradient-glow)', borderColor: 'var(--border-color-glow)' }}>
        <div className="welcome-banner-content">
          <div>
            <h1 className="welcome-title">
              Ready for Today's {targetLanguage} Lesson?
            </h1>
            <p className="welcome-subtitle">
              Your personal AI tutor generates custom rules, manages your vocabulary bank, and evaluates your handwritten or typed exercise submissions in real time.
            </p>
          </div>
          <button className="btn btn-primary welcome-action-btn" id="tutorial-start-lesson-btn" onClick={() => navigate('/lessons/new')}>
            <Sparkles size={20} />
            <span>Start Daily Lesson</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
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
            <div className="stat-value">{loading ? '-' : stats?.totalWords || 0}</div>
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
            <div className="stat-value">{loading ? '-' : stats?.totalRules || 0}</div>
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
            <div className="stat-value">{loading ? '-' : stats?.completedLessons || 0}</div>
            <div className="stat-label">Completed Lessons</div>
          </div>
        </button>

        <div className="glass-card stat-card">
          <div className="stat-icon" style={{ color: 'var(--accent-warning)' }}>
            <Award size={24} />
          </div>
          <div>
            <div className="stat-value">{loading ? '-' : `${stats?.averageScore || 0}%`}</div>
            <div className="stat-label">Average Score</div>
          </div>
        </div>
      </div>

      {/* Main Grid Actions & Recent History */}
      <div className="dashboard-main-grid">
        {/* Quick Hub Navigation */}
        <div id="tutorial-quick-hub" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 600 }}>Quick Learning Hub</h2>

          <div
            className="glass-card quick-hub-card"
            onClick={() => navigate('/lessons/new')}
          >
            <div className="quick-hub-card-content">
              <div className="quick-hub-icon" style={{ background: 'rgba(99, 102, 241, 0.2)', color: 'var(--accent-primary)' }}>
                <Sparkles size={24} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Generate Daily Lesson</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Get 3 AI rule proposals or start a spaced review session.</p>
              </div>
              <ArrowRight size={18} color="var(--text-secondary)" className="quick-hub-arrow" />
            </div>
          </div>

          <div
            className="glass-card quick-hub-card"
            onClick={() => navigate('/words')}
          >
            <div className="quick-hub-card-content">
              <div className="quick-hub-icon" style={{ background: 'rgba(6, 182, 212, 0.2)', color: 'var(--accent-secondary)' }}>
                <BookOpen size={24} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Manage Vocabulary Bank</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>View, search, or add custom {targetLanguage} words & meanings.</p>
              </div>
              <ArrowRight size={18} color="var(--text-secondary)" className="quick-hub-arrow" />
            </div>
          </div>

          <div
            className="glass-card quick-hub-card"
            onClick={() => navigate('/rules')}
          >
            <div className="quick-hub-card-content">
              <div className="quick-hub-icon" style={{ background: 'rgba(168, 85, 247, 0.2)', color: 'var(--accent-purple)' }}>
                <Scroll size={24} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Browse Grammar Rule Bank</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Review all previously mastered rules and sentence patterns.</p>
              </div>
              <ArrowRight size={18} color="var(--text-secondary)" className="quick-hub-arrow" />
            </div>
          </div>
        </div>

        {/* Recent Lessons List */}
        <div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 600, marginBottom: '1.25rem' }}>Recent Lessons</h2>
          {loading ? (
            <div className="glass-card" style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
              <div className="spinner" />
            </div>
          ) : stats?.recentLessons?.length === 0 ? (
            <div className="glass-card" style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-secondary)' }}>
              <Clock size={40} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
              <p>No lessons generated yet.</p>
              <button
                className="btn btn-primary"
                style={{ marginTop: '1rem' }}
                onClick={() => navigate('/lessons/new')}
              >
                Create Your First Lesson
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {stats?.recentLessons?.slice(0, 3).map((lesson: Lesson) => (
                <div
                  key={lesson.id}
                  className="glass-card recent-lesson-item"
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    if (lesson.status === 'GENERATED' || lesson.status === 'SUBMITTED') {
                      navigate(`/lessons/${lesson.id}/resume`);
                    } else {
                      navigate(`/lessons/${lesson.id}`);
                    }
                  }}
                >
                  <div className="recent-lesson-info">
                    <div className="recent-lesson-title-row">
                      <span className="kr-text recent-lesson-title">
                        {lesson.rule?.title || lesson.title}
                      </span>
                      {lesson.isReview && <span className="pill pill-warning">Review</span>}
                    </div>
                    <div className="recent-lesson-meta">
                      {new Date(lesson.createdAt).toLocaleDateString()} • {lesson.wordsCount} Words
                    </div>
                  </div>

                  <div className="recent-lesson-actions">
                    {lesson.overallScore !== null && lesson.overallScore !== undefined ? (
                      <span className={`pill ${lesson.overallScore >= 80 ? 'pill-success' : 'pill-primary'}`}>
                        {lesson.overallScore}% Score
                      </span>
                    ) : (
                      <span className="pill pill-warning">Pending</span>
                    )}
                    <button
                      type="button"
                      className="icon-btn icon-btn-delete"
                      onClick={(e) => handleDeleteLesson(e, lesson.id)}
                      title="Delete lesson"
                      aria-label={`Delete lesson: ${lesson.rule?.title || lesson.title}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
              {(stats?.recentLessons?.length ?? 0) > 3 && (
                <button
                  className="btn btn-secondary"
                  style={{ alignSelf: 'center', marginTop: '0.5rem', width: '100%', maxWidth: '280px' }}
                  onClick={() => navigate('/history')}
                >
                  <span>View All Lessons</span>
                  <ArrowRight size={16} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
