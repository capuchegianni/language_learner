import React from 'react';
import { Cpu } from 'lucide-react';
import { ProviderPreset, PROVIDER_PRESETS } from '../types';

export interface ProviderPresetsSectionProps {
  selectedPreset: ProviderPreset;
  onSelectPreset: (preset: ProviderPreset) => void;
}

export const ProviderPresetsSection: React.FC<ProviderPresetsSectionProps> = ({
  selectedPreset,
  onSelectPreset,
}) => {
  return (
    <div className="glass-card" id="tutorial-provider-presets">
      <h3 className="settings-section-title presets-title">
        <Cpu size={20} />
        <span>Provider Presets</span>
      </h3>
      <p className="settings-section-desc">
        Select a preset to autofill the base URL and a suggested model, or configure them manually below.
      </p>
      <div className="settings-presets-grid">
        {PROVIDER_PRESETS.map((preset) => {
          const isSelected = selectedPreset.name === preset.name;
          return (
            <button
              key={preset.name}
              type="button"
              onClick={() => onSelectPreset(preset)}
              className={`btn preset-chip ${isSelected ? 'active' : 'inactive'}`}
            >
              {preset.name}
            </button>
          );
        })}
      </div>
    </div>
  );
};
