import React, { useState, useRef, useEffect } from 'react';
import './LanguageSection.css';
import { Card, Select } from '../../../../components';
import { IconGlobe, IconHazardAlert, IconInfoNotice } from '../../../../components/icons';
import { useLanguages } from '../../../../contexts/LanguageContext';
import { SettingsFormData } from '../../types';
import { IconButton } from '../../../../components';

export interface LanguageSectionProps {
  nativeLanguage: string;
  targetLanguage: string;
  onUpdateField: <K extends keyof SettingsFormData>(field: K, value: SettingsFormData[K]) => void;
}

interface Tier {
  label: string;
  text: string;
  className: string;
}

const TIER_INFO: Record<2 | 3, Tier> = {
  2: {
    label: 'AI Support',
    text: 'Data and AI training resources may be of slightly lesser quality or depth than vastly used languages. Complex grammar nuances might occasionally vary.',
    className: 'lang-floating-tier2',
  },
  3: {
    label: 'Limited AI Data',
    text: 'Limited AI training data online. Lesson generation and complex reasoning quality may vary more noticeably than for vastly used languages.',
    className: 'lang-floating-tier3',
  },
};

interface QualityTooltipProps {
  tier: 2 | 3;
}

const QualityTooltip: React.FC<QualityTooltipProps> = ({ tier }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const info = TIER_INFO[tier];

  const isTouchActive = useRef(false);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('touchstart', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [isOpen]);

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    isTouchActive.current = true;
    setIsOpen((prev) => !prev);
    // Reset after simulated mouse/click event loop passes
    setTimeout(() => {
      isTouchActive.current = false;
    }, 400);
  };

  return (
    <div
      ref={containerRef}
      className="lang-info-container"
      onMouseEnter={() => {
        if (!isTouchActive.current) {
          setIsOpen(true);
        }
      }}
      onMouseLeave={() => {
        if (!isTouchActive.current) {
          setIsOpen(false);
        }
      }}
    >
      <IconButton
        variant="empty"
        size="null"
        className={info.className}
        onTouchEnd={handleTouchEnd}
        onClick={(e) => {
          if (isTouchActive.current) {
            e.preventDefault();
            e.stopPropagation();
            return;
          }
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        aria-label="Language AI support information"
        icon={<IconInfoNotice size={14} />}
      />

      {isOpen && (
        <Card
          padding="sm"
          className={`lang-floating-card ${info.className}`}
          role="tooltip"
        >
          <div className="lang-floating-header">
            <IconHazardAlert size={16} />
            <span>{info.label}</span>
          </div>
          <p className="lang-floating-body">{info.text}</p>
        </Card>
      )}
    </div>
  );
};

export const LanguageSection: React.FC<LanguageSectionProps> = ({
  nativeLanguage,
  targetLanguage,
  onUpdateField,
}) => {
  const { languages } = useLanguages();

  const nativeTier = languages.find((l) => l.name === nativeLanguage)?.tier;
  const targetTier = languages.find((l) => l.name === targetLanguage)?.tier;

  const renderLabel = (text: string, tier?: 1 | 2 | 3) => (
    <span className="lang-label-with-info">
      <span>{text}</span>
      {tier && (tier === 2 || tier === 3) && <QualityTooltip tier={tier} />}
    </span>
  );

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
        <div className="settings-language-col">
          <Select
            label={renderLabel('Native Language', nativeTier)}
            value={nativeLanguage}
            onChange={(e) => onUpdateField('nativeLanguage', e.target.value)}
            options={languages.map((lang) => ({ value: lang.name, label: lang.name }))}
          />
        </div>

        <div className="settings-language-col">
          <Select
            label={renderLabel('Target Language', targetTier)}
            value={targetLanguage}
            onChange={(e) => onUpdateField('targetLanguage', e.target.value)}
            options={languages
              .filter((lang) => lang.name !== nativeLanguage)
              .map((lang) => ({ value: lang.name, label: lang.name }))}
          />
        </div>
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
