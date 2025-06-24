// context/SongsContext.tsx
import { Songs } from '@/constants/Songs';
import { SongType } from '@/constants/Types';
import React, { createContext, useContext, useState } from 'react';
const SongsContext = createContext(null);

export const SongsProvider = ({ children }: { children: React.ReactNode }) => {
  const [songs, setSongs] = useState<SongType[]>(Songs);
  return (
    <SongsContext.Provider value={{ songs, setSongs }}>
      {children}
    </SongsContext.Provider>
  );
};

export const useSongs = () => useContext(SongsContext);
