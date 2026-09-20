import React from 'react';
import { Word } from '../../../types';
import { WordFormData } from '../types';
import { Modal, Button, Input, Textarea } from '../../../components';
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
        <Input
          id="word-target-input"
          autoFocus
          label={`${targetLanguage}*`}
          className="target-text"
          value={formData.targetLanguage}
          onChange={(e) => onFieldChange('targetLanguage', e.target.value)}
          required
          placeholder={`Word in ${targetLanguage}`}
        />

        <Input
          id="word-native-input"
          label={`${nativeLanguage} Meaning*`}
          value={formData.nativeLanguage}
          onChange={(e) => onFieldChange('nativeLanguage', e.target.value)}
          required
          placeholder={`Meaning in ${nativeLanguage}`}
        />

        <Input
          id="word-pronunciation-input"
          label="Pronunciation"
          value={formData.pronunciation || ''}
          onChange={(e) => onFieldChange('pronunciation', e.target.value)}
          placeholder="e.g. romanized pronunciation"
        />

        <div>
          <Input
            id="word-pos-input"
            label="Part of Speech (Category)"
            list="pos-options"
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

        <Textarea
          id="word-notes-input"
          label={
            <div className="word-form-notes-label">
              <span>Notes / Context</span>
              <span
                className={`word-form-notes-counter ${notesLength >= 80 ? 'limit' : 'normal'}`}
              >
                {notesLength}/80
              </span>
            </div>
          }
          maxLength={80}
          value={formData.notes || ''}
          onChange={(e) => onFieldChange('notes', e.target.value)}
          placeholder="Usage hints or sentence example (max 80 characters)..."
        />

        <div className="modal-footer">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            Save Word
          </Button>
        </div>
      </form>
    </Modal>
  );
};
