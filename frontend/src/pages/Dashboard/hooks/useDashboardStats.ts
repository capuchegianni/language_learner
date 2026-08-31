import { useState, useEffect, useCallback } from 'react';
import { api } from '../../../services/api';
import { DashboardStats } from '../../../types';

export interface UseDashboardStatsReturn {
  stats: DashboardStats | null;
  loading: boolean;
  loadStats: () => Promise<void>;
  deleteLesson: (e: React.MouseEvent, id: string) => Promise<void>;
}

export function useDashboardStats(): UseDashboardStatsReturn {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getDashboardStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const deleteLesson = useCallback(
    async (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      if (window.confirm('Are you sure you want to delete this lesson from history?')) {
        try {
          await api.deleteLesson(id);
          await loadStats();
        } catch (err) {
          console.error('Failed to delete lesson', err);
        }
      }
    },
    [loadStats],
  );

  return {
    stats,
    loading,
    loadStats,
    deleteLesson,
  };
}
