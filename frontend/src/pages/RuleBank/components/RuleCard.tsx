import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Edit, Trash2 } from 'lucide-react';
import { Rule } from '../../../types';
import { RuleExample } from '../types';
import { IconButton } from '../../../components';

export interface RuleCardProps {
  rule: Rule;
  onEdit: (rule: Rule) => void;
  onDelete: (id: string) => void;
}

export const RuleCard: React.FC<RuleCardProps> = ({ rule, onEdit, onDelete }) => {
  const navigate = useNavigate();

  let parsedExamples: RuleExample[] = [];
  try {
    const parsed = JSON.parse(rule.examples || '[]');
    if (Array.isArray(parsed)) {
      parsedExamples = parsed;
    }
  } catch {
    // fallback
  }

  return (
    <div className="glass-card rule-card">
      <div className="rule-card-header">
        <div className="rule-card-title-group">
          <h3 className="kr-text rule-card-title">{rule.title}</h3>
        </div>
        <div className="rule-card-actions">
          {rule._count && rule._count.lessons > 0 && (
            <button
              type="button"
              className="rule-count-badge"
              onClick={() =>
                navigate(`/history?q=${encodeURIComponent(rule.title)}`)
              }
              title={`View ${rule._count.lessons} linked lesson(s)`}
            >
              <Clock size={14} />
              <span>
                {rule._count.lessons} Lesson
                {rule._count.lessons !== 1 ? 's' : ''}
              </span>
            </button>
          )}
          <IconButton
            variant="edit"
            onClick={() => onEdit(rule)}
            title="Edit grammar rule"
            aria-label={`Edit rule: ${rule.title}`}
            icon={<Edit />}
          />
          <IconButton
            variant="delete"
            onClick={() => onDelete(rule.id)}
            title="Delete grammar rule"
            aria-label={`Delete rule: ${rule.title}`}
            icon={<Trash2 />}
          />
        </div>
      </div>

      <p className="rule-explanation-text">{rule.explanation}</p>

      {parsedExamples.length > 0 && (
        <div className="rule-examples-container">
          <div className="rule-examples-label">Examples:</div>
          <div className="rule-examples-list">
            {parsedExamples.map((ex, idx) => (
              <div key={idx} className="rule-example-box">
                <span className="kr-text rule-example-target">
                  {ex.targetLanguage}
                </span>
                {ex.nativeLanguage && (
                  <span className="rule-example-native">
                    ({ex.nativeLanguage})
                  </span>
                )}
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
};
