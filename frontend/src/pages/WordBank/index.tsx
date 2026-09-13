import React from 'react';
import { BookOpen, Plus } from 'lucide-react';
import { useLanguages } from '../../contexts/LanguageContext';
import { useWordBank } from './hooks/useWordBank';
import { WordCard } from './components/WordCard';
import { WordModal } from './components/WordModal';
import { WordFilterBar } from './components/WordFilterBar';
import { PageHeader } from '../../components/PageHeader';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { EmptyState } from '../../components/EmptyState';
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

  return (
    <div className="wordbank-container">
      <PageHeader
        id="tutorial-wordbank-header"
        icon={<BookOpen style={{ color: 'var(--accent-secondary)' }} />}
        title={`${targetLanguage} Word Bank`}
        subtitle={`All learned vocabulary automatically tracked from lessons or added manually. Total: ${words.length} words.`}
        actions={
          <button
            type="button"
            className="btn btn-primary"
            id="tutorial-wordbank-add-btn"
            onClick={openAddModal}
          >
            <Plus size={18} />
            <span>Add Custom Word</span>
          </button>
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
                onDelete={deleteWord}
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
    </div>
  );
};

export default WordBank;
