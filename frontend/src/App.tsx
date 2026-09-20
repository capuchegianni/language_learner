import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import {
  Dashboard,
  LessonDetail,
  LessonHistory,
  Login,
  NewLesson,
  RuleBank,
  Settings,
  WordBank
} from "./pages";
import { useAuth } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

export const App: React.FC = () => {
  const { user } = useAuth();

  return (
    <Layout isAuthenticated={!!user}>
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
    </Layout>
  );
};

export default App;
