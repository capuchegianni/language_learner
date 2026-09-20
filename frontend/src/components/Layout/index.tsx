import React from 'react';
import './Layout.css';
import { Navbar } from '../Navbar';
import { Footer } from '../Footer';
import { TutorialOverlay } from '../Tutorial';

export interface LayoutProps {
  isAuthenticated?: boolean;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({
  isAuthenticated = false,
  children,
}) => {
  return (
    <div className="app-layout">
      {isAuthenticated && <Navbar />}

      <main className={isAuthenticated ? 'main-content' : ''}>
        {children}
      </main>

      {isAuthenticated && <Footer />}
      {isAuthenticated && <TutorialOverlay />}
    </div>
  );
};

export default Layout;
