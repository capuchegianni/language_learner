import React from 'react';
import './ProviderPresetsSection.css';
import { Card, Button } from '../../../../components';
import { IconLinotypeMatrix } from '../../../../components/icons';
import { ProviderPreset, PROVIDER_PRESETS } from '../../types';

export interface ProviderPresetsSectionProps {
  selectedPreset: ProviderPreset;
  onSelectPreset: (preset: ProviderPreset) => void;
}

export const ProviderPresetsSection: React.FC<ProviderPresetsSectionProps> = ({
  selectedPreset,
  onSelectPreset,
}) => {
  return (
    <Card id="tutorial-provider-presets">
      <h3 className="settings-section-title">
        <IconLinotypeMatrix size={20} />
        <span>Provider Presets</span>
      </h3>
      <p className="settings-section-desc">
        Select a preset to autofill the base URL and a suggested model, or configure them manually below.
      </p>
      <div className="settings-presets-grid">
        {PROVIDER_PRESETS.map((preset) => {
          const isSelected = selectedPreset.name === preset.name;
          return (
            <Button
              key={preset.name}
              type="button"
              active={isSelected}
              onClick={() => onSelectPreset(preset)}
              className={`preset-chip ${isSelected ? 'active' : 'inactive'}`}
            >
              {preset.name}
            </Button>
          );
        })}
      </div>
    </Card>
  );
};
