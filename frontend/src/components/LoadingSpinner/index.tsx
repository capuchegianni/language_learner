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
      ? 44
      : variant === 'button' || variant === 'raw'
      ? 16
      : variant === 'inline'
      ? 20
      : 28;

  const rollerElement = (
    <div
      className={`press-roller ${variant === 'raw' ? className : ''}`.trim()}
      style={{
        width: typeof defaultSize === 'number' ? `${defaultSize}px` : defaultSize,
        height: typeof defaultSize === 'number' ? `${defaultSize}px` : defaultSize,
      }}
      role="status"
      aria-label={typeof message === 'string' ? message : 'Loading...'}
    />
  );

  if (variant === 'raw') {
    return rollerElement;
  }

  if (variant === 'card') {
    return (
      <div className={`card loading-container variant-card ${className}`.trim()}>
        {rollerElement}
        {message && <span className="loading-message">{message}</span>}
      </div>
    );
  }

  if (variant === 'fullscreen') {
    return (
      <div className={`loading-container variant-fullscreen ${className}`.trim()}>
        {rollerElement}
        {message && <span className="loading-message">{message}</span>}
      </div>
    );
  }

  if (variant === 'button') {
    return (
      <span className={`loading-container variant-button ${className}`.trim()}>
        {rollerElement}
        {message && <span className="loading-message">{message}</span>}
      </span>
    );
  }

  return (
    <div className={`loading-container variant-inline ${className}`.trim()}>
      {rollerElement}
      {message && <span className="loading-message">{message}</span>}
    </div>
  );
};

export default LoadingSpinner;
