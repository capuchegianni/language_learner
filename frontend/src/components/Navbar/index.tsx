import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Sparkles,
  BookOpen,
  Settings as SettingsIcon,
  LayoutDashboard,
  Scroll,
  History,
  Menu,
  X,
} from 'lucide-react';
import './Navbar.css';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleBtnRef = useRef<HTMLButtonElement>(null);

  // Automatically close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Prevent background scrolling when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  // Close when clicking anywhere outside the menu
  useEffect(() => {
    if (!mobileMenuOpen) return;

    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        toggleBtnRef.current &&
        !toggleBtnRef.current.contains(target)
      ) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [mobileMenuOpen]);

  const handleBackdropDismiss = (e: React.SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setMobileMenuOpen(false);
  };

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <nav className={`navbar ${mobileMenuOpen ? 'menu-open' : ''}`}>
      {/* Mobile Backdrop Overlay - Placed inside navbar to guarantee correct stacking layer below navbar items */}
      {mobileMenuOpen && (
        <div
          className="nav-backdrop"
          onClick={handleBackdropDismiss}
          onTouchEnd={handleBackdropDismiss}
          aria-hidden="true"
        />
      )}

      <div className="navbar-container">
        <NavLink
          to="/"
          className="logo-brand"
          onClick={closeMenu}
        >
          <div className="logo-badge">🌍</div>
          <div>
            <div className="logo-title">Language Learner</div>
            <div className="logo-subtitle">
              AI Language Tutor &amp; Progress Storage
            </div>
          </div>
        </NavLink>

        {/* Mobile Hamburger Toggle Button */}
        <button
          ref={toggleBtnRef}
          type="button"
          className="nav-mobile-toggle"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Nav Links Container */}
        <div
          ref={menuRef}
          className={`nav-links ${mobileMenuOpen ? 'open' : ''}`}
        >
          <NavLink
            to="/"
            end
            className={({ isActive }) => (isActive ? 'active' : '')}
            onClick={closeMenu}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/lessons/new"
            className={({ isActive }) => (isActive ? 'active' : '')}
            onClick={closeMenu}
          >
            <Sparkles size={18} />
            <span>New Lesson</span>
          </NavLink>

          <NavLink
            to="/history"
            className={({ isActive }) => (isActive ? 'active' : '')}
            onClick={closeMenu}
          >
            <History size={18} />
            <span>History</span>
          </NavLink>

          <NavLink
            to="/words"
            className={({ isActive }) => (isActive ? 'active' : '')}
            onClick={closeMenu}
          >
            <BookOpen size={18} />
            <span>Word Bank</span>
          </NavLink>

          <NavLink
            to="/rules"
            className={({ isActive }) => (isActive ? 'active' : '')}
            onClick={closeMenu}
          >
            <Scroll size={18} />
            <span>Rule Bank</span>
          </NavLink>

          <NavLink
            to="/settings"
            className={({ isActive }) => (isActive ? 'active' : '')}
            onClick={closeMenu}
          >
            <SettingsIcon size={18} />
            <span>Settings</span>
          </NavLink>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
