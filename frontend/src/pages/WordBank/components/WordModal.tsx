import React from 'react';
import { Word } from '../../../types';
import { WordFormData } from '../types';
import { Modal } from '../../../components/Modal';
import { useLanguages } from '../../../contexts/LanguageContext';

export interface WordModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingWord: Word | null;
  formData: WordFormData;
  categories: string[];
  onFieldChange: <K extends keyof WordFormData>(field: K, value: WordFormData[K]) => void;
  onSubmit: (e: React.SubmitEvent) => Promise<void>;
}

export const WordModal: React.FC<WordModalProps> = ({
  isOpen,
  onClose,
  editingWord,
  formData,
  categories,
  onFieldChange,
  onSubmit,
}) => {
  const { targetLanguage, nativeLanguage } = useLanguages();
  const notesLength = formData.notes?.length || 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingWord ? 'Edit Word' : 'Add New Word to Bank'}
    >
      <form onSubmit={onSubmit} className="word-form-container">
        <div className="input-group">
          <label htmlFor="word-target-input">{targetLanguage}*</label>
          <input
            id="word-target-input"
            autoFocus
            type="text"
            className="kr-text"
            value={formData.targetLanguage}
            onChange={(e) => onFieldChange('targetLanguage', e.target.value)}
            required
            placeholder={`Word in ${targetLanguage}`}
          />
        </div>

        <div className="input-group">
          <label htmlFor="word-native-input">{nativeLanguage} Meaning*</label>
          <input
            id="word-native-input"
            type="text"
            value={formData.nativeLanguage}
            onChange={(e) => onFieldChange('nativeLanguage', e.target.value)}
            required
            placeholder={`Meaning in ${nativeLanguage}`}
          />
        </div>

        <div className="input-group">
          <label htmlFor="word-pronunciation-input">Pronunciation</label>
          <input
            id="word-pronunciation-input"
            type="text"
            value={formData.pronunciation || ''}
            onChange={(e) => onFieldChange('pronunciation', e.target.value)}
            placeholder="e.g. romanized pronunciation"
          />
        </div>

        <div className="input-group">
          <label htmlFor="word-pos-input">Part of Speech (Category)</label>
          <input
            id="word-pos-input"
            list="pos-options"
            type="text"
            value={formData.partOfSpeech || ''}
            onChange={(e) => onFieldChange('partOfSpeech', e.target.value)}
            placeholder="e.g. verb, noun, adjective"
          />
          <datalist id="pos-options">
            {categories.map((cat) => (
              <option key={cat} value={cat} />
            ))}
          </datalist>
        </div>

        <div className="input-group">
          <div className="word-form-notes-label">
            <label htmlFor="word-notes-input" style={{ margin: 0 }}>
              Notes / Context
            </label>
            <span
              className={`word-form-notes-counter ${notesLength >= 80 ? 'limit' : 'normal'}`}
            >
              {notesLength}/80
            </span>
          </div>
          <textarea
            id="word-notes-input"
            maxLength={80}
            value={formData.notes || ''}
            onChange={(e) => onFieldChange('notes', e.target.value)}
            placeholder="Usage hints or sentence example (max 80 characters)..."
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            Save Word
          </button>
        </div>
      </form>
    </Modal>
  );
};
