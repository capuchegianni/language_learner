import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../../services/api';
import { Lesson } from '../../../types';

export interface UseLessonHistoryReturn {
  lessons: Lesson[];
  displayedLessons: Lesson[];
  loading: boolean;
  search: string;
  setSearch: (search: string) => void;
  filterStatus: string;
  setFilterStatus: (status: string) => void;
  deleteLesson: (e: React.MouseEvent, id: string) => Promise<void>;
}

export function useLessonHistory(): UseLessonHistoryReturn {
  const [searchParams] = useSearchParams();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>(searchParams.get('q') || '');
  const [filterStatus, setFilterStatus] = useState<string>(
    searchParams.get('status') || '',
  );

  useEffect(() => {
    const statusParam = searchParams.get('status') || '';
    const qParam = searchParams.get('q') || '';
    setFilterStatus(statusParam);
    setSearch(qParam);
  }, [searchParams]);

  const loadLessons = useCallback(async (q?: string, status?: string) => {
    try {
      setLoading(true);
      const data = await api.getLessons({
        q: q || undefined,
        status: status || undefined,
      });
      setLessons(data);
    } catch (err) {
      console.error('Failed to load lessons', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLessons(search, filterStatus);
  }, [search, filterStatus, loadLessons]);

  const deleteLesson = useCallback(
    async (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      if (window.confirm('Are you sure you want to delete this lesson?')) {
        try {
          await api.deleteLesson(id);
          await loadLessons(search, filterStatus);
        } catch (err) {
          console.error('Failed to delete lesson', err);
        }
      }
    },
    [search, filterStatus, loadLessons],
  );

  const displayedLessons = useMemo(() => {
    const q = search.toLowerCase().trim();
    return lessons.filter((lesson) => {
      const title = (lesson.rule?.title || lesson.title || '').toLowerCase();
      const matchesSearch = !q || title.includes(q);
      const matchesStatus =
        !filterStatus ||
        lesson.status?.toUpperCase() === filterStatus.toUpperCase();
      return matchesSearch && matchesStatus;
    });
  }, [lessons, search, filterStatus]);

  return {
    lessons,
    displayedLessons,
    loading,
    search,
    setSearch,
    filterStatus,
    setFilterStatus,
    deleteLesson,
  };
}
