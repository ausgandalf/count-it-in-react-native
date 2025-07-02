// context/SongsContext.tsx
import { Settings, SettingsType } from '@/constants/Settings';
import React, { createContext, useContext, useState } from 'react';
const SettingsContext = createContext<{ settings: SettingsType, setSettings: (settings: SettingsType) => void } | null>(null);

export const SettingsProvider = ({ children }: { children: React.ReactNode }) => {
  const [settings, setSettings] = useState(Settings);
  return (
    <SettingsContext.Provider value={{ settings, setSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};
