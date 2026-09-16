import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IconNewDispatch,
  IconLexicon,
  IconGrammarGazette,
  IconManiculeRight,
} from '../../../components/icons';
import { useLanguages } from '../../../contexts/LanguageContext';

export const QuickLearningHub: React.FC = () => {
  const navigate = useNavigate();
  const { targetLanguage } = useLanguages();

  return (
    <div id="tutorial-quick-hub" className="dashboard-hub-column">
      <h2 className="dashboard-section-title">Quick Learning Hub</h2>

      <div
        className="card quick-hub-card"
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
          <div className="quick-hub-icon">
            <IconNewDispatch size={24} />
          </div>
          <div className="quick-hub-text">
            <h3 className="quick-hub-title">Generate Daily Lesson</h3>
            <p className="quick-hub-desc">
              Get 3 AI rule proposals or start a spaced review session.
            </p>
          </div>
          <div className="quick-hub-arrow-wrapper">
            <IconManiculeRight size={18} className="quick-hub-arrow" />
          </div>
        </div>
      </div>

      <div
        className="card quick-hub-card"
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
          <div className="quick-hub-icon">
            <IconLexicon size={24} />
          </div>
          <div className="quick-hub-text">
            <h3 className="quick-hub-title">Manage Vocabulary Bank</h3>
            <p className="quick-hub-desc">
              View, search, or add custom {targetLanguage} words &amp; meanings.
            </p>
          </div>
          <div className="quick-hub-arrow-wrapper">
            <IconManiculeRight size={18} className="quick-hub-arrow" />
          </div>
        </div>
      </div>

      <div
        className="card quick-hub-card"
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
          <div className="quick-hub-icon">
            <IconGrammarGazette size={24} />
          </div>
          <div className="quick-hub-text">
            <h3 className="quick-hub-title">Browse Grammar Rule Bank</h3>
            <p className="quick-hub-desc">
              Review all previously mastered rules and sentence patterns.
            </p>
          </div>
          <div className="quick-hub-arrow-wrapper">
            <IconManiculeRight size={18} className="quick-hub-arrow" />
          </div>
        </div>
      </div>
    </div>
  );
};
