import React from 'react';
import { Volume2, FileText, Edit, Trash2 } from 'lucide-react';
import { Word } from '../../../types';
import { Pill, IconButton } from '../../../components';

export interface WordCardProps {
  word: Word;
  isPlaying: boolean;
  isNoteExpanded: boolean;
  onPlayAudio: (word: Word) => void;
  onToggleNote: (id: string) => void;
  onEdit: (word: Word) => void;
  onDelete: (id: string) => void;
}

export const WordCard: React.FC<WordCardProps> = ({
  word,
  isPlaying,
  isNoteExpanded,
  onPlayAudio,
  onToggleNote,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="glass-card word-card">
      <div>
        <div className="word-card-header">
          <div className="word-card-target">
            <span className="kr-text word-target-text">
              {word.targetLanguage}
            </span>
            <IconButton
              variant="audio"
              active={isPlaying}
              onClick={() => onPlayAudio(word)}
              title="Play pronunciation (Click again to play slower)"
              aria-label={`Play pronunciation for ${word.targetLanguage}`}
              icon={<Volume2 />}
            />
            {word.notes && (
              <IconButton
                variant="note"
                active={isNoteExpanded}
                onClick={() => onToggleNote(word.id)}
                title={isNoteExpanded ? 'Hide note' : 'Show note'}
                aria-label={isNoteExpanded ? 'Hide note' : 'Show note'}
                icon={<FileText />}
              />
            )}
          </div>
        </div>

        <div className="word-card-native">
          {word.nativeLanguage}
        </div>

        {word.pronunciation && (
          <div
            className="word-card-pronunciation"
            style={{
              marginBottom: isNoteExpanded && word.notes ? '0.5rem' : 0,
            }}
          >
            [{word.pronunciation}]
          </div>
        )}

        {isNoteExpanded && word.notes && (
          <div className="word-notes-box">
            {word.notes}
          </div>
        )}
      </div>

      <div className="word-card-footer">
        <div className="word-card-category">
          {word.partOfSpeech && (
            <Pill variant="primary">{word.partOfSpeech}</Pill>
          )}
        </div>
        <div className="word-card-actions">
          <IconButton
            variant="edit"
            onClick={() => onEdit(word)}
            title="Edit word"
            aria-label={`Edit ${word.targetLanguage}`}
            icon={<Edit />}
          />
          <IconButton
            variant="delete"
            onClick={() => onDelete(word.id)}
            title="Delete word"
            aria-label={`Delete ${word.targetLanguage}`}
            icon={<Trash2 />}
          />
        </div>
      </div>
    </div>
  );
};
