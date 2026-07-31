import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Dashboard } from './pages/Dashboard';
import { NewLesson } from './pages/NewLesson/index';
import { LessonDetail } from './pages/LessonDetail/index';
import { LessonHistory } from './pages/LessonHistory';
import { WordBank } from './pages/WordBank';
import { RuleBank } from './pages/RuleBank';
import { Settings } from './pages/Settings';

export const App: React.FC = () => {
  return (
    <div className="app-layout">
      <Navbar />

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/lessons/new" element={<NewLesson />} />
          <Route path="/lessons/:id/resume" element={<NewLesson />} />
          <Route path="/lessons/:id" element={<LessonDetail />} />
          <Route path="/history" element={<LessonHistory />} />
          <Route path="/words" element={<WordBank />} />
          <Route path="/rules" element={<RuleBank />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>

      <footer style={{ borderTop: '1px solid var(--border-color)', padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
        Created by Gianni H using Vite and React.
      </footer>
    </div>
  );
};

export default App;
