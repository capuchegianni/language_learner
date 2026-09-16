import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  IconFrontPage,
  IconNewDispatch,
  IconChronicle,
  IconLexicon,
  IconGrammarGazette,
  IconPrintShop,
  IconSunCelestial,
  IconMoonCelestial,
  IconMenuBroadsheet,
  IconCloseDismiss,
} from '../icons';
import './Navbar.css';

export interface NavbarProps {
  editionNo?: number;
}

export const Navbar: React.FC<NavbarProps> = ({ editionNo }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<'morning' | 'evening'>(() => {
    const saved = localStorage.getItem('broadsheet-theme') as 'morning' | 'evening';
    if (saved === 'morning' || saved === 'evening') {
      return saved;
    }
    return document.documentElement.getAttribute('data-theme') === 'evening'
      ? 'evening'
      : 'morning';
  });

  const location = useLocation();
  const menuRef = useRef<HTMLUListElement>(null);
  const toggleBtnRef = useRef<HTMLButtonElement>(null);

  // Sync initial theme to documentElement
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', currentTheme);
  }, [currentTheme]);

  const toggleTheme = () => {
    const nextTheme = currentTheme === 'morning' ? 'evening' : 'morning';
    setCurrentTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('broadsheet-theme', nextTheme);
  };

  // Automatically close mobile menu when route changes
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Prevent background scrolling when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [mobileOpen]);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileOpen) {
        setMobileOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileOpen]);

  // Close when clicking anywhere outside the menu
  useEffect(() => {
    if (!mobileOpen) return;

    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        toggleBtnRef.current &&
        !toggleBtnRef.current.contains(target)
      ) {
        setMobileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [mobileOpen]);

  const handleBackdropDismiss = (e: React.SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setMobileOpen(false);
  };

  const closeMenu = () => setMobileOpen(false);

  // Use previous standard page names as requested
  const navItems = [
    { path: '/', label: 'Dashboard', icon: <IconFrontPage size={16} /> },
    { path: '/lessons/new', label: 'New Lesson', icon: <IconNewDispatch size={16} /> },
    { path: '/history', label: 'History', icon: <IconChronicle size={16} /> },
    { path: '/words', label: 'Word Bank', icon: <IconLexicon size={16} /> },
    { path: '/rules', label: 'Rule Bank', icon: <IconGrammarGazette size={16} /> },
    { path: '/settings', label: 'Settings', icon: <IconPrintShop size={16} /> },
  ];

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Calculate day of year for period volume/number if editionNo not provided
  const calculateEdition = () => {
    if (editionNo) return editionNo;
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
  };

  const currentEdition = calculateEdition();

  return (
    <nav className={`navbar ${mobileOpen ? 'menu-open' : ''}`} role="banner">
      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div
          className="nav-backdrop"
          onClick={handleBackdropDismiss}
          onTouchEnd={handleBackdropDismiss}
          aria-hidden="true"
        />
      )}

      {/* Top Ear Strip (Hidden on screens <= 1040px) */}
      <div className="nav-ears">
        <div className="nav-ear-item">
          <span>VOL. IV • NO. {currentEdition}</span>
          <span>•</span>
          <span>DAILY EDITION</span>
        </div>

        <div className="nav-ear-item">
          <span>{currentDate}</span>
          <button
            type="button"
            className="theme-toggle-btn nav-ears-theme-btn"
            onClick={toggleTheme}
            aria-label={`Switch to ${currentTheme === 'morning' ? 'Evening' : 'Morning'} Edition`}
          >
            {currentTheme === 'morning' ? (
              <>
                <IconMoonCelestial size={14} />
                <span className="theme-toggle-text">EVENING EDITION</span>
              </>
            ) : (
              <>
                <IconSunCelestial size={14} />
                <span className="theme-toggle-text">MORNING EDITION</span>
              </>
            )}
          </button>
        </div>

        <div className="nav-ear-item">
          <span>PRICE: OPEN SOURCE</span>
          <span>•</span>
          <span>GLOBAL</span>
        </div>
      </div>

      {/* Main Masthead Display (Hidden on small screens <= 650px) */}
      <div className="masthead-hero">
        <NavLink
          to="/"
          className="masthead-title"
          onClick={closeMenu}
        >
          The Language Learner
        </NavLink>
      </div>


      {/* Navigation Section Bar */}
      <div className="nav-section-bar">
        {/* Medium/Small Screen Theme Toggle Button inside the Navigation Bar */}
        <button
          type="button"
          className="theme-toggle-btn nav-bar-theme-btn"
          onClick={toggleTheme}
          aria-label={`Switch to ${currentTheme === 'morning' ? 'Evening' : 'Morning'} Edition`}
        >
          {currentTheme === 'morning' ? (
            <>
              <IconMoonCelestial size={16} />
              <span className="theme-toggle-text">EVENING EDITION</span>
            </>
          ) : (
            <>
              <IconSunCelestial size={16} />
              <span className="theme-toggle-text">MORNING EDITION</span>
            </>
          )}
        </button>

        <button
          ref={toggleBtnRef}
          type="button"
          className="nav-mobile-toggle"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-label={mobileOpen ? 'Close section index' : 'Open section index'}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <IconCloseDismiss size={18} /> : <IconMenuBroadsheet size={18} />}
          <span className="nav-toggle-text">{mobileOpen ? 'CLOSE INDEX' : 'SECTIONS INDEX'}</span>
        </button>

        <ul
          ref={menuRef}
          className={`nav-links ${mobileOpen ? 'open' : ''}`}
        >
          {navItems.map((item) => (
            <li key={item.path} className="nav-link-item">
              <NavLink
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`.trim()}
                onClick={closeMenu}
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
