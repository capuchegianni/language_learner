import React from 'react';
import { BookOpen, Sparkles, Database, Settings as SettingsIcon, LayoutDashboard, Scroll } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="logo-brand" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('dashboard')}>
          <div className="logo-badge">🇰🇷</div>
          <div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
              Language Learner
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 400 }}>
              AI Language Tutor & Progress Storage
            </div>
          </div>
        </div>

        <div className="nav-links">
          <button
            className={activeTab === 'dashboard' ? 'active' : ''}
            onClick={() => setActiveTab('dashboard')}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </button>

          <button
            className={activeTab === 'new-lesson' ? 'active' : ''}
            onClick={() => setActiveTab('new-lesson')}
          >
            <Sparkles size={18} />
            <span>New Lesson</span>
          </button>

          <button
            className={activeTab === 'word-bank' ? 'active' : ''}
            onClick={() => setActiveTab('word-bank')}
          >
            <Database size={18} />
            <span>Word Bank</span>
          </button>

          <button
            className={activeTab === 'rule-bank' ? 'active' : ''}
            onClick={() => setActiveTab('rule-bank')}
          >
            <Scroll size={18} />
            <span>Rule Bank</span>
          </button>

          <button
            className={activeTab === 'settings' ? 'active' : ''}
            onClick={() => setActiveTab('settings')}
          >
            <SettingsIcon size={18} />
            <span>Settings</span>
          </button>
        </div>
      </div>
    </nav>
  );
};
