import React from 'react';
import { Rule } from '../../../types';
import { RuleFormData } from '../types';
import { Modal, Button, Input, Textarea } from '../../../components';
import { useLanguages } from '../../../contexts/LanguageContext';

export interface RuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingRule: Rule | null;
  formData: RuleFormData;
  onFieldChange: <K extends keyof RuleFormData>(field: K, value: RuleFormData[K]) => void;
  onSubmit: (e: React.SubmitEvent) => Promise<void>;
}

export const RuleModal: React.FC<RuleModalProps> = ({
  isOpen,
  onClose,
  editingRule,
  formData,
  onFieldChange,
  onSubmit,
}) => {
  const { targetLanguage, nativeLanguage } = useLanguages();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingRule ? 'Edit Grammar Rule' : 'Add Rule to Bank'}
    >
      <form onSubmit={onSubmit} className="rule-form-container">
        <Input
          id="rule-title-input"
          autoFocus
          label="Rule Title / Expression*"
          className="target-text"
          value={formData.title}
          onChange={(e) => onFieldChange('title', e.target.value)}
          required
          placeholder="e.g. -(으)ㄹ 수 있다"
        />

        <Textarea
          id="rule-explanation-input"
          label="Explanation & Usage*"
          value={formData.explanation}
          onChange={(e) => onFieldChange('explanation', e.target.value)}
          required
          placeholder="Explain when and how to form this rule..."
        />

        <Textarea
          id="rule-examples-input"
          label={`Examples (Format: ${targetLanguage} = ${nativeLanguage} translation per line)`}
          value={formData.examplesText}
          onChange={(e) => onFieldChange('examplesText', e.target.value)}
          placeholder={`Example in ${targetLanguage} = Translation in ${nativeLanguage}`}
        />

        <Input
          id="rule-exceptions-input"
          label="Exceptions or Notes"
          value={formData.exceptions}
          onChange={(e) => onFieldChange('exceptions', e.target.value)}
          placeholder="Irregular rules..."
        />

        <div className="modal-footer">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            Save Rule
          </Button>
        </div>
      </form>
    </Modal>
  );
};
