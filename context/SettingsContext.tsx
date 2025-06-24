// context/SongsContext.tsx
import { Settings } from '@/constants/Settings';
import React, { createContext, useContext, useState } from 'react';
const SettingsContext = createContext(null);

export const SettingsProvider = ({ children }: { children: React.ReactNode }) => {
  const [settings, setSettings] = useState(Settings);
  return (
    <SettingsContext.Provider value={{ settings, setSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
