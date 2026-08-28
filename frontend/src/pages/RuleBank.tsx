import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Rule } from '../types';
import { Scroll, Plus, Trash2, Edit, X, Clock } from 'lucide-react';
import { FilterInput } from '../components/FilterInput';
import { useLanguages } from '../contexts/LanguageContext';

export const RuleBank: React.FC = () => {
  const navigate = useNavigate();
  const { targetLanguage, nativeLanguage } = useLanguages();
  const [rules, setRules] = useState<Rule[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<Rule | null>(null);

  const [title, setTitle] = useState('');
  const [explanation, setExplanation] = useState('');
  const [examplesText, setExamplesText] = useState('');
  const [exceptions, setExceptions] = useState('');

  const loadRules = async (q?: string) => {
    try {
      setLoading(true);
      const data = await api.getRules(q);
      setRules(data);
    } catch (err) {
      console.error('Failed to load rules', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRules(searchQuery);
  }, [searchQuery]);

  const handleOpenAddModal = () => {
    setEditingRule(null);
    setTitle('');
    setExplanation('');
    setExamplesText('');
    setExceptions('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (rule: Rule) => {
    setEditingRule(rule);
    setTitle(rule.title);
    setExplanation(rule.explanation);
    setExceptions(rule.exceptions || '');
    try {
      const parsedEx = JSON.parse(rule.examples || '[]');
      setExamplesText(parsedEx.map((e: any) => `${e.targetLanguage} = ${e.nativeLanguage}`).join('\n'));
    } catch {
      setExamplesText(rule.examples || '');
    }
    setIsModalOpen(true);
  };

  const handleSaveRule = async (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!title || !explanation) return;

    const formattedExamples = examplesText
      .split('\n')
      .filter((line) => line.trim())
      .map((line) => {
        const parts = line.split('=');
        return {
          targetLanguage: parts[0]?.trim() || line,
          nativeLanguage: parts[1]?.trim() || '',
        };
      });

    try {
      if (editingRule) {
        await api.updateRule(editingRule.id, {
          title,
          explanation,
          examples: JSON.stringify(formattedExamples),
          exceptions,
        });
      } else {
        await api.createRule({
          title,
          explanation,
          examples: JSON.stringify(formattedExamples),
          exceptions,
        });
      }
      setIsModalOpen(false);
      loadRules(searchQuery);
    } catch (err) {
      console.error('Failed to save rule', err);
    }
  };

  const handleDeleteRule = async (id: string) => {
    if (confirm('Are you sure you want to delete this rule from your bank?')) {
      await api.deleteRule(id);
      loadRules(searchQuery);
    }
  };

  return (
    <div className="rulebank-container">
      {/* Header */}
      <div className="page-header" id="tutorial-rulebank-header">
        <div>
          <h1 className="page-title">
            <Scroll style={{ color: 'var(--accent-purple)' }} />
            <span>Mastered Grammar Rule Bank</span>
          </h1>
          <p className="page-subtitle">
            A comprehensive index of all {targetLanguage} grammar rules learned in lessons. Total: {rules.length} rules.
          </p>
        </div>

        <button className="btn btn-primary page-header-btn" id="tutorial-rulebank-add-btn" onClick={handleOpenAddModal}>
          <Plus size={18} />
          <span>Add Custom Rule</span>
        </button>
      </div>

      {/* Search Input */}
      <div id="tutorial-rulebank-filter">
        <FilterInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search rule title or explanation..."
          containerStyle={{ marginBottom: '1.5rem' }}
        />
      </div>

      {/* Rules List */}
      <div id="tutorial-rulebank-list">
        {loading ? (
          <div className="glass-card" style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
            <div className="spinner" />
          </div>
        ) : rules.length === 0 ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
            <p>No grammar rules found matching your search.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {rules.map((rule) => {
              let parsedExamples: Array<{ targetLanguage: string; nativeLanguage: string }> = [];
              try {
                parsedExamples = JSON.parse(rule.examples || '[]');
              } catch {
                // fallback
              }

              return (
                <div key={rule.id} className="glass-card rule-card">
                  <div className="rule-card-header">
                    <div className="rule-card-title-group">
                      <h3 className="kr-text rule-card-title">
                        {rule.title}
                      </h3>
                    </div>
                    <div className="rule-card-actions">
                      {rule._count && rule._count.lessons > 0 && (
                        <button
                          type="button"
                          className="btn btn-secondary rule-count-badge"
                          onClick={() => navigate(`/history?q=${encodeURIComponent(rule.title)}`)}
                          title={`View ${rule._count.lessons} linked lesson(s)`}
                        >
                          <Clock size={14} />
                          <span>{rule._count.lessons} Lesson{rule._count.lessons !== 1 ? 's' : ''}</span>
                        </button>
                      )}
                      <button
                        type="button"
                        className="icon-btn icon-btn-edit"
                        onClick={() => handleOpenEditModal(rule)}
                        title="Edit grammar rule"
                        aria-label={`Edit rule: ${rule.title}`}
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        type="button"
                        className="icon-btn icon-btn-delete"
                        onClick={() => handleDeleteRule(rule.id)}
                        title="Delete grammar rule"
                        aria-label={`Delete rule: ${rule.title}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <p className="rule-explanation-text">
                    {rule.explanation}
                  </p>

                  {parsedExamples.length > 0 && (
                    <div style={{ marginBottom: '0.75rem' }}>
                      <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Examples:</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        {parsedExamples.map((ex, idx) => (
                          <div key={idx} className="rule-example-box">
                            <span className="kr-text rule-example-target">{ex.targetLanguage}</span>
                            {ex.nativeLanguage && <span className="rule-example-native">({ex.nativeLanguage})</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {rule.exceptions && (
                    <div className="rule-exceptions-box">
                      <strong>Exceptions:</strong> {rule.exceptions}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add / Edit Rule Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) setIsModalOpen(false); }}>
          <div className="modal-content" onMouseDown={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                {editingRule ? 'Edit Grammar Rule' : 'Add Rule to Bank'}
              </h2>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsModalOpen(false)}
                title="Close dialog"
                aria-label="Close dialog"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveRule} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="input-group">
                <label>Rule Title / Expression*</label>
                <input type="text" className="kr-text" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g. -(으)ㄹ 수 있다" />
              </div>

              <div className="input-group">
                <label>Explanation & Usage*</label>
                <textarea value={explanation} onChange={(e) => setExplanation(e.target.value)} required placeholder="Explain when and how to form this rule..." />
              </div>

              <div className="input-group">
                <label>Examples (Format: {targetLanguage} = {nativeLanguage} translation per line)</label>
                <textarea value={examplesText} onChange={(e) => setExamplesText(e.target.value)} placeholder={`Example in ${targetLanguage} = Translation in ${nativeLanguage}`} />
              </div>

              <div className="input-group">
                <label>Exceptions or Notes</label>
                <input type="text" value={exceptions} onChange={(e) => setExceptions(e.target.value)} placeholder="Irregular patchim rules..." />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
