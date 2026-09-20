import React from 'react';
import { IconChronicle } from '../icons';
import { Card } from '../Card';
import './EmptyState.css';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title?: React.ReactNode;
  message?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = <IconChronicle size={44} />,
  title,
  message,
  action,
  className = '',
}) => {
  return (
    <Card className={`empty-state ${className}`.trim()}>
      {icon && <div className="empty-state-icon">{icon}</div>}
      {title && <h3 className="empty-state-title">{title}</h3>}
      {message && <p className="empty-state-message">{message}</p>}
      {action && <div className="empty-state-action">{action}</div>}
    </Card>
  );
};

export default EmptyState;
