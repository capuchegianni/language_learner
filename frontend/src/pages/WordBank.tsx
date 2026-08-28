import React, { useEffect, useState, useRef } from 'react';
import { api } from '../services/api';
import { Word } from '../types';
import { BookOpen, Plus, Trash2, Edit, X, Volume2 } from 'lucide-react';
import { FilterInput } from '../components/FilterInput';
import { useLanguages } from '../contexts/LanguageContext';

export const WordBank: React.FC = () => {
  const { targetLanguage, nativeLanguage, targetVoiceCode, getVoiceCode } = useLanguages();
  const [words, setWords] = useState<Word[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWord, setEditingWord] = useState<Word | null>(null);

  const [targetLangValue, setTargetLangValue] = useState('');
  const [nativeLangValue, setNativeLangValue] = useState('');
  const [pronunciation, setPronunciation] = useState('');
  const [partOfSpeech, setPartOfSpeech] = useState('');
  const [notes, setNotes] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const categorySelectRef = useRef<HTMLSelectElement>(null);
  const [playingWordId, setPlayingWordId] = useState<string | null>(null);
  const playStateRef = useRef({ id: null as string | null, isSlow: false });

  const loadWords = async (q?: string) => {
    try {
      setLoading(true);
      const data = await api.getWords(q);
      setWords(data);
    } catch (err) {
      console.error('Failed to load words', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWords(searchQuery);
  }, [searchQuery]);

  const categories = Array.from(new Set(words.map(w => w.partOfSpeech?.toLowerCase()).filter(Boolean))) as string[];
  const displayedWords = words.filter(w => !filterCategory || w.partOfSpeech?.toLowerCase() === filterCategory.toLowerCase());

  const handleOpenAddModal = () => {
    setEditingWord(null);
    setTargetLangValue('');
    setNativeLangValue('');
    setPronunciation('');
    setPartOfSpeech('');
    setNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (word: Word) => {
    setEditingWord(word);
    setTargetLangValue(word.targetLanguage);
    setNativeLangValue(word.nativeLanguage);
    setPronunciation(word.pronunciation || '');
    setPartOfSpeech(word.partOfSpeech || '');
    setNotes(word.notes || '');
    setIsModalOpen(true);
  };

  const handleSaveWord = async (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!targetLangValue || !nativeLangValue) return;

    try {
      if (editingWord) {
        await api.updateWord(editingWord.id, { targetLanguage: targetLangValue, nativeLanguage: nativeLangValue, pronunciation, partOfSpeech, notes });
      } else {
        await api.createWord({ targetLanguage: targetLangValue, nativeLanguage: nativeLangValue, pronunciation, partOfSpeech, notes });
      }
      setIsModalOpen(false);
      loadWords(searchQuery);
    } catch (err) {
      console.error('Failed to save word', err);
    }
  };

  const handleDeleteWord = async (id: string) => {
    if (confirm('Are you sure you want to delete this word from your bank?')) {
      await api.deleteWord(id);
      loadWords(searchQuery);
    }
  };

  const handlePlayAudio = (word: Word) => {
    if (!window.speechSynthesis) {
      alert("Sorry, your browser doesn't support text to speech!");
      return;
    }

    window.speechSynthesis.cancel();

    const currentState = playStateRef.current;
    let newSpeed = 1.0;
    let newIsSlow = false;

    if (currentState.id === word.id && !currentState.isSlow) {
      newSpeed = 0.5;
      newIsSlow = true;
    }

    playStateRef.current = { id: word.id, isSlow: newIsSlow };
    setPlayingWordId(word.id);

    const utterance = new SpeechSynthesisUtterance(word.targetLanguage);
    const voiceCode = targetVoiceCode || getVoiceCode(targetLanguage);
    utterance.lang = voiceCode;

    // Try to find a voice matching the target voice code
    const voices = window.speechSynthesis.getVoices();
    const baseCode = voiceCode.split('-')[0].toLowerCase();
    const langVoice = voices.find(v => {
      const normalizedVoiceLang = v.lang.replace('_', '-').toLowerCase();
      return normalizedVoiceLang === voiceCode.toLowerCase() || normalizedVoiceLang.startsWith(baseCode);
    });

    if (langVoice) {
      utterance.voice = langVoice;
      utterance.lang = langVoice.lang;
    }

    utterance.rate = newSpeed;
    utterance.onend = () => setPlayingWordId(null);
    utterance.onerror = () => setPlayingWordId(null);

    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="wordbank-container">
      {/* Header */}
      <div className="page-header" id="tutorial-wordbank-header">
        <div>
          <h1 className="page-title">
            <BookOpen style={{ color: 'var(--accent-secondary)' }} />
            <span>{targetLanguage} Word Bank</span>
          </h1>
          <p className="page-subtitle">
            All learned vocabulary automatically tracked from lessons or added manually. Total: {words.length} words.
          </p>
        </div>

        <button className="btn btn-primary page-header-btn" id="tutorial-wordbank-add-btn" onClick={handleOpenAddModal}>
          <Plus size={18} />
          <span>Add Custom Word</span>
        </button>
      </div>

      {/* Search Input and Filter */}
      <div className="filter-bar" id="tutorial-wordbank-filter">
        <FilterInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder={`Search word in ${targetLanguage} or ${nativeLanguage}...`}
          containerStyle={{ flex: 1 }}
        />
        <label
          htmlFor="wordbank-category-filter"
          className="glass-card filter-select-card"
          onClick={(e) => {
            if (e.target !== categorySelectRef.current) {
              try { categorySelectRef.current?.showPicker?.(); } catch {}
              categorySelectRef.current?.focus();
            }
          }}
        >
          <span className="filter-select-label">Category:</span>
          <select
            id="wordbank-category-filter"
            ref={categorySelectRef}
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="filter-select-input"
          >
            <option value="" style={{ background: '#1e293b' }}>All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat} style={{ background: '#1e293b' }}>{cat}</option>
            ))}
          </select>
        </label>
      </div>

      {/* Words Grid */}
      <div id="tutorial-wordbank-list">
        {loading ? (
          <div className="glass-card" style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
            <div className="spinner" />
          </div>
        ) : displayedWords.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
          <p>No words found matching your search and filter criteria.</p>
        </div>
        ) : (
          <div className="words-grid">
            {displayedWords.map((word) => (
              <div key={word.id} className="glass-card word-card">
                <div>
                  <div className="word-card-header">
                    <div className="word-card-target">
                      <span className="kr-text word-target-text">
                        {word.targetLanguage}
                      </span>
                      <button
                        type="button"
                        className={`icon-btn icon-btn-audio ${playingWordId === word.id ? 'active' : ''}`}
                        onClick={() => handlePlayAudio(word)}
                        title="Play pronunciation (Click again to play slower)"
                        aria-label={`Play pronunciation for ${word.targetLanguage}`}
                      >
                        <Volume2 size={16} />
                      </button>
                    </div>
                    {word.partOfSpeech && <span className="pill pill-primary">{word.partOfSpeech}</span>}
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 500, marginBottom: '0.25rem' }}>
                    {word.nativeLanguage}
                  </div>
                  {word.pronunciation && (
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '0.5rem' }}>
                      [{word.pronunciation}]
                    </div>
                  )}
                  {word.notes && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', background: 'rgba(15,23,42,0.5)', padding: '0.4rem 0.6rem', borderRadius: 'var(--radius-sm)', wordBreak: 'break-word' }}>
                      {word.notes}
                    </div>
                  )}
                </div>

                <div className="word-card-footer">
                  <button
                    type="button"
                    className="icon-btn icon-btn-edit"
                    onClick={() => handleOpenEditModal(word)}
                    title="Edit word"
                    aria-label={`Edit ${word.targetLanguage} (${word.nativeLanguage})`}
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    type="button"
                    className="icon-btn icon-btn-delete"
                    onClick={() => handleDeleteWord(word.id)}
                    title="Delete word"
                    aria-label={`Delete ${word.targetLanguage}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Word Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) setIsModalOpen(false); }}>
          <div className="modal-content" onMouseDown={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                {editingWord ? 'Edit Word' : 'Add New Word to Bank'}
              </h2>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsModalOpen(false)}
                title="Close dialog"
                aria-label="Close dialog"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveWord} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="input-group">
                <label>{targetLanguage}*</label>
                <input autoFocus type="text" className="kr-text" value={targetLangValue} onChange={(e) => setTargetLangValue(e.target.value)} required placeholder={`Word in ${targetLanguage}`} />
              </div>

              <div className="input-group">
                <label>{nativeLanguage} Meaning*</label>
                <input type="text" value={nativeLangValue} onChange={(e) => setNativeLangValue(e.target.value)} required placeholder={`Meaning in ${nativeLanguage}`} />
              </div>

              <div className="input-group">
                <label>Pronunciation</label>
                <input type="text" value={pronunciation} onChange={(e) => setPronunciation(e.target.value)} placeholder="e.g. romanized pronunciation" />
              </div>

              <div className="input-group">
                <label>Part of Speech (Category)</label>
                <input list="pos-options" type="text" value={partOfSpeech} onChange={(e) => setPartOfSpeech(e.target.value)} placeholder="e.g. verb, noun, adjective" />
                <datalist id="pos-options">
                  {categories.map(cat => <option key={cat} value={cat} />)}
                </datalist>
              </div>

              <div className="input-group">
                <label>Notes / Context</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Usage hints or sentence example..." />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Word
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
