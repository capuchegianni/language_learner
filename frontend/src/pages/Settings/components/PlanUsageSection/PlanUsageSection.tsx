import React from 'react';
import './PlanUsageSection.css';
import { Card } from '../../../../components';
import {
  IconTypesetSliders,
  IconHazardAlert,
  IconApprovalCheck,
} from '../../../../components/icons';
import { UsageInfo } from '../../../../types';

export interface PlanUsageSectionProps {
  plan: 'FREE' | 'PREMIUM';
  isCustom: boolean;
  hasApiKey: boolean;
  isLocalOllama: boolean;
  usageInfo: UsageInfo | null;
  onToggleCustom: (isCustom: boolean) => void;
}

export const PlanUsageSection: React.FC<PlanUsageSectionProps> = ({
  plan,
  isCustom,
  hasApiKey,
  isLocalOllama,
  usageInfo,
  onToggleCustom,
}) => {
  const isKeyMissing = isCustom && !hasApiKey && !isLocalOllama;

  const ruleProposalUsed = usageInfo?.usage.RULE_PROPOSAL.used ?? 0;
  const ruleProposalLimit = usageInfo?.usage.RULE_PROPOSAL.limit ?? (plan === 'PREMIUM' ? 10 : 3);

  const lessonGenUsed = usageInfo?.usage.LESSON_GENERATION.used ?? 0;
  const lessonGenLimit = usageInfo?.usage.LESSON_GENERATION.limit ?? (plan === 'PREMIUM' ? 7 : 2);

  const lessonCorrUsed = usageInfo?.usage.LESSON_CORRECTION.used ?? 0;
  const lessonCorrLimit = usageInfo?.usage.LESSON_CORRECTION.limit ?? (plan === 'PREMIUM' ? 7 : 2);

  const getPercent = (used: number, limit: number) => {
    if (limit <= 0) return 0;
    return Math.min(100, Math.round((used / limit) * 100));
  };

  return (
    <Card className="settings-card settings-plan-card" id="tutorial-plan-usage">
      <div className="settings-plan-header">
        <h3 className="settings-section-title">
          <IconTypesetSliders size={20} />
          <span>Plan &amp; AI Quotas</span>
        </h3>
        <div className="settings-plan-badge-group">
          {isCustom ? (
            <span className="settings-plan-stamp custom">Custom Mode (BYOK)</span>
          ) : plan === 'PREMIUM' ? (
            <span className="settings-plan-stamp premium">Premium Plan</span>
          ) : (
            <span className="settings-plan-stamp">Free Plan</span>
          )}
        </div>
      </div>

      <p className="settings-plan-desc">
        {isCustom
          ? 'You are currently using your own API credentials. Daily quota limits are bypassed.'
          : plan === 'PREMIUM'
          ? 'Premium tier powered by Google Gemini (Gemini 3.5 Flash-Lite for proposals, Gemini 3.8 Flash for lesson generation & grading) with generous daily limits.'
          : 'Free tier powered by Google Gemini (Gemini 3.5 Flash-Lite for proposals, Gemini 3.6 Flash for lesson generation & grading). Daily limits apply.'}
      </p>

      {/* Custom Switch Row */}
      <div className="settings-custom-toggle-card">
        <div className="settings-custom-toggle-info">
          <span className="settings-custom-toggle-label">Use Custom AI Provider (BYOK)</span>
          <span className="settings-custom-toggle-hint">
            Provide your own API key to use OpenAI, Gemini, Anthropic, or local Ollama with no daily limits.
          </span>
        </div>
        <label className="settings-switch" htmlFor="custom-ai-toggle" aria-label="Toggle custom AI configuration">
          <input
            id="custom-ai-toggle"
            type="checkbox"
            checked={isCustom}
            onChange={(e) => onToggleCustom(e.target.checked)}
          />
          <span className="settings-switch-slider" />
        </label>
      </div>

      {/* Warning if custom is on but no API key configured */}
      {isKeyMissing && (
        <div className="settings-custom-warning" role="alert">
          <IconHazardAlert size={18} />
          <span>
            Custom mode is active, but you have not configured an API key. AI features will not work until you enter an API key below.
          </span>
        </div>
      )}

      {/* Usage Quota Grid (when isCustom is false) */}
      {!isCustom ? (
        <>
          <div className="settings-quota-grid">
            {/* Rule Proposals */}
            <div className="settings-quota-item">
              <div className="settings-quota-item-header">
                <span>Rule Proposals</span>
                <span className="settings-quota-count">
                  {ruleProposalUsed} / {ruleProposalLimit}
                </span>
              </div>
              <div className="settings-quota-progress-track">
                <div
                  className={`settings-quota-progress-fill ${ruleProposalUsed >= ruleProposalLimit ? 'full' : ''}`}
                  style={{ width: `${getPercent(ruleProposalUsed, ruleProposalLimit)}%` }}
                />
              </div>
            </div>

            {/* Lesson Generation */}
            <div className="settings-quota-item">
              <div className="settings-quota-item-header">
                <span>Lesson Generations</span>
                <span className="settings-quota-count">
                  {lessonGenUsed} / {lessonGenLimit}
                </span>
              </div>
              <div className="settings-quota-progress-track">
                <div
                  className={`settings-quota-progress-fill ${lessonGenUsed >= lessonGenLimit ? 'full' : ''}`}
                  style={{ width: `${getPercent(lessonGenUsed, lessonGenLimit)}%` }}
                />
              </div>
            </div>

            {/* Lesson Correction */}
            <div className="settings-quota-item">
              <div className="settings-quota-item-header">
                <span>Lesson Corrections</span>
                <span className="settings-quota-count">
                  {lessonCorrUsed} / {lessonCorrLimit}
                </span>
              </div>
              <div className="settings-quota-progress-track">
                <div
                  className={`settings-quota-progress-fill ${lessonCorrUsed >= lessonCorrLimit ? 'full' : ''}`}
                  style={{ width: `${getPercent(lessonCorrUsed, lessonCorrLimit)}%` }}
                />
              </div>
            </div>
          </div>
          <div className="settings-quota-footer">
            <span>ℹ️ Daily quotas reset every midnight at 00:00 UTC.</span>
          </div>
        </>
      ) : (
        <div className="settings-custom-active-notice">
          <IconApprovalCheck size={16} />
          <span>Unlimited daily requests enabled via your custom AI configuration.</span>
        </div>
      )}
    </Card>
  );
};

