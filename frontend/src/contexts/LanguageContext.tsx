import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';
import { LanguageOption } from '../types';

export const LANGUAGES: LanguageOption[] = [
  { name: 'Arabic', voiceCode: 'ar-SA', tier: 2 },
  { name: 'Chinese (Mandarin)', voiceCode: 'zh-CN', tier: 1 },
  { name: 'Czech', voiceCode: 'cs-CZ', tier: 3 },
  { name: 'Danish', voiceCode: 'da-DK', tier: 3 },
  { name: 'Dutch', voiceCode: 'nl-NL', tier: 1 },
  { name: 'English', voiceCode: 'en-US', tier: 1 },
  { name: 'French', voiceCode: 'fr-FR', tier: 1 },
  { name: 'German', voiceCode: 'de-DE', tier: 1 },
  { name: 'Greek', voiceCode: 'el-GR', tier: 3 },
  { name: 'Hindi', voiceCode: 'hi-IN', tier: 2 },
  { name: 'Hungarian', voiceCode: 'hu-HU', tier: 3 },
  { name: 'Indonesian', voiceCode: 'id-ID', tier: 2 },
  { name: 'Italian', voiceCode: 'it-IT', tier: 1 },
  { name: 'Japanese', voiceCode: 'ja-JP', tier: 1 },
  { name: 'Korean', voiceCode: 'ko-KR', tier: 2 },
  { name: 'Persian', voiceCode: 'fa-IR', tier: 3 },
  { name: 'Polish', voiceCode: 'pl-PL', tier: 2 },
  { name: 'Portuguese', voiceCode: 'pt-PT', tier: 1 },
  { name: 'Romanian', voiceCode: 'ro-RO', tier: 3 },
  { name: 'Russian', voiceCode: 'ru-RU', tier: 2 },
  { name: 'Spanish', voiceCode: 'es-ES', tier: 1 },
  { name: 'Swedish', voiceCode: 'sv-SE', tier: 3 },
  { name: 'Thai', voiceCode: 'th-TH', tier: 3 },
  { name: 'Turkish', voiceCode: 'tr-TR', tier: 2 },
  { name: 'Ukrainian', voiceCode: 'uk-UA', tier: 3 },
  { name: 'Vietnamese', voiceCode: 'vi-VN', tier: 2 },
];

export const getLanguageVoiceCode = (languageName: string): string => {
  const match = LANGUAGES.find((l) => l.name.toLowerCase() === languageName.toLowerCase());
  return match?.voiceCode || 'en-US';
};

export interface LanguageContextType {
  nativeLanguage: string;
  targetLanguage: string;
  nativeVoiceCode: string;
  targetVoiceCode: string;
  languages: LanguageOption[];
  getVoiceCode: (languageName: string) => string;
  loading: boolean;
  refreshLanguages: () => Promise<void>;
}

const LanguageContext = createContext<LanguageContextType>({
  nativeLanguage: 'English',
  targetLanguage: 'Korean',
  nativeVoiceCode: 'en-US',
  targetVoiceCode: 'ko-KR',
  languages: LANGUAGES,
  getVoiceCode: getLanguageVoiceCode,
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

  const nativeVoiceCode = useMemo(() => getLanguageVoiceCode(nativeLanguage), [nativeLanguage]);
  const targetVoiceCode = useMemo(() => getLanguageVoiceCode(targetLanguage), [targetLanguage]);

  return (
    <LanguageContext.Provider
      value={{
        nativeLanguage,
        targetLanguage,
        nativeVoiceCode,
        targetVoiceCode,
        languages: LANGUAGES,
        getVoiceCode: getLanguageVoiceCode,
        loading,
        refreshLanguages,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};
