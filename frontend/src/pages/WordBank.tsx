import React, { useEffect, useState, useRef } from 'react';
import { api } from '../services/api';
import { Word } from '../types';
import { BookOpen, Plus, Trash2, Edit, X, Volume2 } from 'lucide-react';
import { FilterInput } from '../components/FilterInput';
import { useLanguages } from '../contexts/LanguageContext';

export const WordBank: React.FC = () => {
  const { targetLanguage, nativeLanguage } = useLanguages();
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

  const handleSaveWord = async (e: React.FormEvent) => {
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

    // Try to find a voice matching the target language
    const voices = window.speechSynthesis.getVoices();
    const langVoice = voices.find(v => v.lang.toLowerCase().startsWith(targetLanguage.toLowerCase().slice(0, 2)));
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
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <BookOpen style={{ color: 'var(--accent-secondary)' }} />
            <span>{targetLanguage} Word Bank</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            All learned vocabulary automatically tracked from lessons or added manually. Total: {words.length} words.
          </p>
        </div>

        <button className="btn btn-primary" onClick={handleOpenAddModal}>
          <Plus size={18} />
          <span>Add Custom Word</span>
        </button>
      </div>

      {/* Search Input and Filter */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <FilterInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder={`Search word in ${targetLanguage} or ${nativeLanguage}...`}
          containerStyle={{ flex: 1, minWidth: '250px' }}
        />
        <div className="glass-card" style={{ padding: '0.85rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Filter Category:</label>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            style={{ background: 'transparent', color: '#fff', border: 'none', outline: 'none', fontSize: '1rem', cursor: 'pointer' }}
          >
            <option value="" style={{ background: '#1e293b' }}>All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat} style={{ background: '#1e293b' }}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Words Grid */}
      {loading ? (
        <div className="glass-card" style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
          <div className="spinner" />
        </div>
      ) : displayedWords.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
          <p>No words found matching your search and filter criteria.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem' }}>
          {displayedWords.map((word) => (
            <div key={word.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <span className="kr-text" style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--accent-secondary)' }}>
                      {word.targetLanguage}
                    </span>
                    <button
                      className="btn"
                      style={{
                        padding: '0.35rem',
                        color: playingWordId === word.id ? 'var(--accent-primary)' : 'var(--text-secondary)',
                        borderRadius: '50%',
                        background: playingWordId === word.id ? 'rgba(59, 130, 246, 0.1)' : 'transparent'
                      }}
                      onClick={() => handlePlayAudio(word)}
                      title="Play pronunciation (Click again to play slower)"
                    >
                      <Volume2 size={18} />
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
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', background: 'rgba(15,23,42,0.5)', padding: '0.4rem 0.6rem', borderRadius: 'var(--radius-sm)' }}>
                    {word.notes}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
                <button className="btn" style={{ padding: '0.35rem 0.6rem', color: 'var(--accent-warning)' }} onClick={() => handleOpenEditModal(word)}>
                  <Edit size={16} />
                </button>
                <button className="btn" style={{ padding: '0.35rem 0.6rem', color: 'var(--accent-danger)' }} onClick={() => handleDeleteWord(word.id)}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Word Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) setIsModalOpen(false); }}>
          <div className="modal-content" onMouseDown={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>
                {editingWord ? 'Edit Word' : 'Add New Word to Bank'}
              </h2>
              <button className="btn" style={{ padding: '0.4rem', color: 'var(--text-secondary)' }} onClick={() => setIsModalOpen(false)}>
                <X size={20} />
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
