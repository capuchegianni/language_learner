import React from 'react';
import './LanguageSection.css';
import { Card, Select } from '../../../../components';
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
    <Card className="settings-card" id="tutorial-language-prefs">
      <h3 className="settings-section-title">
        <IconGlobe size={20} />
        <span>Language Preferences</span>
      </h3>
      <p className="settings-section-desc">
        Select your native language and the language you want to learn.
      </p>

      <div className="settings-language-grid">
        <Select
          id="native-language-select"
          label="Native Language"
          value={nativeLanguage}
          onChange={(e) => onUpdateField('nativeLanguage', e.target.value)}
          options={languages.map((lang) => ({ value: lang.name, label: lang.name }))}
        />

        <Select
          id="target-language-select"
          label="Target Language"
          value={targetLanguage}
          onChange={(e) => onUpdateField('targetLanguage', e.target.value)}
          options={languages
            .filter((lang) => lang.name !== nativeLanguage)
            .map((lang) => ({ value: lang.name, label: lang.name }))}
        />
      </div>

      {nativeLanguage === targetLanguage && (
        <div className="settings-language-error">
          <IconHazardAlert size={16} />
          <span>Native and target languages cannot be the same.</span>
        </div>
      )}
    </Card>
  );
};
