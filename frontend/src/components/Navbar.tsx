import React from 'react';
import { NavLink } from 'react-router-dom';
import { Sparkles, Database, Settings as SettingsIcon, LayoutDashboard, Scroll, History } from 'lucide-react';

export const Navbar: React.FC = () => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <NavLink to="/" className="logo-brand" style={{ cursor: 'pointer', textDecoration: 'none', color: 'inherit' }}>
          <div className="logo-badge">🇰🇷</div>
          <div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
              Language Learner
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 400 }}>
              AI Language Tutor &amp; Progress Storage
            </div>
          </div>
        </NavLink>

        <div className="nav-links">
          <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </NavLink>

          <NavLink to="/lessons/new" className={({ isActive }) => isActive ? 'active' : ''}>
            <Sparkles size={18} />
            <span>New Lesson</span>
          </NavLink>

          <NavLink to="/history" className={({ isActive }) => isActive ? 'active' : ''}>
            <History size={18} />
            <span>History</span>
          </NavLink>

          <NavLink to="/words" className={({ isActive }) => isActive ? 'active' : ''}>
            <Database size={18} />
            <span>Word Bank</span>
          </NavLink>

          <NavLink to="/rules" className={({ isActive }) => isActive ? 'active' : ''}>
            <Scroll size={18} />
            <span>Rule Bank</span>
          </NavLink>

          <NavLink to="/settings" className={({ isActive }) => isActive ? 'active' : ''}>
            <SettingsIcon size={18} />
            <span>Settings</span>
          </NavLink>
        </div>
      </div>
    </nav>
  );
};
