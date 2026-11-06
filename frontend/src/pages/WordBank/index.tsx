import React, { useState } from 'react';
import { IconLexicon, IconFleuronPlus, IconTrashShears, IconHazardAlert } from '../../components/icons';
import { useLanguages } from '../../contexts/LanguageContext';
import { useWordBank } from './hooks/useWordBank';
import { WordCard } from './components/WordCard';
import { WordModal } from './components/WordModal';
import { WordFilterBar } from './components/WordFilterBar';
import { PageHeader, LoadingSpinner, EmptyState, Button, Modal } from '../../components';
import { Word } from '../../types';
import './WordBank.css';

export const WordBank: React.FC = () => {
  const { targetLanguage } = useLanguages();
  const {
    words,
    displayedWords,
    categories,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    loading,
    isModalOpen,
    editingWord,
    formData,
    updateFormField,
    openAddModal,
    openEditModal,
    closeModal,
    saveWord,
    deleteWord,
    playAudio,
    playingWordId,
    expandedNotes,
    toggleNote,
  } = useWordBank();
  const [wordToDelete, setWordToDelete] = useState<Word | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  return (
    <div className="wordbank-container">
      <PageHeader
        id="tutorial-wordbank-header"
        icon={<IconLexicon size={40} />}
        title={`${targetLanguage} Word Bank`}
        subtitle={
          <>
            <span>All learned vocabulary automatically tracked from lessons or added manually.</span>
            <br />
            <span>Total: {words.length} word{words.length !== 1 ? 's' : ''}.</span>
          </>
        }
        actions={
          <Button
            variant="primary"
            id="tutorial-wordbank-add-btn"
            onClick={openAddModal}
            icon={<IconFleuronPlus size={18} />}
          >
            <span>Add Custom Word</span>
          </Button>
        }
      />

      <WordFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        categories={categories}
      />

      <div id="tutorial-wordbank-list">
        {loading ? (
          <LoadingSpinner variant="card" />
        ) : displayedWords.length === 0 ? (
          <EmptyState message="No words found matching your search and filter criteria." />
        ) : (
          <div className="words-grid">
            {displayedWords.map((word) => (
              <WordCard
                key={word.id}
                word={word}
                isPlaying={playingWordId === word.id}
                isNoteExpanded={expandedNotes.has(word.id)}
                onPlayAudio={playAudio}
                onToggleNote={toggleNote}
                onEdit={openEditModal}
                onDelete={() => setWordToDelete(word)}
              />
            ))}
          </div>
        )}
      </div>

      <WordModal
        isOpen={isModalOpen}
        onClose={closeModal}
        editingWord={editingWord}
        formData={formData}
        categories={categories}
        onFieldChange={updateFormField}
        onSubmit={saveWord}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={wordToDelete !== null}
        onClose={() => !isDeleting && setWordToDelete(null)}
        icon={<IconHazardAlert size={20} />}
        title="Delete Word"
        maxWidth="440px"
        danger
      >
        <p className="modal-prompt-text">
          Are you sure you want to delete <strong>{wordToDelete?.targetLanguage}</strong> ({wordToDelete?.nativeLanguage}) from your vocabulary bank? This action cannot be undone.
        </p>
        <div className="modal-actions">
          <Button
            variant="secondary"
            onClick={() => setWordToDelete(null)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            disabled={isDeleting}
            icon={isDeleting ? undefined : <IconTrashShears size={16} />}
            onClick={async () => {
              if (!wordToDelete) return;
              setIsDeleting(true);
              try {
                await deleteWord(wordToDelete.id);
                setWordToDelete(null);
              } finally {
                setIsDeleting(false);
              }
            }}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default WordBank;
