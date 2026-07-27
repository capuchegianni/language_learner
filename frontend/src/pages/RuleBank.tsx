import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Rule } from '../types';
import { Scroll, Search, Plus, Trash2, Edit, X } from 'lucide-react';

export const RuleBank: React.FC = () => {
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
      setExamplesText(parsedEx.map((e: any) => `${e.korean} = ${e.english}`).join('\n'));
    } catch {
      setExamplesText(rule.examples || '');
    }
    setIsModalOpen(true);
  };

  const handleSaveRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !explanation) return;

    const formattedExamples = examplesText
      .split('\n')
      .filter((line) => line.trim())
      .map((line) => {
        const parts = line.split('=');
        return {
          korean: parts[0]?.trim() || line,
          english: parts[1]?.trim() || '',
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
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Scroll style={{ color: 'var(--accent-purple)' }} />
            <span>Mastered Grammar Rule Bank</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            A comprehensive index of all Korean grammar rules learned in lessons. Total: {rules.length} rules.
          </p>
        </div>

        <button className="btn btn-primary" onClick={handleOpenAddModal}>
          <Plus size={18} />
          <span>Add Custom Rule</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="glass-card" style={{ padding: '0.85rem 1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Search size={20} color="var(--text-secondary)" />
        <input
          type="text"
          placeholder="Search rule title or explanation..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ background: 'transparent', border: 'none', color: '#fff', outline: 'none', width: '100%', fontSize: '1rem' }}
        />
      </div>

      {/* Rules List */}
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
            let parsedExamples: Array<{ korean: string; english: string }> = [];
            try {
              parsedExamples = JSON.parse(rule.examples || '[]');
            } catch {
              // fallback
            }

            return (
              <div key={rule.id} className="glass-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <h3 className="kr-text" style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-purple)' }}>
                    {rule.title}
                  </h3>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn" style={{ padding: '0.35rem 0.6rem', color: 'var(--text-secondary)' }} onClick={() => handleOpenEditModal(rule)}>
                      <Edit size={16} />
                    </button>
                    <button className="btn" style={{ padding: '0.35rem 0.6rem', color: 'var(--accent-danger)' }} onClick={() => handleDeleteRule(rule.id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <p style={{ color: 'var(--text-primary)', marginBottom: '1rem', lineHeight: 1.6, fontSize: '1rem', whiteSpace: 'pre-line' }}>
                  {rule.explanation}
                </p>

                {parsedExamples.length > 0 && (
                  <div style={{ marginBottom: '0.75rem' }}>
                    <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Examples:</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      {parsedExamples.map((ex, idx) => (
                        <div key={idx} style={{ background: 'rgba(15,23,42,0.5)', padding: '0.5rem 0.85rem', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--accent-purple)' }}>
                          <span className="kr-text" style={{ fontWeight: 600, color: '#fff', fontSize: '1rem' }}>{ex.korean}</span>
                          {ex.english && <span style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginLeft: '0.75rem' }}>({ex.english})</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {rule.exceptions && (
                  <div style={{ fontSize: '0.95rem', color: 'var(--accent-warning)', background: 'rgba(245,158,11,0.1)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)' }}>
                    <strong>Exceptions:</strong> {rule.exceptions}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Rule Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) setIsModalOpen(false); }}>
          <div className="modal-content" onMouseDown={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>
                {editingRule ? 'Edit Grammar Rule' : 'Add Rule to Bank'}
              </h2>
              <button className="btn" style={{ padding: '0.4rem', color: 'var(--text-secondary)' }} onClick={() => setIsModalOpen(false)}>
                <X size={20} />
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
                <label>Examples (Format: Korean = English translation per line)</label>
                <textarea value={examplesText} onChange={(e) => setExamplesText(e.target.value)} placeholder="한국어를 배울 수 있어요 = I can learn Korean" />
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
