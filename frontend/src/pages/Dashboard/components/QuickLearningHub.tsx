import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, BookOpen, Scroll, ArrowRight } from 'lucide-react';
import { useLanguages } from '../../../contexts/LanguageContext';

export const QuickLearningHub: React.FC = () => {
  const navigate = useNavigate();
  const { targetLanguage } = useLanguages();

  return (
    <div id="tutorial-quick-hub" className="dashboard-hub-column">
      <h2 className="dashboard-section-title">Quick Learning Hub</h2>

      <div
        className="glass-card quick-hub-card"
        onClick={() => navigate('/lessons/new')}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            navigate('/lessons/new');
          }
        }}
      >
        <div className="quick-hub-card-content">
          <div
            className="quick-hub-icon"
            style={{ background: 'rgba(99, 102, 241, 0.2)', color: 'var(--accent-primary)' }}
          >
            <Sparkles size={24} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Generate Daily Lesson</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Get 3 AI rule proposals or start a spaced review session.
            </p>
          </div>
          <div className="quick-hub-arrow-wrapper">
            <ArrowRight size={18} color="var(--text-secondary)" className="quick-hub-arrow" />
          </div>
        </div>
      </div>

      <div
        className="glass-card quick-hub-card"
        onClick={() => navigate('/words')}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            navigate('/words');
          }
        }}
      >
        <div className="quick-hub-card-content">
          <div
            className="quick-hub-icon"
            style={{ background: 'rgba(6, 182, 212, 0.2)', color: 'var(--accent-secondary)' }}
          >
            <BookOpen size={24} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Manage Vocabulary Bank</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              View, search, or add custom {targetLanguage} words &amp; meanings.
            </p>
          </div>
          <div className="quick-hub-arrow-wrapper">
            <ArrowRight size={18} color="var(--text-secondary)" className="quick-hub-arrow" />
          </div>
        </div>
      </div>

      <div
        className="glass-card quick-hub-card"
        onClick={() => navigate('/rules')}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            navigate('/rules');
          }
        }}
      >
        <div className="quick-hub-card-content">
          <div
            className="quick-hub-icon"
            style={{ background: 'rgba(168, 85, 247, 0.2)', color: 'var(--accent-purple)' }}
          >
            <Scroll size={24} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Browse Grammar Rule Bank</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Review all previously mastered rules and sentence patterns.
            </p>
          </div>
          <div className="quick-hub-arrow-wrapper">
            <ArrowRight size={18} color="var(--text-secondary)" className="quick-hub-arrow" />
          </div>
        </div>
      </div>
    </div>
  );
};
