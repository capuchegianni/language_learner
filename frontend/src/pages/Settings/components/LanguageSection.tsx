import React from 'react';
import { Globe } from 'lucide-react';
import { useLanguages } from '../../../contexts/LanguageContext';
import { SettingsFormData } from '../types';

export interface LanguageSectionProps {
  nativeLanguage: string;
  targetLanguage: string;
  onUpdateField: <K extends keyof SettingsFormData>(field: K, value: SettingsFormData[K]) => void;
}

export const LanguageSection: React.FC<LanguageSectionProps> = ({
  nativeLanguage,
  targetLanguage,
  onUpdateField,
}) => {
  const { languages } = useLanguages();

  return (
    <div className="glass-card" id="tutorial-language-prefs">
      <h3 className="settings-section-title language-title">
        <Globe size={20} />
        <span>Language Preferences</span>
      </h3>
      <p className="settings-section-desc">
        Choose your native language and the language you want to learn. All AI-generated lessons, exercises, and feedback will adapt to your selection.
      </p>

      <div className="settings-language-grid">
        <div className="input-group">
          <label htmlFor="native-language-select">I speak (native language)</label>
          <select
            value={nativeLanguage}
            onChange={(e) => onUpdateField('nativeLanguage', e.target.value)}
            id="native-language-select"
          >
            {languages.map((lang) => (
              <option key={`native-${lang.name}`} value={lang.name}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>
        <div className="input-group">
          <label htmlFor="target-language-select">I want to learn</label>
          <select
            value={targetLanguage}
            onChange={(e) => onUpdateField('targetLanguage', e.target.value)}
            id="target-language-select"
          >
            {languages
              .filter((lang) => lang.name !== nativeLanguage)
              .map((lang) => (
                <option key={`target-${lang.name}`} value={lang.name}>
                  {lang.name}
                </option>
              ))}
          </select>
        </div>
      </div>

      {nativeLanguage === targetLanguage && (
        <div className="settings-language-error">
          ⚠️ Native and target languages cannot be the same.
        </div>
      )}
    </div>
  );
};
