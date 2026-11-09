import React, { useState, useRef } from 'react';
import { ProposedRule, UsageInfo } from '../../../../types';
import {
  IconRefreshCrank,
  IconLexicon,
  IconNewDispatch,
  IconApprovalCheck,
  IconHazardAlert,
} from '../../../../components/icons';
import { useLanguages } from '../../../../contexts/LanguageContext';
import { Pill, Select, IconButton, LoadingSpinner, Card, Button, Input, Modal } from '../../../../components';
import './ProposalPhase.css';

export interface ProposalPhaseProps {
  proposals: ProposedRule[];
  reviewRule: { id: string; title: string; explanation: string } | null;
  selectedRuleTitle: string;
  isReviewSelection: boolean;
  wordsCount: number;
  setWordsCount: (count: number) => void;
  loadingProposals: boolean;
  replacingIndex: number | null;
  onSelectRule: (title: string, isReview: boolean) => void;
  onReplaceProposal: (indexToReplace: number, e: React.MouseEvent) => void;
  onGenerateLesson: () => void;
  generatingLesson: boolean;
  fetchProposals: (forceRefresh: boolean) => void;
  usageInfo?: UsageInfo | null;
  className?: string;
}

export const ProposalPhase: React.FC<ProposalPhaseProps> = ({
  proposals,
  reviewRule,
  selectedRuleTitle,
  isReviewSelection,
  wordsCount,
  setWordsCount,
  loadingProposals,
  replacingIndex,
  onSelectRule,
  onReplaceProposal,
  onGenerateLesson,
  generatingLesson,
  fetchProposals,
  usageInfo,
  className = '',
}) => {
  const { targetLanguage } = useLanguages();
  const [customRule, setCustomRule] = useState('');
  const customInputRef = useRef<HTMLInputElement>(null);
  const [confirmRefreshTarget, setConfirmRefreshTarget] = useState<
    { type: 'all' } | { type: 'single'; index: number; title: string } | null
  >(null);

  const isCustomPlan = usageInfo?.isCustom ?? false;
  const proposalUsage = usageInfo?.usage.RULE_PROPOSAL;
  const lessonGenUsage = usageInfo?.usage.LESSON_GENERATION;

  const isProposalLimitReached =
    !isCustomPlan &&
    proposalUsage?.limit !== null &&
    proposalUsage?.limit !== undefined &&
    proposalUsage.used >= proposalUsage.limit;

  const isLessonGenLimitReached =
    !isCustomPlan &&
    lessonGenUsage?.limit !== null &&
    lessonGenUsage?.limit !== undefined &&
    lessonGenUsage.used >= lessonGenUsage.limit;

  const isCustomSelected =
    selectedRuleTitle !== '' &&
    !proposals.find((p) => p.title === selectedRuleTitle) &&
    (!reviewRule || reviewRule.title !== selectedRuleTitle);

  const handleCustomRuleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomRule(val);
    if (val.trim()) {
      onSelectRule(val, false);
    }
  };

  const handleCustomCardClick = () => {
    customInputRef.current?.focus();
    if (customRule.trim()) {
      onSelectRule(customRule, false);
    }
  };

  return (
    <div id="tutorial-lesson-container" className={`proposal-phase-container ${className}`.trim()}>
      <Card className="proposal-header-card">
        <h2 className="proposal-header-title">
          Select Today's {targetLanguage} Rule
        </h2>
        <p className="proposal-header-subtitle">
          The AI analyzed your mastered rules and proposed 3 new daily grammar rules, or choose a random revision rule to refresh your knowledge.
        </p>

        {/* Word Count Selector */}
        <Select
          variant="filter"
          id="proposal-word-count-select"
          label="Target New Words:"
          value={String(wordsCount)}
          onChange={(e) => setWordsCount(Number(e.target.value))}
          options={[
            { value: '3', label: '3 Words' },
            { value: '5', label: '5 Words (Standard)' },
            { value: '7', label: '7 Words' },
            { value: '10', label: '10 Words' },
          ]}
          className="proposal-word-count-filter"
        />

        {/* Daily Quota Indicator (if not on custom plan) */}
        {!isCustomPlan && usageInfo && (
          <div className="proposal-quota-bar">
            <span>
              Daily Quota: <strong>{lessonGenUsage?.used ?? 0} / {lessonGenUsage?.limit ?? 2}</strong> lessons
            </span>
            <span>•</span>
            <span>
              <strong>{proposalUsage?.used ?? 0} / {proposalUsage?.limit ?? 3}</strong> proposals used
            </span>
            <span>•</span>
            <span>Resets at 00:00 UTC</span>
          </div>
        )}

        {isLessonGenLimitReached && (
          <div className="proposal-limit-warning" role="alert">
            <IconHazardAlert size={16} />
            <span>Daily lesson generation limit reached ({lessonGenUsage?.used}/{lessonGenUsage?.limit}). Resets at midnight UTC.</span>
          </div>
        )}
      </Card>

      {loadingProposals ? (
        <LoadingSpinner
          variant="card"
          className="proposal-loading-card"
          message="AI is curating rule proposals based on your rule bank..."
        />
      ) : (
        <div className="proposal-sections-container">
          <div className="proposal-section-group">
            <h3 className="proposal-section-title">AI Proposed New Rules</h3>

            {proposals.length === 0 ? (
              <Card className="proposal-empty-info-card">
                <p>No AI proposals currently available. Use custom lesson or review mode below.</p>
              </Card>
            ) : (
              <div className="proposal-grid">
                {proposals.map((prop, idx) => {
                  const isSelected = selectedRuleTitle === prop.title && !isReviewSelection;
                  const isReplacing = replacingIndex === idx;

                  return (
                    <Card
                      key={idx}
                      isInteractive
                      className={`proposal-card ${isSelected ? 'selected' : ''} ${isReplacing ? 'replacing' : ''}`}
                      onClick={() => {
                        if (!isReplacing) onSelectRule(prop.title, false);
                      }}
                    >
                      {isReplacing ? (
                        <div className="proposal-replacing-state">
                          <LoadingSpinner size={24} variant="raw" />
                          <span className="proposal-replacing-text">Generating new proposal...</span>
                        </div>
                      ) : (
                        <>
                          <div>
                            <div className="proposal-card-header">
                              <div className="proposal-card-pills">
                                <Pill variant="primary">{prop.category}</Pill>
                                <Pill variant="warning">{prop.difficulty}</Pill>
                              </div>
                              <IconButton
                                size="xs"
                                icon={<IconRefreshCrank size={12} />}
                                title={
                                  isProposalLimitReached
                                    ? 'Daily proposal limit reached. Resets at 00:00 UTC.'
                                    : 'Replace this proposal'
                                }
                                aria-label={`Replace proposal: ${prop.title}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setConfirmRefreshTarget({
                                    type: 'single',
                                    index: idx,
                                    title: prop.title,
                                  });
                                }}
                                disabled={replacingIndex !== null || isProposalLimitReached}
                              />
                            </div>
                            <h4 className="target-text proposal-card-title">{prop.title}</h4>
                            <p className="proposal-card-desc">{prop.briefExplanation}</p>
                          </div>
                          <div className="proposal-select-indicator">
                            {isSelected ? <IconApprovalCheck size={16} /> : <div className="proposal-unselected-circle" />}
                            <span>{isSelected ? 'Selected Rule' : 'Select Rule'}</span>
                          </div>
                        </>
                      )}
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Custom Rule Input */}
          <div id="tutorial-custom-rule" className="proposal-section-group">
            <h3 className="proposal-section-title">
              Create Your Own Lesson
            </h3>
            <Card
              as="label"
              htmlFor="custom-lesson-rule-input"
              isInteractive
              className={`custom-rule-card ${isCustomSelected ? 'selected' : ''}`}
              onClick={handleCustomCardClick}
            >
              <div className="custom-rule-input-wrapper">
                <Input
                  id="custom-lesson-rule-input"
                  ref={customInputRef}
                  type="text"
                  placeholder={`e.g., How to say 'I want to...' in ${targetLanguage}`}
                  value={customRule}
                  onChange={handleCustomRuleChange}
                  onFocus={() => {
                    if (customRule.trim()) {
                      onSelectRule(customRule, false);
                    }
                  }}
                  className="custom-rule-input"
                />
              </div>
              <div
                className="custom-rule-badge"
                onClick={(e) => {
                  e.stopPropagation();
                  if (customRule.trim()) {
                    onSelectRule(customRule, false);
                  }
                }}
              >
                {isCustomSelected ? <IconApprovalCheck size={18} /> : <div className="proposal-unselected-circle large" />}
                <span>{isCustomSelected ? 'Selected' : 'Select'}</span>
              </div>
            </Card>
          </div>

          {/* Spaced Repetition Review Rule Option */}
          {reviewRule && (
            <div id="tutorial-review-rule" className="proposal-section-group">
              <h3 className="proposal-section-title">
                Spaced Repetition Review
              </h3>
              <Card
                isInteractive
                className={`review-rule-card ${isReviewSelection ? 'selected' : ''}`}
                onClick={() => onSelectRule(reviewRule.title, true)}
              >
                <div className="review-rule-content">
                  <div className="review-rule-header">
                    <Pill variant="warning">Review Mode</Pill>
                    <h4 className="target-text review-rule-title">{reviewRule.title}</h4>
                  </div>
                  <p className="review-rule-explanation">
                    {reviewRule.explanation.length > 100
                      ? `${reviewRule.explanation.slice(0, 120)}...`
                      : reviewRule.explanation}
                  </p>
                </div>
                <div className="review-rule-badge">
                  {isReviewSelection ? <IconApprovalCheck size={18} /> : <IconLexicon size={18} />}
                  <span>{isReviewSelection ? 'Selected Review' : 'Select Review'}</span>
                </div>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* Action Button */}
      <div className="proposal-action-buttons">
        <Button
          variant="secondary"
          className="proposal-btn"
          onClick={() => setConfirmRefreshTarget({ type: 'all' })}
          disabled={loadingProposals || generatingLesson || isProposalLimitReached}
          title={isProposalLimitReached ? 'Daily proposal limit reached. Resets at 00:00 UTC.' : undefined}
          icon={<IconRefreshCrank size={18} />}
        >
          Refresh Proposals
        </Button>
        <Button
          variant="primary"
          className="proposal-btn"
          id="tutorial-generate-btn"
          disabled={!selectedRuleTitle || generatingLesson || isLessonGenLimitReached}
          onClick={onGenerateLesson}
          icon={!generatingLesson ? <IconNewDispatch size={20} /> : undefined}
        >
          {generatingLesson ? (
            <LoadingSpinner
              variant="button"
              size={18}
              message="Generating Lesson..."
            />
          ) : isLessonGenLimitReached ? (
            `Daily Limit Reached (${lessonGenUsage?.used}/${lessonGenUsage?.limit})`
          ) : (
            'Generate Lesson & Exercises'
          )}
        </Button>
      </div>

      {/* Refresh Confirmation Modal */}
      <Modal
        isOpen={confirmRefreshTarget !== null}
        onClose={() => setConfirmRefreshTarget(null)}
        icon={<IconHazardAlert size={20} />}
        title="Confirm Refresh"
        maxWidth="440px"
      >
        <p className="modal-prompt-text">
          {confirmRefreshTarget?.type === 'all'
            ? 'Are you sure you want to refresh all proposals? The current proposals will be replaced and a proposal quota will be used.'
            : `Are you sure you want to replace "${confirmRefreshTarget?.title}" with a new proposal?`}
        </p>
        <div className="modal-actions">
          <Button variant="secondary" onClick={() => setConfirmRefreshTarget(null)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={(e) => {
              if (confirmRefreshTarget?.type === 'all') {
                fetchProposals(true);
              } else if (confirmRefreshTarget?.type === 'single') {
                onReplaceProposal(confirmRefreshTarget.index, e);
              }
              setConfirmRefreshTarget(null);
            }}
          >
            Confirm
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default ProposalPhase;
