import { Settings } from "@/constants/Settings";
import { SongType } from "@/constants/Types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { delay } from "./common";

export function isSongExists(list:SongType[], song:SongType) {
  for (let i=0; i<list.length; i++) {
    if (list[i].name == song.name && list[i].artist == song.artist) {
      return true;
    }
  }
  return false;
}

export function generateSongID(song: SongType, type: 'core'|'custom') {
  return `${type}-${song.name}-${song.artist}`
}

export async function loadSongs(songs: any[]):Promise<{songs: SongType[], updates:{}}> {
  const songList:SongType[] = [];
  
  const coreUpdates = await AsyncStorage.getItem('coreUpdates');
  const overrideList = coreUpdates ? JSON.parse(coreUpdates) : {};

  songs.forEach((song: SongType) => {
    // Use saved BPM if it exists, otherwise use original BPM
    const songId = generateSongID(song, 'core');
    const savedBpm = overrideList[songId] ? overrideList[songId]['bpm'] : undefined;
    if (overrideList[songId] && overrideList[songId]['name']) song.name = overrideList[songId]['name'];
    if (overrideList[songId] && overrideList[songId]['artist']) song.artist = overrideList[songId]['artist'];

    songList.push({ 
      ...song, 
      bpm: savedBpm !== undefined ? savedBpm : song.bpm,
      id: songId 
    });
  });

  const customSongs = await AsyncStorage.getItem('customSongs');
  const customList:SongType[] = customSongs ? JSON.parse(customSongs) : [];

  customList.forEach(song => {
    if (!isSongExists(songList, song)) {
      if (!song.label) song.label = song.name.charAt(0).toUpperCase();
      songList.push({ 
        ...song, 
        id: generateSongID(song, 'custom'),
        isCustom: true 
      });
    }
  });

  return {songs: songList, updates: overrideList};
}

export const importSongs = async (songs: SongType[], onProgress: (statusCode: number, progress: number, text: string, result?: any) => void, settings: any) => {
  if (!settings.url) {
    onProgress(4, 0, 'Please enter a URL');
    return;
  }
  onProgress(1, 0, 'Accessing URL...');
  fetch(settings.url) // Replace with your actual URL
  .then((res) => {
    if (!res.ok) {
      onProgress(5, 0, 'Failed to load songs from ' + settings.url);
      return;
    }
    return res.json(); // Auto-parses JSON
  })
  .then(async (json) => {
    // Clone the existing songs and add the new songs
    let newSongs:SongType[] = [];
    let newlyAddedSongsCount = 0;
    newSongs = structuredClone(songs);
    for (let i=0; i<json.length; i++) {
      await delay(10);
      onProgress(2, (i + 1) / json.length, 'Importing songs... ' + (i+1) + ' of ' + json.length);
      const song = json[i];
      if (!song.label) song.label = song.name.charAt(0).toUpperCase();
      song.id = generateSongID(song, 'custom');
      if (!isSongExists(songs, song)) {
        newSongs.push(song);
        newlyAddedSongsCount++;
      }
    }
    onProgress(3, 1, 'Found ' + json.length + ' song(s). Imported ' + newlyAddedSongsCount + ', skipping duplicates.', newSongs);
  })
  .catch((error) => {
    onProgress(4, 0, 'Failed to load songs from ' + settings.url);
    console.error('Error fetching JSON:', error);
  });
}

export const saveSettings = async (settings:{}) => {
  try {
    await AsyncStorage.setItem('settings', JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings:', e);
  }
};

export async function loadSettings():Promise<{settings:{}}> {
  
  const settingsStored = await AsyncStorage.getItem('settings');
  const settings = settingsStored ? JSON.parse(settingsStored) : {};
  return {settings: {...Settings, ...settings}};
}
