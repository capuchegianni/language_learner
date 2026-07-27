import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Word } from '../types';
import { BookOpen, Search, Plus, Trash2, Edit, X } from 'lucide-react';

export const WordBank: React.FC = () => {
  const [words, setWords] = useState<Word[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWord, setEditingWord] = useState<Word | null>(null);

  const [korean, setKorean] = useState('');
  const [english, setEnglish] = useState('');
  const [pronunciation, setPronunciation] = useState('');
  const [partOfSpeech, setPartOfSpeech] = useState('');
  const [notes, setNotes] = useState('');

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

  const handleOpenAddModal = () => {
    setEditingWord(null);
    setKorean('');
    setEnglish('');
    setPronunciation('');
    setPartOfSpeech('');
    setNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (word: Word) => {
    setEditingWord(word);
    setKorean(word.korean);
    setEnglish(word.english);
    setPronunciation(word.pronunciation || '');
    setPartOfSpeech(word.partOfSpeech || '');
    setNotes(word.notes || '');
    setIsModalOpen(true);
  };

  const handleSaveWord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!korean || !english) return;

    try {
      if (editingWord) {
        await api.updateWord(editingWord.id, { korean, english, pronunciation, partOfSpeech, notes });
      } else {
        await api.createWord({ korean, english, pronunciation, partOfSpeech, notes });
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

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <BookOpen style={{ color: 'var(--accent-secondary)' }} />
            <span>Korean Word Bank</span>
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

      {/* Search Input */}
      <div className="glass-card" style={{ padding: '0.85rem 1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Search size={20} color="var(--text-secondary)" />
        <input
          type="text"
          placeholder="Search word in Korean or English..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ background: 'transparent', border: 'none', color: '#fff', outline: 'none', width: '100%', fontSize: '1rem' }}
        />
      </div>

      {/* Words Grid */}
      {loading ? (
        <div className="glass-card" style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
          <div className="spinner" />
        </div>
      ) : words.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
          <p>No words found matching your search.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem' }}>
          {words.map((word) => (
            <div key={word.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <span className="kr-text" style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--accent-secondary)' }}>
                    {word.korean}
                  </span>
                  {word.partOfSpeech && <span className="pill pill-primary">{word.partOfSpeech}</span>}
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 500, marginBottom: '0.25rem' }}>
                  {word.english}
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
                <button className="btn" style={{ padding: '0.35rem 0.6rem', color: 'var(--text-secondary)' }} onClick={() => handleOpenEditModal(word)}>
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
                <label>Korean (Hangul)*</label>
                <input type="text" className="kr-text" value={korean} onChange={(e) => setKorean(e.target.value)} required placeholder="e.g. 공부하다" />
              </div>

              <div className="input-group">
                <label>English Meaning*</label>
                <input type="text" value={english} onChange={(e) => setEnglish(e.target.value)} required placeholder="e.g. To study" />
              </div>

              <div className="input-group">
                <label>Pronunciation (Romaja)</label>
                <input type="text" value={pronunciation} onChange={(e) => setPronunciation(e.target.value)} placeholder="e.g. gong-bu-ha-da" />
              </div>

              <div className="input-group">
                <label>Part of Speech</label>
                <input type="text" value={partOfSpeech} onChange={(e) => setPartOfSpeech(e.target.value)} placeholder="e.g. verb, noun, adjective" />
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
