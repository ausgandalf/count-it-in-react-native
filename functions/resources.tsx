import { Settings } from "@/constants/Settings";
import { SongType } from "@/constants/Types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from '@react-native-community/netinfo';
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

export const checkNetworkConnection = async () => {
  const state = await NetInfo.fetch();
  return state.isConnected && state.isInternetReachable;
};

export const importSongs = async (songs: SongType[], onProgress: (statusCode: number, progress: number, text: string, result?: any) => void, settings: any) => {
  if (!settings.url) {
    onProgress(4, 0, 'Please enter a URL');
    return;
  }
  
  // Check network connection first
  const isConnected = await checkNetworkConnection();
  if (!isConnected) {
    onProgress(4, 0, 'No internet connection. Please check your network settings.');
    return;
  }
  
  onProgress(1, 0, 'Accessing URL...');
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    const response = await fetch(settings.url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const json = await response.json();
    
    // Clone the existing songs and add the new songs
    let newSongs:SongType[] = JSON.parse(JSON.stringify(songs)); // React Native compatible deep clone
    let newlyAddedSongsCount = 0;
    
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
  } catch (error: any) {
    console.error('Network error:', error);
    if (error.name === 'AbortError') {
      onProgress(4, 0, 'Request timed out. Please check your internet connection.');
    } else if (error.message.includes('Network request failed')) {
      onProgress(4, 0, 'Network error. Please check your internet connection and try again.');
    } else {
      onProgress(4, 0, `Failed to load songs: ${error.message}`);
    }
  }
};

export const saveSettings = async (settings: {}) => {
  try {
    await AsyncStorage.setItem('settings', JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save settings:', error);
    // Add user notification here
    throw new Error('Failed to save settings. Please try again.');
  }
};

export async function loadSettings(): Promise<{settings: {}}> {
  try {
    const settingsStored = await AsyncStorage.getItem('settings');
    const settings = settingsStored ? JSON.parse(settingsStored) : {};
    return {settings: {...Settings, ...settings}};
  } catch (error) {
    console.error('Failed to load settings:', error);
    // Return default settings if loading fails
    return {settings: {...Settings}};
  }
}
