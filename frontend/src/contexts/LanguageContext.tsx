import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

interface LanguageContextType {
  nativeLanguage: string;
  targetLanguage: string;
  loading: boolean;
  refreshLanguages: () => Promise<void>;
}

const LanguageContext = createContext<LanguageContextType>({
  nativeLanguage: 'English',
  targetLanguage: 'Korean',
  loading: true,
  refreshLanguages: async () => {},
});

export const useLanguages = () => useContext(LanguageContext);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [nativeLanguage, setNativeLanguage] = useState('English');
  const [targetLanguage, setTargetLanguage] = useState('Korean');
  const [loading, setLoading] = useState(true);

  const refreshLanguages = useCallback(async () => {
    try {
      const data = await api.getSettings();
      setNativeLanguage(data.NATIVE_LANGUAGE || 'English');
      setTargetLanguage(data.TARGET_LANGUAGE || 'Korean');
    } catch {
      // Use defaults if settings can't be loaded
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      refreshLanguages();
    } else {
      setLoading(false);
    }
  }, [user, refreshLanguages]);

  return (
    <LanguageContext.Provider value={{ nativeLanguage, targetLanguage, loading, refreshLanguages }}>
      {children}
    </LanguageContext.Provider>
  );
};
