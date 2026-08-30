import React from 'react';
import { Rule } from '../../../types';
import { RuleFormData } from '../types';
import { Modal } from '../../../components/Modal';
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
        <div className="input-group">
          <label htmlFor="rule-title-input">Rule Title / Expression*</label>
          <input
            id="rule-title-input"
            autoFocus
            type="text"
            className="kr-text"
            value={formData.title}
            onChange={(e) => onFieldChange('title', e.target.value)}
            required
            placeholder="e.g. -(으)ㄹ 수 있다"
          />
        </div>

        <div className="input-group">
          <label htmlFor="rule-explanation-input">Explanation &amp; Usage*</label>
          <textarea
            id="rule-explanation-input"
            value={formData.explanation}
            onChange={(e) => onFieldChange('explanation', e.target.value)}
            required
            placeholder="Explain when and how to form this rule..."
          />
        </div>

        <div className="input-group">
          <label htmlFor="rule-examples-input">
            Examples (Format: {targetLanguage} = {nativeLanguage} translation per line)
          </label>
          <textarea
            id="rule-examples-input"
            value={formData.examplesText}
            onChange={(e) => onFieldChange('examplesText', e.target.value)}
            placeholder={`Example in ${targetLanguage} = Translation in ${nativeLanguage}`}
          />
        </div>

        <div className="input-group">
          <label htmlFor="rule-exceptions-input">Exceptions or Notes</label>
          <input
            id="rule-exceptions-input"
            type="text"
            value={formData.exceptions}
            onChange={(e) => onFieldChange('exceptions', e.target.value)}
            placeholder="Irregular patchim rules..."
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            Save Rule
          </button>
        </div>
      </form>
    </Modal>
  );
};
