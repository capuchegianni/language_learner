import React, { useState, useEffect, useCallback } from 'react';
import './Admin.css';
import { api } from '../../services/api';
import { AdminUser, BanDurationPreset } from '../../types';
import {
  PageHeader,
  Card,
  Input,
  Select,
  Button,
  Modal,
  LoadingSpinner,
  EmptyState,
} from '../../components';
import {
  IconTypesetSliders,
  IconApprovalCheck,
  IconHazardAlert,
  IconMagnifierSearch,
} from '../../components/icons';

const BAN_DURATION_OPTIONS: Array<{ value: BanDurationPreset; label: string }> = [
  { value: '1h', label: '1 Hour Cooldown' },
  { value: '24h', label: '24 Hours Cooldown' },
  { value: '48h', label: '48 Hours Cooldown' },
  { value: '7d', label: '7 Days Suspension' },
  { value: '1m', label: '1 Month Suspension' },
  { value: '1y', label: '1 Year Ban' },
  { value: 'Permanent', label: 'Permanent Indefinite Ban' },
];

export const Admin: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Moderation modal states
  const [banTargetUser, setBanTargetUser] = useState<AdminUser | null>(null);
  const [banDuration, setBanDuration] = useState<BanDurationPreset>('24h');
  const [banReason, setBanReason] = useState<string>('');
  const [submittingBan, setSubmittingBan] = useState<boolean>(false);

  const [unblockTargetUser, setUnblockTargetUser] = useState<AdminUser | null>(null);
  const [submittingUnblock, setSubmittingUnblock] = useState<boolean>(false);

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

  const openBanModal = (user: AdminUser) => {
    setBanTargetUser(user);
    setBanDuration('24h');
    setBanReason('');
  };

  const handleApplyBan = async () => {
    if (!banTargetUser) return;
    try {
      setSubmittingBan(true);
      setErrorMessage(null);
      const res = await api.banUser(banTargetUser.id, {
        duration: banDuration,
        reason: banReason.trim() || undefined,
      });

      setUsers((prev) =>
        prev.map((u) =>
          u.id === banTargetUser.id
            ? { ...u, restriction: res.restriction }
            : u,
        ),
      );

      setSuccessMessage(
        `AI access ban (${banDuration}) applied to ${banTargetUser.displayName || banTargetUser.email}.`,
      );
      setBanTargetUser(null);
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      console.error('Failed to ban user', err);
      setErrorMessage(
        err.response?.data?.message || 'Failed to apply ban on user.',
      );
    } finally {
      setSubmittingBan(false);
    }
  };

  const handleConfirmUnblock = async () => {
    if (!unblockTargetUser) return;
    try {
      setSubmittingUnblock(true);
      setErrorMessage(null);
      await api.unblockUser(unblockTargetUser.id);

      setUsers((prev) =>
        prev.map((u) =>
          u.id === unblockTargetUser.id
            ? { ...u, restriction: null, guardErrorsDaily: 0, guardErrorsWeekly: 0 }
            : u,
        ),
      );

      setSuccessMessage(
        `AI restrictions lifted and guard errors forgiven for ${unblockTargetUser.displayName || unblockTargetUser.email}.`,
      );
      setUnblockTargetUser(null);
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      console.error('Failed to unblock user', err);
      setErrorMessage(
        err.response?.data?.message || 'Failed to unblock user.',
      );
    } finally {
      setSubmittingUnblock(false);
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
                  {!user.isAdmin && (
                    <span className="admin-metric-item admin-metric-guard">
                      🛡️ {user.guardErrorsDaily ?? 0}/3 daily • {user.guardErrorsWeekly ?? 0}/6 rolling 7d
                    </span>
                  )}
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
                  {user.restriction && (
                    <div className="admin-ban-badge-group">
                      <span className="admin-ban-stamp">BANNED: {user.restriction.banType}</span>
                      <span className="admin-ban-until">
                        {user.restriction.isPermanent || !user.restriction.blockedUntil
                          ? 'Permanent'
                          : `Until ${new Date(user.restriction.blockedUntil).toLocaleDateString()}`}
                      </span>
                    </div>
                  )}
                </div>

                {/* Plan Assignment & Moderation Controls */}
                <div className="admin-user-actions">
                  {isUpdating ? (
                    <LoadingSpinner size={20} variant="raw" />
                  ) : (
                    <>
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
                      <div className="admin-moderation-actions">
                        {user.isAdmin ? (
                          <span className="admin-protected-badge" title="Administrator accounts cannot be banned">
                            Admin Protected
                          </span>
                        ) : user.restriction ? (
                          <Button
                            size="xs"
                            variant="secondary"
                            onClick={() => setUnblockTargetUser(user)}
                            className="admin-mod-btn admin-unblock-btn"
                          >
                            Unblock
                          </Button>
                        ) : (
                          <Button
                            size="xs"
                            variant="danger"
                            onClick={() => openBanModal(user)}
                            className="admin-mod-btn admin-ban-btn"
                          >
                            Ban AI
                          </Button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Ban Modal */}
      <Modal
        isOpen={banTargetUser !== null}
        onClose={() => !submittingBan && setBanTargetUser(null)}
        title={`Restrict AI Access: ${banTargetUser?.displayName || banTargetUser?.email || ''}`}
        icon={<IconHazardAlert size={20} />}
        danger
        maxWidth="500px"
      >
        <div className="admin-modal-body">
          <p className="admin-modal-desc">
            Impose an AI access restriction on <strong>{banTargetUser?.displayName || banTargetUser?.email}</strong>. While restricted, non-BYOK AI operations (proposals, generation, grading) will be blocked.
          </p>
          <div className="admin-modal-field">
            <Select
              id="admin-ban-duration-select"
              label="Restriction Duration Preset:"
              value={banDuration}
              onChange={(e) => setBanDuration(e.target.value as BanDurationPreset)}
              options={BAN_DURATION_OPTIONS}
            />
          </div>
          <div className="admin-modal-field">
            <Input
              id="admin-ban-reason-input"
              label="Reason (Optional):"
              placeholder="e.g., Repeated prompt injection attempts or abuse"
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
            />
          </div>
        </div>
        <div className="admin-modal-actions">
          <Button
            variant="secondary"
            onClick={() => setBanTargetUser(null)}
            disabled={submittingBan}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleApplyBan}
            disabled={submittingBan}
          >
            {submittingBan ? 'Applying Ban...' : 'Apply Ban'}
          </Button>
        </div>
      </Modal>

      {/* Unblock Modal */}
      <Modal
        isOpen={unblockTargetUser !== null}
        onClose={() => !submittingUnblock && setUnblockTargetUser(null)}
        title={`Lift AI Restriction: ${unblockTargetUser?.displayName || unblockTargetUser?.email || ''}`}
        icon={<IconApprovalCheck size={20} />}
        maxWidth="480px"
      >
        <div className="admin-modal-body">
          <p className="admin-modal-desc">
            Are you sure you want to lift AI restrictions for <strong>{unblockTargetUser?.displayName || unblockTargetUser?.email}</strong>?
          </p>
          <p className="admin-modal-subdesc">
            This will immediately remove active AI restrictions and mark all prior prompt guard error events as forgiven (resetting daily and rolling 7-day error counts to zero).
          </p>
        </div>
        <div className="admin-modal-actions">
          <Button
            variant="secondary"
            onClick={() => setUnblockTargetUser(null)}
            disabled={submittingUnblock}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirmUnblock}
            disabled={submittingUnblock}
          >
            {submittingUnblock ? 'Lifting Restriction...' : 'Lift Restriction'}
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default Admin;

