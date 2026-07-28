import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Dashboard } from './pages/Dashboard';
import { NewLesson } from './pages/NewLesson/index';
import { LessonDetail } from './pages/LessonDetail/index';
import { LessonHistory } from './pages/LessonHistory';
import { WordBank } from './pages/WordBank';
import { RuleBank } from './pages/RuleBank';
import { Settings } from './pages/Settings';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [previousTab, setPreviousTab] = useState<string>('dashboard');

  const handleSelectLesson = (id: string, status?: string) => {
    setPreviousTab(activeTab);
    setSelectedLessonId(id);
    if (status === 'GENERATED' || status === 'SUBMITTED') {
      setActiveTab('resume-lesson');
    } else {
      setActiveTab('lesson-detail');
    }
  };

  const handleBackFromDetail = () => {
    setSelectedLessonId(null);
    setActiveTab(previousTab);
  };

  return (
    <div className="app-layout">
      <Navbar activeTab={activeTab} setActiveTab={(tab) => {
        if (tab === 'new-lesson') setSelectedLessonId(null);
        setActiveTab(tab);
      }} />

      <main className="main-content">
        {activeTab === 'dashboard' && (
          <Dashboard setActiveTab={(tab) => {
            if (tab === 'new-lesson') setSelectedLessonId(null);
            setActiveTab(tab);
          }} onSelectLesson={handleSelectLesson} />
        )}

        {activeTab === 'new-lesson' && (
          <NewLesson onLessonFinished={() => {
            setSelectedLessonId(null);
            setActiveTab('dashboard');
          }} />
        )}

        {activeTab === 'resume-lesson' && selectedLessonId && (
          <NewLesson
            resumeLessonId={selectedLessonId}
            onLessonFinished={() => {
              setSelectedLessonId(null);
              setActiveTab('dashboard');
            }}
            onBack={handleBackFromDetail}
          />
        )}

        {activeTab === 'lesson-detail' && selectedLessonId && (
          <LessonDetail lessonId={selectedLessonId} onBack={handleBackFromDetail} />
        )}

        {activeTab === 'lesson-history' && (
          <LessonHistory onSelectLesson={handleSelectLesson} />
        )}

        {activeTab === 'word-bank' && <WordBank />}

        {activeTab === 'rule-bank' && <RuleBank />}

        {activeTab === 'settings' && <Settings />}
      </main>

      <footer style={{ borderTop: '1px solid var(--border-color)', padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
        Created by Gianni H using Vite and React.
      </footer>
    </div>
  );
};

export default App;
