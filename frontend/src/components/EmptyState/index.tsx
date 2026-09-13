import React from 'react';
import { Inbox } from 'lucide-react';
import './EmptyState.css';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title?: React.ReactNode;
  message?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = <Inbox size={40} />,
  title,
  message,
  action,
  className = '',
}) => {
  return (
    <div className={`glass-card app-empty-state ${className}`}>
      {icon && <div className="app-empty-state-icon">{icon}</div>}
      {title && <h3 className="app-empty-state-title">{title}</h3>}
      {message && <p className="app-empty-state-message">{message}</p>}
      {action && <div className="app-empty-state-action">{action}</div>}
    </div>
  );
};
