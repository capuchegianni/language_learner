import React, { useState } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { AlertCircle, AlertTriangle, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { API_BASE } from '../../services/api';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import './Login.css';

interface ErrorDetails {
  type: 'warning' | 'error';
  title: string;
  description: string;
}

export const Login: React.FC = () => {
  const { user, loading } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [dismissed, setDismissed] = useState<boolean>(false);

  const errorParam = searchParams.get('error');

  if (loading) {
    return <LoadingSpinner variant="fullscreen" size={40} />;
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleGoogleLogin = () => {
    // In dev, the Vite proxy forwards /api/* to the backend
    // In prod, API_BASE is the full backend URL
    window.location.href = `${API_BASE}/auth/google`;
  };

  const handleDismissError = () => {
    setDismissed(true);
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('error');
    setSearchParams(newParams, { replace: true });
  };

  const getErrorMessage = (): ErrorDetails | null => {
    if (!errorParam || dismissed) return null;

    if (errorParam === 'cancelled' || errorParam === 'access_denied') {
      return {
        type: 'warning',
        title: 'Sign-in cancelled',
        description: 'Google sign-in was cancelled. Click below to try again whenever you’re ready.',
      };
    }

    return {
      type: 'error',
      title: 'Sign-in failed',
      description: 'Unable to complete sign-in with Google. Please try again.',
    };
  };

  const errorDetails = getErrorMessage();

  return (
    <div className="login-page">
      <div className="login-ambient-glow login-ambient-glow-1" />
      <div className="login-ambient-glow login-ambient-glow-2" />

      <div className="login-card">
        <div className="login-logo">
          <div className="login-logo-badge">🌍</div>
          <h1 className="login-title">Language Learner</h1>
          <p className="login-subtitle">AI-Powered Language Tutor</p>
        </div>

        <div className="login-divider" />

        {errorDetails && (
          <div
            className={`login-alert ${errorDetails.type === 'warning' ? 'login-alert-warning' : 'login-alert-danger'}`}
            role="alert"
          >
            <div className="login-alert-icon">
              {errorDetails.type === 'warning' ? (
                <AlertTriangle size={18} />
              ) : (
                <AlertCircle size={18} />
              )}
            </div>
            <div className="login-alert-content">
              <div className="login-alert-title">{errorDetails.title}</div>
              <div className="login-alert-description">{errorDetails.description}</div>
            </div>
            <button
              className="login-alert-close"
              onClick={handleDismissError}
              aria-label="Dismiss error"
              type="button"
            >
              <X size={16} />
            </button>
          </div>
        )}

        <p className="login-description">
          Sign in to track your progress, manage your vocabulary bank, and generate personalized AI lessons.
        </p>

        <button
          className="login-google-btn"
          onClick={handleGoogleLogin}
          id="google-login-button"
          type="button"
        >
          <svg className="login-google-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          <span>Sign in with Google</span>
        </button>

        <p className="login-footer">
          Your progress is securely stored and synced across devices.
        </p>
      </div>
    </div>
  );
};

export default Login;
