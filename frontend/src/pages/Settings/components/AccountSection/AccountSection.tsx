import React from 'react';
import './AccountSection.css';
import { Card, Button } from '../../../../components';
import { IconUserBust, IconQueryNotice, IconExitGate } from '../../../../components/icons';
import { useAuth } from '../../../../contexts/AuthContext';
import { useTutorial } from '../../../../components/Tutorial';
import { API_BASE } from '../../../../services/api';

export const AccountSection: React.FC = () => {
  const { user } = useAuth();
  const { startTutorial } = useTutorial();

  const handleLogout = () => {
    window.location.href = `${API_BASE}/auth/logout`;
  };

  return (
    <Card className="settings-account-card" id="tutorial-account-card">
      <h3 className="settings-section-title">
        <IconUserBust size={20} />
        <span>Account</span>
      </h3>
      <div className="settings-account-content">
        <div className="settings-account-profile">
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.displayName}
              className="settings-avatar-img"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="settings-avatar-fallback">
              {user?.displayName?.[0] || '?'}
            </div>
          )}
          <div className="settings-account-info">
            <div className="settings-account-name">
              {user?.displayName}
            </div>
            <div className="settings-account-email">
              {user?.email}
            </div>
          </div>
        </div>
        <div className="settings-account-actions">
          <Button
            variant="secondary"
            className="settings-replay-btn"
            onClick={() => startTutorial(0)}
            id="replay-tutorial-btn"
            title="Replay the onboarding walkthrough"
            icon={<IconQueryNotice size={16} />}
          >
            <span>Replay Tutorial</span>
          </Button>
          <Button
            variant="secondary"
            className="settings-logout-btn"
            onClick={handleLogout}
            id="logout-button"
            icon={<IconExitGate size={16} />}
          >
            <span>Sign Out</span>
          </Button>
        </div>
      </div>
    </Card>
  );
};
