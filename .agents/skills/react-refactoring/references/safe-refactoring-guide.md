# Mega-Component Decomposition Playbook

This reference provides a concrete walkthrough for decomposing monolithic React page files (e.g. 500–1,000+ lines like `Settings.tsx`) into modular, maintainable structures.

---

## 1. Concrete Case Study: Decomposing a 1,000-Line Settings Page

### Before: Monolithic File (`src/pages/Settings.tsx`)
```
src/pages/Settings.tsx (1,100 lines)
  - Contains:
    * Global tab state & form inputs
    * AI provider settings state & test connection logic
    * Backup / Export / Import JSON parsing
    * Data Reset dangerous confirmation modals
    * Account deletion modal & flows
    * 50+ inline `style={{ ... }}` objects
```

### Target Structure: Feature Folder (`src/pages/Settings/`)
```
src/pages/Settings/
├── components/
│   ├── AiConfigSection.tsx       # AI provider settings (~120 lines)
│   ├── GeneralSettingsSection.tsx# Language pair & preferences (~90 lines)
│   ├── DataManagementSection.tsx # Export, import & reset (~140 lines)
│   ├── AccountSection.tsx        # Profile & account deletion (~80 lines)
│   └── ConfirmActionModal.tsx    # Reusable dangerous action modal (~60 lines)
├── hooks/
│   ├── useSettingsForm.ts        # Settings form state & persistence hook
│   └── useSettingsMutation.ts    # TanStack Query save/test mutations
├── Settings.css                  # Local styles eliminating inline styles
├── types.ts                      # Local SettingsTab enum & form types
└── index.tsx                     # Clean orchestrator (~80 lines)
```

---

## 2. Refactoring Code Patterns

### 1. Extracting the Orchestrator (`index.tsx`)
```tsx
import React, { useState } from 'react';
import { useSettingsForm } from './hooks/useSettingsForm';
import { AiConfigSection } from './components/AiConfigSection';
import { GeneralSettingsSection } from './components/GeneralSettingsSection';
import { DataManagementSection } from './components/DataManagementSection';
import { AccountSection } from './components/AccountSection';
import { SettingsTab } from './types';
import './Settings.css';

export const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>(SettingsTab.AI_CONFIG);
  const { settings, isSaving, saveSettings, testAiConnection } = useSettingsForm();

  return (
    <div className="settings-page-container">
      <header className="settings-header">
        <h1>Settings</h1>
      </header>

      <nav className="settings-tabs-nav">
        {/* Tab buttons */}
      </nav>

      <main className="settings-content">
        {activeTab === SettingsTab.AI_CONFIG && (
          <AiConfigSection
            settings={settings}
            onSave={saveSettings}
            onTest={testAiConnection}
            isSaving={isSaving}
          />
        )}
        {/* Other tabs */}
      </main>
    </div>
  );
};

export default SettingsPage;
```

---

## 3. Post-Refactoring Sanity Checks

Always run these verifications after decomposing any component:
1. **Compilation**: `pnpm --filter language-learner-frontend exec tsc --noEmit`
2. **Build**: `pnpm --filter language-learner-frontend build`
3. **Route Verification**: Ensure router definitions in `App.tsx` point to the new `index.tsx` entry seamlessly.
4. **CSS Verification**: Confirm no visual layout shifts or broken styles occurred.
