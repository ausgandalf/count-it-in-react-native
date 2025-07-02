// context/SongsContext.tsx
import { Songs } from '@/constants/Songs';
import { SongType } from '@/constants/Types';
import React, { createContext, useContext, useState } from 'react';
const SongsContext = createContext<{ songs: SongType[]|null, setSongs: (songs: SongType[]) => void } | null>(null);

export const SongsProvider = ({ children }: { children: React.ReactNode }) => {
  const [songs, setSongs] = useState<SongType[]|null>(Songs);
  return (
    <SongsContext.Provider value={{ songs, setSongs }}>
      {children}
    </SongsContext.Provider>
  );
};

export const useSongs = () => {
  const context = useContext(SongsContext);
  if (!context) {
    throw new Error("useSongs must be used within a SongsProvider");
  }
  return context;
};
