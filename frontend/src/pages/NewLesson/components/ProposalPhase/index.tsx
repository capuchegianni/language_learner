import React, { useState, useRef } from 'react';
import { ProposedRule } from '../../../../types';
import { RefreshCw, BookOpen, Sparkles, Check } from 'lucide-react';
import { useLanguages } from '../../../../contexts/LanguageContext';
import { Pill } from '../../../../components/Pill';
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
  className = '',
}) => {
  const { targetLanguage } = useLanguages();
  const [customRule, setCustomRule] = useState('');
  const customInputRef = useRef<HTMLInputElement>(null);
  const selectRef = useRef<HTMLSelectElement>(null);

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

  const handleSelectorClick = () => {
    if (selectRef.current) {
      selectRef.current.focus();
      if ('showPicker' in HTMLSelectElement.prototype) {
        try {
          selectRef.current.showPicker();
        } catch {
          // Fallback if browser requires direct user interaction
        }
      }
    }
  };

  return (
    <div id="tutorial-lesson-container" className={`proposal-phase-container ${className}`.trim()}>
      <div className="glass-card proposal-header-card">
        <h2 className="proposal-header-title">
          Select Today's {targetLanguage} Rule
        </h2>
        <p className="proposal-header-subtitle">
          The AI analyzed your mastered rules and proposed 3 new daily grammar rules, or choose a random revision rule to refresh your knowledge.
        </p>

        {/* Word Count Selector */}
        <label
          htmlFor="proposal-word-count-select"
          className="word-count-selector"
          onClick={handleSelectorClick}
        >
          <span className="word-count-label">Target New Words:</span>
          <select
            id="proposal-word-count-select"
            ref={selectRef}
            value={wordsCount}
            onChange={(e) => setWordsCount(Number(e.target.value))}
            className="word-count-select"
            onClick={(e) => e.stopPropagation()}
          >
            <option value={3}>3 Words</option>
            <option value={5}>5 Words (Standard)</option>
            <option value={7}>7 Words</option>
            <option value={10}>10 Words</option>
          </select>
        </label>
      </div>

      {loadingProposals ? (
        <div className="glass-card proposal-loading-card">
          <div className="spinner proposal-loading-spinner" />
          <p className="proposal-loading-text">AI is curating rule proposals based on your rule bank...</p>
        </div>
      ) : (
        <div className="proposal-sections-container">
          <div className="proposal-section-group">
            <h3 className="proposal-section-title">AI Proposed New Rules</h3>

            <div className="proposal-grid">
              {proposals.map((prop, idx) => {
                const isSelected = selectedRuleTitle === prop.title && !isReviewSelection;
                const isReplacing = replacingIndex === idx;

                return (
                  <div
                    key={idx}
                    className={`glass-card proposal-card ${isSelected ? 'selected' : ''} ${isReplacing ? 'replacing' : ''}`}
                    onClick={() => {
                      if (!isReplacing) onSelectRule(prop.title, false);
                    }}
                  >
                    {isReplacing ? (
                      <div className="proposal-replacing-state">
                        <div className="spinner proposal-loading-spinner" />
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
                            <button
                              type="button"
                              className="icon-btn proposal-replace-btn"
                              title="Replace this proposal"
                              aria-label={`Replace proposal: ${prop.title}`}
                              onClick={(e) => onReplaceProposal(idx, e)}
                              disabled={replacingIndex !== null}
                            >
                              <RefreshCw size={14} />
                            </button>
                          </div>
                          <h4 className="kr-text proposal-card-title">{prop.title}</h4>
                          <p className="proposal-card-desc">{prop.briefExplanation}</p>
                        </div>
                        <div className="proposal-select-indicator">
                          {isSelected ? <Check size={16} /> : <div className="proposal-unselected-circle" />}
                          <span>{isSelected ? 'Selected Rule' : 'Select Rule'}</span>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Custom Rule Input */}
          <div id="tutorial-custom-rule" className="proposal-section-group">
            <h3 className="proposal-section-title">
              Create Your Own Lesson
            </h3>
            <label
              htmlFor="custom-lesson-rule-input"
              className={`glass-card custom-rule-card ${isCustomSelected ? 'selected' : ''}`}
              onClick={handleCustomCardClick}
            >
              <div className="custom-rule-input-wrapper">
                <input
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
                {isCustomSelected ? <Check size={18} /> : <div className="proposal-unselected-circle large" />}
                <span>{isCustomSelected ? 'Selected' : 'Select'}</span>
              </div>
            </label>
          </div>

          {/* Spaced Repetition Review Rule Option */}
          {reviewRule && (
            <div id="tutorial-review-rule" className="proposal-section-group">
              <h3 className="proposal-section-title">
                Spaced Repetition Review
              </h3>
              <div
                className={`glass-card review-rule-card ${isReviewSelection ? 'selected' : ''}`}
                onClick={() => onSelectRule(reviewRule.title, true)}
              >
                <div className="review-rule-content">
                  <div className="review-rule-header">
                    <Pill variant="warning">Review Mode</Pill>
                    <h4 className="kr-text review-rule-title">{reviewRule.title}</h4>
                  </div>
                  <p className="review-rule-explanation">{reviewRule.explanation}</p>
                </div>
                <div className="review-rule-badge">
                  {isReviewSelection ? <Check size={18} /> : <BookOpen size={18} />}
                  <span>{isReviewSelection ? 'Selected Review' : 'Select Review'}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Action Button */}
      <div className="proposal-action-buttons">
        <button
          type="button"
          className="btn btn-secondary proposal-btn"
          onClick={() => fetchProposals(true)}
          disabled={loadingProposals || generatingLesson}
        >
          <RefreshCw size={18} />
          <span>Refresh Proposals</span>
        </button>
        <button
          type="button"
          className="btn btn-primary proposal-btn"
          id="tutorial-generate-btn"
          disabled={!selectedRuleTitle || generatingLesson}
          onClick={onGenerateLesson}
        >
          {generatingLesson ? (
            <>
              <div className="spinner" />
              <span>Generating Lesson...</span>
            </>
          ) : (
            <>
              <Sparkles size={20} />
              <span>Generate Lesson &amp; Exercises</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ProposalPhase;
