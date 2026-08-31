import React from 'react';
import './LoadingSpinner.css';

export interface LoadingSpinnerProps {
  message?: React.ReactNode;
  variant?: 'card' | 'fullscreen' | 'inline' | 'button' | 'raw';
  size?: number | string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message,
  variant = 'card',
  size,
  className = '',
}) => {
  const defaultSize =
    size !== undefined
      ? size
      : variant === 'fullscreen'
      ? 40
      : variant === 'button' || variant === 'raw'
      ? 16
      : variant === 'inline'
      ? 20
      : 24;

  const spinnerElement = (
    <div
      className={`spinner ${variant === 'raw' ? className : ''}`.trim()}
      style={{
        width: typeof defaultSize === 'number' ? `${defaultSize}px` : defaultSize,
        height: typeof defaultSize === 'number' ? `${defaultSize}px` : defaultSize,
      }}
      role="status"
      aria-label={typeof message === 'string' ? message : 'Loading...'}
    />
  );

  if (variant === 'raw') {
    return spinnerElement;
  }

  if (variant === 'card') {
    return (
      <div className={`glass-card app-loading-container variant-card ${className}`.trim()}>
        {spinnerElement}
        {message && <div className="app-loading-message">{message}</div>}
      </div>
    );
  }

  if (variant === 'fullscreen') {
    return (
      <div className={`app-loading-container variant-fullscreen ${className}`.trim()}>
        {spinnerElement}
        {message && <div className="app-loading-message">{message}</div>}
      </div>
    );
  }

  if (variant === 'button') {
    return (
      <span className={`app-loading-container variant-button ${className}`.trim()}>
        {spinnerElement}
        {message && <span className="app-loading-message">{message}</span>}
      </span>
    );
  }

  return (
    <div className={`app-loading-container variant-inline ${className}`.trim()}>
      {spinnerElement}
      {message && <span className="app-loading-message">{message}</span>}
    </div>
  );
};
