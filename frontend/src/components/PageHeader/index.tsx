import React from 'react';
import './PageHeader.css';

export interface PageHeaderProps {
  title: React.ReactNode;
  icon?: React.ReactNode;
  subtitle?: React.ReactNode;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  id?: string;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  icon,
  subtitle,
  badge,
  actions,
  id,
  className = '',
}) => {
  return (
    <header id={id} className={`app-page-header ${className}`.trim()}>
      <div className="app-page-header-content">
        <h1 className="app-page-title">
          {icon && <span className="app-page-title-icon">{icon}</span>}
          <span>{title}</span>
          {badge && <span className="app-page-title-badge">{badge}</span>}
        </h1>
        {subtitle && <p className="app-page-subtitle">{subtitle}</p>}
      </div>

      {actions && <div className="app-page-actions">{actions}</div>}
    </header>
  );
};

export default PageHeader;
