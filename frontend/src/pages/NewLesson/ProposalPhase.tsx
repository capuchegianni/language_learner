import React, { useState } from 'react';
import { ProposedRule } from '../../types';
import { RefreshCw, BookOpen, Sparkles, Check } from 'lucide-react';
import { useLanguages } from '../../contexts/LanguageContext';

interface ProposalPhaseProps {
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
}) => {
  const { targetLanguage } = useLanguages();
  const [customRule, setCustomRule] = useState('');

  const isCustomSelected =
    selectedRuleTitle !== '' &&
    !proposals.find(p => p.title === selectedRuleTitle) &&
    (!reviewRule || reviewRule.title !== selectedRuleTitle);

  const handleCustomRuleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomRule(val);
    if (val.trim()) {
      onSelectRule(val, false);
    }
  };

  const handleCustomCardClick = () => {
    if (customRule.trim()) {
      onSelectRule(customRule, false);
    }
  };
  return (
    <div id="tutorial-lesson-container" className="proposal-phase-container">
      <div className="glass-card proposal-header-card" style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
        <h2 className="proposal-header-title">
          Select Today's {targetLanguage} Rule
        </h2>
        <p className="proposal-header-subtitle">
          The AI analyzed your mastered rules and proposed 3 new daily grammar rules, or choose a random revision rule to refresh your knowledge.
        </p>

        {/* Word Count Selector */}
        <div className="word-count-selector">
          <label style={{ fontSize: '0.9rem', fontWeight: 500 }}>Target New Words:</label>
          <select
            value={wordsCount}
            onChange={(e) => setWordsCount(Number(e.target.value))}
            style={{ background: 'transparent', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer', outline: 'none' }}
          >
            <option value={3} style={{ background: '#1e293b' }}>3 Words</option>
            <option value={5} style={{ background: '#1e293b' }}>5 Words (Standard)</option>
            <option value={7} style={{ background: '#1e293b' }}>7 Words</option>
            <option value={10} style={{ background: '#1e293b' }}>10 Words</option>
          </select>
        </div>
      </div>

      {loadingProposals ? (
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem', marginBottom: '2rem' }}>
          <div className="spinner" style={{ marginBottom: '1rem' }} />
          <p style={{ color: 'var(--text-secondary)' }}>AI is curating rule proposals based on your rule bank...</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>AI Proposed New Rules</h3>

          <div className="proposal-grid">
            {proposals.map((prop, idx) => {
              const isSelected = selectedRuleTitle === prop.title && !isReviewSelection;
              return (
                <div
                  key={idx}
                  className="glass-card proposal-card"
                  style={{
                    borderColor: isSelected ? 'var(--accent-primary)' : 'var(--border-color)',
                    background: isSelected ? 'rgba(99, 102, 241, 0.12)' : 'var(--bg-card)',
                    cursor: replacingIndex === idx ? 'default' : 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '180px',
                    transition: 'all 0.2s ease',
                    opacity: replacingIndex === idx ? 0.7 : 1,
                  }}
                  onClick={() => {
                    if (replacingIndex !== idx) onSelectRule(prop.title, false);
                  }}
                >
                  {replacingIndex === idx ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                      <div className="spinner" style={{ marginBottom: '1rem' }} />
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Generating new proposal...</span>
                    </div>
                  ) : (
                    <>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <span className="pill pill-primary">{prop.category}</span>
                            <span className="pill pill-warning">{prop.difficulty}</span>
                          </div>
                          <button
                            type="button"
                            className="icon-btn icon-btn-secondary"
                            style={{ width: '32px', height: '32px', minWidth: '32px', minHeight: '32px', padding: '0.25rem' }}
                            title="Replace this proposal"
                            aria-label={`Replace proposal: ${prop.title}`}
                            onClick={(e) => onReplaceProposal(idx, e)}
                            disabled={replacingIndex !== null}
                          >
                            <RefreshCw size={14} />
                          </button>
                        </div>
                        <h4 className="kr-text" style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem', color: isSelected ? 'var(--accent-secondary)' : '#fff' }}>
                          {prop.title}
                        </h4>
                        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                          {prop.briefExplanation}
                        </p>
                      </div>
                      <div style={{ marginTop: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: isSelected ? 'var(--accent-primary)' : 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem' }}>
                        {isSelected ? <Check size={16} /> : <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid var(--border-color)' }} />}
                        <span>{isSelected ? 'Selected Rule' : 'Select Rule'}</span>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {/* Custom Rule Input */}
          <div id="tutorial-custom-rule" style={{ marginTop: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
              Create Your Own Lesson
            </h3>
            <div
              className="glass-card custom-rule-card"
              style={{
                borderColor: isCustomSelected ? 'var(--accent-primary)' : 'var(--border-color)',
                background: isCustomSelected ? 'rgba(99, 102, 241, 0.12)' : 'var(--bg-card)',
                cursor: 'pointer',
              }}
              onClick={handleCustomCardClick}
            >
              <div className="custom-rule-input-wrapper">
                <input
                  type="text"
                  placeholder={`e.g., How to say 'I want to...' in ${targetLanguage}`}
                  value={customRule}
                  onChange={handleCustomRuleChange}
                  className="custom-rule-input"
                />
              </div>
              <div className="custom-rule-badge" style={{ color: isCustomSelected ? 'var(--accent-primary)' : 'var(--text-muted)' }}>
                {isCustomSelected ? <Check size={18} /> : <div style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid var(--border-color)' }} />}
                <span>{isCustomSelected ? 'Selected' : 'Select'}</span>
              </div>
            </div>
          </div>

          {/* Spaced Repetition Review Rule Option */}
          {reviewRule && (
            <div id="tutorial-review-rule" style={{ marginTop: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                Spaced Repetition Review
              </h3>
              <div
                className="glass-card review-rule-card"
                style={{
                  borderColor: isReviewSelection ? 'var(--accent-warning)' : 'var(--border-color)',
                  background: isReviewSelection ? 'rgba(245, 158, 11, 0.12)' : 'var(--bg-card)',
                  cursor: 'pointer',
                }}
                onClick={() => onSelectRule(reviewRule.title, true)}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                    <span className="pill pill-warning">Review Mode</span>
                    <h4 className="kr-text" style={{ fontSize: '1.1rem', fontWeight: 700 }}>{reviewRule.title}</h4>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{reviewRule.explanation}</p>
                </div>
                <div className="review-rule-badge" style={{ color: isReviewSelection ? 'var(--accent-warning)' : 'var(--text-muted)' }}>
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
          className="btn btn-secondary proposal-btn"
          onClick={() => fetchProposals(true)}
          disabled={loadingProposals || generatingLesson}
        >
          <RefreshCw size={18} />
          <span>Refresh Proposals</span>
        </button>
        <button
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
