import { useState, useEffect, useCallback, useMemo } from 'react';
import { api } from '../../../services/api';
import { Word } from '../../../types';
import { WordFormData, DEFAULT_WORD_FORM } from '../types';
import { useSpeechSynthesis } from '../../../hooks/useSpeechSynthesis';
import { useLanguages } from '../../../contexts/LanguageContext';

export interface UseWordBankReturn {
  words: Word[];
  displayedWords: Word[];
  categories: string[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  loading: boolean;
  isModalOpen: boolean;
  editingWord: Word | null;
  formData: WordFormData;
  setFormData: React.Dispatch<React.SetStateAction<WordFormData>>;
  updateFormField: <K extends keyof WordFormData>(field: K, value: WordFormData[K]) => void;
  openAddModal: () => void;
  openEditModal: (word: Word) => void;
  closeModal: () => void;
  saveWord: (e: React.SubmitEvent) => Promise<void>;
  deleteWord: (id: string) => Promise<void>;
  playAudio: (word: Word) => void;
  playingWordId: string | null;
  expandedNotes: Set<string>;
  toggleNote: (id: string) => void;
}

export function useWordBank(): UseWordBankReturn {
  const { targetLanguage, targetVoiceCode, getVoiceCode } = useLanguages();
  const [words, setWords] = useState<Word[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingWord, setEditingWord] = useState<Word | null>(null);
  const [formData, setFormData] = useState<WordFormData>(DEFAULT_WORD_FORM);
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());

  const { speak, playingId } = useSpeechSynthesis({
    defaultVoiceCode: targetVoiceCode || getVoiceCode(targetLanguage),
  });

  const fetchWords = useCallback(async (q?: string) => {
    try {
      setLoading(true);
      const data = await api.getWords(q);
      setWords(data);
    } catch (err) {
      console.error('Failed to load words', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWords(searchQuery);
  }, [searchQuery, fetchWords]);

  const categories = useMemo(() => {
    return Array.from(
      new Set(words.map((w) => w.partOfSpeech).filter(Boolean)),
    ) as string[];
  }, [words]);

  const displayedWords = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return words.filter((w) => {
      const matchesSearch =
        !query ||
        w.targetLanguage.toLowerCase().includes(query) ||
        w.nativeLanguage.toLowerCase().includes(query) ||
        (w.pronunciation && w.pronunciation.toLowerCase().includes(query));
      const matchesCategory =
        !selectedCategory || w.partOfSpeech === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [words, searchQuery, selectedCategory]);

  const toggleNote = useCallback((id: string) => {
    setExpandedNotes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const openAddModal = useCallback(() => {
    setEditingWord(null);
    setFormData(DEFAULT_WORD_FORM);
    setIsModalOpen(true);
  }, []);

  const openEditModal = useCallback((word: Word) => {
    setEditingWord(word);
    setFormData({
      targetLanguage: word.targetLanguage,
      nativeLanguage: word.nativeLanguage,
      pronunciation: word.pronunciation || '',
      partOfSpeech: word.partOfSpeech || '',
      notes: word.notes || '',
    });
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingWord(null);
  }, []);

  const updateFormField = useCallback(
    <K extends keyof WordFormData>(field: K, value: WordFormData[K]) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const saveWord = useCallback(
    async (e: React.SubmitEvent) => {
      e.preventDefault();
      if (!formData.targetLanguage || !formData.nativeLanguage) return;

      try {
        if (editingWord) {
          await api.updateWord(editingWord.id, formData);
        } else {
          await api.createWord(formData);
        }
        setIsModalOpen(false);
        await fetchWords(searchQuery);
      } catch (err) {
        console.error('Failed to save word', err);
      }
    },
    [editingWord, formData, searchQuery, fetchWords],
  );

  const deleteWord = useCallback(
    async (id: string) => {
      if (
        window.confirm(
          'Are you sure you want to delete this word from your vocabulary bank?',
        )
      ) {
        try {
          await api.deleteWord(id);
          await fetchWords(searchQuery);
        } catch (err) {
          console.error('Failed to delete word', err);
        }
      }
    },
    [searchQuery, fetchWords],
  );

  const playAudio = useCallback(
    (word: Word) => {
      speak(word.targetLanguage, {
        id: word.id,
        voiceCode: targetVoiceCode || getVoiceCode(targetLanguage),
      });
    },
    [speak, targetLanguage, targetVoiceCode, getVoiceCode],
  );

  return {
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
    setFormData,
    updateFormField,
    openAddModal,
    openEditModal,
    closeModal,
    saveWord,
    deleteWord,
    playAudio,
    playingWordId: playingId,
    expandedNotes,
    toggleNote,
  };
}
