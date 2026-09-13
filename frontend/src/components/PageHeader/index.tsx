import React from 'react';
import './PageHeader.css';

export interface PageHeaderProps {
  title: React.ReactNode;
  icon?: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  id?: string;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  icon,
  subtitle,
  actions,
  id,
  className = '',
}) => {
  return (
    <div id={id} className={`app-page-header ${className}`}>
      <div className="app-page-header-content">
        <h1 className="app-page-title">
          {icon}
          <span>{title}</span>
        </h1>
        {subtitle && <p className="app-page-subtitle">{subtitle}</p>}
      </div>

      {actions && <div className="app-page-actions">{actions}</div>}
    </div>
  );
};
