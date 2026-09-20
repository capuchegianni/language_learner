import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IconChronicle,
  IconDraftingEdit,
  IconTrashShears,
  IconHazardAlert,
} from '../../../components/icons';
import { Rule } from '../../../types';
import { RuleExample } from '../types';
import { IconButton, Card, Button } from '../../../components';

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
    <Card className="rule-card">
      <div className="rule-card-header">
        <div className="rule-card-title-group">
          <h3 className="target-text rule-card-title">{rule.title}</h3>
        </div>
        <div className="rule-card-actions">
          {rule._count && rule._count.lessons > 0 && (
            <Button
              variant="secondary"
              onClick={() =>
                navigate(`/history?q=${encodeURIComponent(rule.title)}`)
              }
              title={`View ${rule._count.lessons} linked lesson(s)`}
            >
              <IconChronicle size={14} />
              <span>
                {rule._count.lessons} Lesson
                {rule._count.lessons !== 1 ? 's' : ''}
              </span>
            </Button>
          )}
          <IconButton
            variant="edit"
            onClick={() => onEdit(rule)}
            title="Edit grammar rule"
            aria-label={`Edit rule: ${rule.title}`}
            icon={<IconDraftingEdit />}
          />
          <IconButton
            variant="delete"
            onClick={() => onDelete(rule.id)}
            title="Delete grammar rule"
            aria-label={`Delete rule: ${rule.title}`}
            icon={<IconTrashShears />}
          />
        </div>
      </div>

      <div className="rule-explanation-body">
        {rule.explanation
          ?.split(/\n\s*\n|(?=(?:^|\n)\s*\d+\.\s+)/)
          .map((part) => part.trim())
          .filter(Boolean)
          .map((section, idx) => (
            <p key={idx} className="rule-explanation-paragraph">
              {section}
            </p>
          ))}
      </div>

      {parsedExamples.length > 0 && (
        <div className="rule-examples-container">
          <h4 className="rule-examples-label">Examples:</h4>
          <div className="rule-examples-list">
            {parsedExamples.map((ex, idx) => (
              <div key={idx} className="rule-example-box">
                <div className="target-text rule-example-target">
                  {ex.targetLanguage}
                </div>
                {ex.nativeLanguage && (
                  <div className="rule-example-native">
                    {ex.nativeLanguage}
                  </div>
                )}
                {ex.explanation && (
                  <div className="rule-example-expl">
                    {ex.explanation}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {rule.exceptions && (
        <div className="rule-exceptions-box">
          <div className="rule-exceptions-header">
            <IconHazardAlert size={16} />
            <span>Note / Exceptions</span>
          </div>
          <p className="rule-exceptions-text">{rule.exceptions}</p>
        </div>
      )}
    </Card>
  );
};

