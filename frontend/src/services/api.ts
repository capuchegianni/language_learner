import axios from 'axios';
import {
  DashboardStats,
  Lesson,
  ProposedRule,
  Rule,
  Settings,
  SettingsUpdatePayload,
  Word,
} from '../types';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL?.replace(/\/+$/, '') || '';

export const API_BASE = import.meta.env.DEV
  ? '/api'
  : `${BACKEND_URL}/api`;

// Ensure cookies are sent with every request (needed for session auth)
axios.defaults.withCredentials = true;


export const api = {
  // Stats
  async getDashboardStats(): Promise<DashboardStats> {
    const res = await axios.get(`${API_BASE}/lessons/stats`);
    return res.data;
  },

  // Rule Proposals
  async getRuleProposals(count?: number, excludeTitles?: string[]): Promise<{
    proposedNewRules: ProposedRule[];
    reviewRuleOption: { id: string; title: string; explanation: string } | null;
    totalKnownWords: number;
    totalKnownRules: number;
  }> {
    const params = new URLSearchParams();
    if (count !== undefined) params.append('count', count.toString());
    if (excludeTitles && excludeTitles.length > 0) params.append('exclude', excludeTitles.join(','));
    const res = await axios.get(`${API_BASE}/lessons/propose-rules?${params.toString()}`);
    return res.data;
  },

  // Lesson Generation
  async generateLesson(dto: {
    ruleTitle: string;
    wordsCount?: number;
    isReview?: boolean;
  }): Promise<Lesson> {
    const res = await axios.post(`${API_BASE}/lessons/generate`, dto);
    return res.data;
  },

  // Exercise Submission with Text or Handwritten Images
  async submitLesson(
    lessonId: string,
    answers: { ex1?: string; ex2?: string; ex3?: string },
    imageFiles?: File[] | null,
  ): Promise<Lesson> {
    const formData = new FormData();
    if (answers.ex1) formData.append('ex1', answers.ex1);
    if (answers.ex2) formData.append('ex2', answers.ex2);
    if (answers.ex3) formData.append('ex3', answers.ex3);

    if (imageFiles && imageFiles.length > 0) {
      imageFiles.forEach(file => {
        formData.append('images', file);
      });
    }

    const res = await axios.post(`${API_BASE}/lessons/${lessonId}/submit`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  // Lessons History
  async getLessons(): Promise<Lesson[]> {
    const res = await axios.get(`${API_BASE}/lessons`);
    return res.data;
  },

  async getLessonById(id: string): Promise<Lesson> {
    const res = await axios.get(`${API_BASE}/lessons/${id}`);
    return res.data;
  },

  async deleteLesson(id: string): Promise<void> {
    await axios.delete(`${API_BASE}/lessons/${id}`);
  },

  // Vocabulary Bank
  async getWords(query?: string): Promise<Word[]> {
    const res = await axios.get(`${API_BASE}/vocabulary`, {
      params: { q: query },
    });
    return res.data;
  },

  async createWord(data: Omit<Word, 'id' | 'createdAt'>): Promise<Word> {
    const res = await axios.post(`${API_BASE}/vocabulary`, data);
    return res.data;
  },

  async updateWord(id: string, data: Partial<Word>): Promise<Word> {
    const res = await axios.put(`${API_BASE}/vocabulary/${id}`, data);
    return res.data;
  },

  async deleteWord(id: string): Promise<void> {
    await axios.delete(`${API_BASE}/vocabulary/${id}`);
  },

  // Rule Bank
  async getRules(query?: string): Promise<Rule[]> {
    const res = await axios.get(`${API_BASE}/rules`, {
      params: { q: query },
    });
    return res.data;
  },

  async createRule(data: Omit<Rule, 'id' | 'createdAt'>): Promise<Rule> {
    const res = await axios.post(`${API_BASE}/rules`, data);
    return res.data;
  },

  async updateRule(id: string, data: Partial<Rule>): Promise<Rule> {
    const res = await axios.put(`${API_BASE}/rules/${id}`, data);
    return res.data;
  },

  async deleteRule(id: string): Promise<void> {
    await axios.delete(`${API_BASE}/rules/${id}`);
  },

  // Settings
  async getSettings(): Promise<Settings> {
    const res = await axios.get(`${API_BASE}/settings`);
    return res.data;
  },

  async updateSettings(settings: SettingsUpdatePayload): Promise<Settings> {
    const res = await axios.post(`${API_BASE}/settings`, settings);
    return res.data;
  },

  async importData(data: any): Promise<void> {
    const res = await axios.post(`${API_BASE}/settings/import`, data);
    return res.data;
  },

  async exportData(include: { settings?: boolean; words?: boolean; rules?: boolean; lessons?: boolean }): Promise<any> {
    const params = new URLSearchParams();
    if (include.settings) params.set('settings', 'true');
    if (include.words) params.set('words', 'true');
    if (include.rules) params.set('rules', 'true');
    if (include.lessons) params.set('lessons', 'true');
    const res = await axios.get(`${API_BASE}/settings/export?${params.toString()}`);
    return res.data;
  },

  async resetData(include: { settings?: boolean; words?: boolean; rules?: boolean; lessons?: boolean }): Promise<{ success: boolean; message: string; resetItems: string[] }> {
    const res = await axios.post(`${API_BASE}/settings/reset`, include);
    return res.data;
  },

  async deleteAccount(): Promise<{ success: boolean; message: string }> {
    const res = await axios.delete(`${API_BASE}/auth/account`);
    return res.data;
  },
};


