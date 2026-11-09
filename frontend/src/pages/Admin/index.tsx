import React, { useState, useEffect, useCallback } from 'react';
import './Admin.css';
import { api } from '../../services/api';
import { AdminUser } from '../../types';
import {
  PageHeader,
  Card,
  Input,
  Select,
  LoadingSpinner,
  EmptyState,
} from '../../components';
import {
  IconTypesetSliders,
  IconApprovalCheck,
  IconHazardAlert,
  IconMagnifierSearch,
} from '../../components/icons';

export const Admin: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchUsers = useCallback(async (query?: string) => {
    try {
      setLoading(true);
      setErrorMessage(null);
      const data = await api.getAdminUsers(query);
      setUsers(data);
    } catch (err: any) {
      console.error('Failed to load admin users', err);
      setErrorMessage(
        err.response?.data?.message || 'Failed to load user directory.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchUsers(searchQuery);
    }, 300);

    return () => clearTimeout(handler);
  }, [searchQuery, fetchUsers]);

  const handlePlanChange = async (userId: string, newPlan: 'FREE' | 'PREMIUM') => {
    try {
      setUpdatingUserId(userId);
      setSuccessMessage(null);
      setErrorMessage(null);

      const updated = await api.updateUserPlan(userId, newPlan);

      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, plan: updated.plan } : u)),
      );

      setSuccessMessage(
        `Successfully updated ${updated.displayName || updated.email}'s plan to ${updated.plan}.`,
      );

      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      console.error('Failed to update user plan', err);
      setErrorMessage(
        err.response?.data?.message || 'Failed to update user plan.',
      );
    } finally {
      setUpdatingUserId(null);
    }
  };

  return (
    <div className="admin-container">
      <PageHeader
        icon={<IconTypesetSliders className="settings-header-icon" />}
        title="Admin User Management"
        subtitle="Manage user subscriptions, assign premium quotas, and view activity across all accounts."
      />

      {/* Alerts */}
      <div className="admin-alerts-container">
        {successMessage && (
          <div className="admin-alert success" role="status">
            <IconApprovalCheck size={18} />
            <span>{successMessage}</span>
          </div>
        )}
        {errorMessage && (
          <div className="admin-alert error" role="alert">
            <IconHazardAlert size={18} />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* Filter / Search Bar */}
      <Card className="admin-toolbar-card">
        <div className="admin-search-wrapper">
          <Input
            id="admin-user-search-input"
            type="text"
            placeholder="Search by user name or email address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            containerClassName="admin-search-input-group"
          />
        </div>
        <div className="admin-users-count">
          <span>{users.length} {users.length === 1 ? 'Subscriber' : 'Subscribers'}</span>
        </div>
      </Card>

      {/* Content Area */}
      {loading ? (
        <LoadingSpinner variant="card" size={32} />
      ) : users.length === 0 ? (
        <EmptyState
          icon={<IconMagnifierSearch size={32} />}
          title="No Users Found"
          message={
            searchQuery.trim()
              ? `No user accounts matched "${searchQuery}".`
              : 'There are currently no registered users in the database.'
          }
        />
      ) : (
        <div className="admin-users-list">
          {users.map((user) => {
            const isUpdating = updatingUserId === user.id;

            return (
              <Card key={user.id} className="admin-user-card">
                {/* Profile */}
                <div className="admin-user-profile">
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.displayName}
                      className="admin-user-avatar"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="admin-user-avatar-fallback">
                      {user.displayName?.[0] || user.email?.[0] || '?'}
                    </div>
                  )}
                  <div className="admin-user-info">
                    <span className="admin-user-name">
                      {user.displayName || 'Anonymous User'}
                    </span>
                    <span className="admin-user-email">{user.email}</span>
                    <span className="admin-user-date">
                      Joined {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Metrics */}
                <div className="admin-user-metrics">
                  <span className="admin-metric-item">
                    📚 {user._count?.lessons ?? 0} lessons
                  </span>
                  <span className="admin-metric-item">
                    📖 {user._count?.words ?? 0} words
                  </span>
                  <span className="admin-metric-item">
                    ⚖️ {user._count?.rules ?? 0} rules
                  </span>
                </div>

                {/* Status Badges */}
                <div className="admin-user-badges">
                  <span
                    className={`admin-plan-stamp ${
                      user.plan === 'PREMIUM' ? 'premium' : ''
                    }`}
                  >
                    {user.plan} PLAN
                  </span>
                  {user.isCustom && (
                    <span className="admin-custom-badge">BYOK Custom Active</span>
                  )}
                </div>

                {/* Plan Assignment Controls */}
                <div className="admin-user-actions">
                  {isUpdating ? (
                    <LoadingSpinner size={20} variant="raw" />
                  ) : (
                    <Select
                      id={`user-plan-select-${user.id}`}
                      variant="filter"
                      className="admin-plan-select"
                      value={user.plan}
                      onChange={(e) =>
                        handlePlanChange(
                          user.id,
                          e.target.value as 'FREE' | 'PREMIUM',
                        )
                      }
                      options={[
                        { value: 'FREE', label: 'Free Tier' },
                        { value: 'PREMIUM', label: 'Premium Tier' },
                      ]}
                      aria-label={`Change plan for ${user.displayName || user.email}`}
                    />
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Admin;

