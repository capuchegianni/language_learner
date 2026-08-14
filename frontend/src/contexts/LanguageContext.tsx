import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';
import { LanguageOption } from '../types';

export const LANGUAGES: LanguageOption[] = [
  { name: 'Afrikaans', voiceCode: 'af-ZA' },
  { name: 'Albanian', voiceCode: 'sq-AL' },
  { name: 'Amharic', voiceCode: 'am-ET' },
  { name: 'Arabic', voiceCode: 'ar-SA' },
  { name: 'Armenian', voiceCode: 'hy-AM' },
  { name: 'Azerbaijani', voiceCode: 'az-AZ' },
  { name: 'Basque', voiceCode: 'eu-ES' },
  { name: 'Belarusian', voiceCode: 'be-BY' },
  { name: 'Bengali', voiceCode: 'bn-IN' },
  { name: 'Bosnian', voiceCode: 'bs-BA' },
  { name: 'Bulgarian', voiceCode: 'bg-BG' },
  { name: 'Burmese', voiceCode: 'my-MM' },
  { name: 'Catalan', voiceCode: 'ca-ES' },
  { name: 'Cebuano', voiceCode: 'ceb-PH' },
  { name: 'Chinese (Mandarin)', voiceCode: 'zh-CN' },
  { name: 'Chinese (Cantonese)', voiceCode: 'zh-HK' },
  { name: 'Croatian', voiceCode: 'hr-HR' },
  { name: 'Czech', voiceCode: 'cs-CZ' },
  { name: 'Danish', voiceCode: 'da-DK' },
  { name: 'Dutch', voiceCode: 'nl-NL' },
  { name: 'English', voiceCode: 'en-US' },
  { name: 'Esperanto', voiceCode: 'eo' },
  { name: 'Estonian', voiceCode: 'et-EE' },
  { name: 'Filipino', voiceCode: 'fil-PH' },
  { name: 'Finnish', voiceCode: 'fi-FI' },
  { name: 'French', voiceCode: 'fr-FR' },
  { name: 'Galician', voiceCode: 'gl-ES' },
  { name: 'Georgian', voiceCode: 'ka-GE' },
  { name: 'German', voiceCode: 'de-DE' },
  { name: 'Greek', voiceCode: 'el-GR' },
  { name: 'Gujarati', voiceCode: 'gu-IN' },
  { name: 'Haitian Creole', voiceCode: 'ht-HT' },
  { name: 'Hausa', voiceCode: 'ha-NG' },
  { name: 'Hawaiian', voiceCode: 'haw-US' },
  { name: 'Hebrew', voiceCode: 'he-IL' },
  { name: 'Hindi', voiceCode: 'hi-IN' },
  { name: 'Hmong', voiceCode: 'hmn' },
  { name: 'Hungarian', voiceCode: 'hu-HU' },
  { name: 'Icelandic', voiceCode: 'is-IS' },
  { name: 'Igbo', voiceCode: 'ig-NG' },
  { name: 'Indonesian', voiceCode: 'id-ID' },
  { name: 'Irish', voiceCode: 'ga-IE' },
  { name: 'Italian', voiceCode: 'it-IT' },
  { name: 'Japanese', voiceCode: 'ja-JP' },
  { name: 'Javanese', voiceCode: 'jv-ID' },
  { name: 'Kannada', voiceCode: 'kn-IN' },
  { name: 'Kazakh', voiceCode: 'kk-KZ' },
  { name: 'Khmer', voiceCode: 'km-KH' },
  { name: 'Kinyarwanda', voiceCode: 'rw-RW' },
  { name: 'Korean', voiceCode: 'ko-KR' },
  { name: 'Kurdish', voiceCode: 'ku' },
  { name: 'Kyrgyz', voiceCode: 'ky-KG' },
  { name: 'Lao', voiceCode: 'lo-LA' },
  { name: 'Latin', voiceCode: 'la' },
  { name: 'Latvian', voiceCode: 'lv-LV' },
  { name: 'Lithuanian', voiceCode: 'lt-LT' },
  { name: 'Luxembourgish', voiceCode: 'lb-LU' },
  { name: 'Macedonian', voiceCode: 'mk-MK' },
  { name: 'Malagasy', voiceCode: 'mg-MG' },
  { name: 'Malay', voiceCode: 'ms-MY' },
  { name: 'Malayalam', voiceCode: 'ml-IN' },
  { name: 'Maltese', voiceCode: 'mt-MT' },
  { name: 'Maori', voiceCode: 'mi-NZ' },
  { name: 'Marathi', voiceCode: 'mr-IN' },
  { name: 'Mongolian', voiceCode: 'mn-MN' },
  { name: 'Nepali', voiceCode: 'ne-NP' },
  { name: 'Norwegian', voiceCode: 'nb-NO' },
  { name: 'Odia', voiceCode: 'or-IN' },
  { name: 'Oromo', voiceCode: 'om-ET' },
  { name: 'Pashto', voiceCode: 'ps-AF' },
  { name: 'Persian', voiceCode: 'fa-IR' },
  { name: 'Polish', voiceCode: 'pl-PL' },
  { name: 'Portuguese', voiceCode: 'pt-PT' },
  { name: 'Punjabi', voiceCode: 'pa-IN' },
  { name: 'Quechua', voiceCode: 'qu-PE' },
  { name: 'Romanian', voiceCode: 'ro-RO' },
  { name: 'Russian', voiceCode: 'ru-RU' },
  { name: 'Samoan', voiceCode: 'sm-WS' },
  { name: 'Scottish Gaelic', voiceCode: 'gd-GB' },
  { name: 'Serbian', voiceCode: 'sr-RS' },
  { name: 'Shona', voiceCode: 'sn-ZW' },
  { name: 'Sindhi', voiceCode: 'sd-PK' },
  { name: 'Sinhala', voiceCode: 'si-LK' },
  { name: 'Slovak', voiceCode: 'sk-SK' },
  { name: 'Slovenian', voiceCode: 'sl-SI' },
  { name: 'Somali', voiceCode: 'so-SO' },
  { name: 'Spanish', voiceCode: 'es-ES' },
  { name: 'Sundanese', voiceCode: 'su-ID' },
  { name: 'Swahili', voiceCode: 'sw-KE' },
  { name: 'Swedish', voiceCode: 'sv-SE' },
  { name: 'Tajik', voiceCode: 'tg-TJ' },
  { name: 'Tamil', voiceCode: 'ta-IN' },
  { name: 'Tatar', voiceCode: 'tt-RU' },
  { name: 'Telugu', voiceCode: 'te-IN' },
  { name: 'Thai', voiceCode: 'th-TH' },
  { name: 'Tibetan', voiceCode: 'bo-CN' },
  { name: 'Tigrinya', voiceCode: 'ti-ET' },
  { name: 'Turkish', voiceCode: 'tr-TR' },
  { name: 'Turkmen', voiceCode: 'tk-TM' },
  { name: 'Ukrainian', voiceCode: 'uk-UA' },
  { name: 'Urdu', voiceCode: 'ur-PK' },
  { name: 'Uyghur', voiceCode: 'ug-CN' },
  { name: 'Uzbek', voiceCode: 'uz-UZ' },
  { name: 'Vietnamese', voiceCode: 'vi-VN' },
  { name: 'Welsh', voiceCode: 'cy-GB' },
  { name: 'Xhosa', voiceCode: 'xh-ZA' },
  { name: 'Yiddish', voiceCode: 'yi' },
  { name: 'Yoruba', voiceCode: 'yo-NG' },
  { name: 'Zulu', voiceCode: 'zu-ZA' },
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
