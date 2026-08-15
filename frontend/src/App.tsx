import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Dashboard } from './pages/Dashboard';
import { NewLesson } from './pages/NewLesson/index';
import { LessonDetail } from './pages/LessonDetail/index';
import { LessonHistory } from './pages/LessonHistory';
import { WordBank } from './pages/WordBank';
import { RuleBank } from './pages/RuleBank';
import { Settings } from './pages/Settings';
import { Login } from './pages/Login';
import { useAuth } from './contexts/AuthContext';
import { TutorialOverlay } from './components/Tutorial/TutorialOverlay';

export const App: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="app-layout">
      {user && <Navbar />}

      <main className={user ? 'main-content' : ''}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/lessons/new" element={<ProtectedRoute><NewLesson /></ProtectedRoute>} />
          <Route path="/lessons/:id/resume" element={<ProtectedRoute><NewLesson /></ProtectedRoute>} />
          <Route path="/lessons/:id" element={<ProtectedRoute><LessonDetail /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><LessonHistory /></ProtectedRoute>} />
          <Route path="/words" element={<ProtectedRoute><WordBank /></ProtectedRoute>} />
          <Route path="/rules" element={<ProtectedRoute><RuleBank /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        </Routes>
      </main>

      {user && (
        <footer style={{ borderTop: '1px solid var(--border-color)', padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          Created by Gianni H using Vite and React.
        </footer>
      )}

      {user && <TutorialOverlay />}
    </div>
  );
};

export default App;
