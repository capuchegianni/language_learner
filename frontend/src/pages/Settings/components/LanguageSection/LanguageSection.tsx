import React from 'react';
import './LanguageSection.css';
import { IconGlobe, IconHazardAlert } from '../../../../components/icons';
import { useLanguages } from '../../../../contexts/LanguageContext';
import { SettingsFormData } from '../../types';

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
    <div className="card settings-card" id="tutorial-language-prefs">
      <h3 className="settings-section-title language-title">
        <IconGlobe size={20} />
        <span>Language Preferences</span>
      </h3>
      <p className="settings-section-desc">
        Select your native language and the language you want to learn.
      </p>

      <div className="settings-language-grid">
        <div className="input-group">
          <label htmlFor="native-language-select">Native Language</label>
          <select
            id="native-language-select"
            value={nativeLanguage}
            onChange={(e) => onUpdateField('nativeLanguage', e.target.value)}
          >
            {languages.map((lang) => (
              <option key={`native-${lang.name}`} value={lang.name}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>

        <div className="input-group">
          <label htmlFor="target-language-select">Target Language</label>
          <select
            id="target-language-select"
            value={targetLanguage}
            onChange={(e) => onUpdateField('targetLanguage', e.target.value)}
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
          <IconHazardAlert size={16} />
          <span>Native and target languages cannot be the same.</span>
        </div>
      )}
    </div>
  );
};
