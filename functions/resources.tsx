import { Settings, SettingsType } from "@/constants/Settings";
import { SetlistType, SongType } from "@/constants/Types";
import { alert } from "@/functions/common";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from '@react-native-community/netinfo';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform } from "react-native";
import { delay } from "./common";

export const handleExport = async (setlist:SetlistType) => {
  if (!setlist) return;
  const fileName = setlist.name + '-' + setlist.id + '.csv';
  const csvHeader = "name,artist,bpm\n";
  const csvRows = setlist.songs.map(song =>
    `"${song.name.replace(/"/g, '""')}","${song.artist.replace(/"/g, '""')}",${song.bpm}`
  );
  const csvContent = csvHeader + csvRows.join("\n");
  
  if (Platform.OS === 'web') {
    handleExportWeb(fileName, csvContent);
  } else {
    handleExportMobile(fileName, csvContent);
  }
}

export const handleExportWeb = async (fileName: string, csvContent:string) => {
  try {
    const blob = new Blob([csvContent], { type: "text/csv" });;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${fileName}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Export error:', error);
    alert('Export Failed', 'Something went wrong while exporting the file.');
  }
};

export const handleExportMobile = async (fileName: string, csvContent:string) => {
  if (!csvContent) return;

  try {
    const fileUri = FileSystem.documentDirectory + fileName;

    // Save content to file
    await FileSystem.writeAsStringAsync(fileUri, csvContent, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    // Check if sharing is available
    const canShare = await Sharing.isAvailableAsync();
    if (!canShare) {
      alert('Sharing is not supported on this device. The song list has been exported to:' + fileUri);
      return;
    }

    // Open share dialog
    await Sharing.shareAsync(fileUri);
  } catch (error) {
    console.error('Export error:', error);
    alert('Export Failed', 'Something went wrong while exporting the file.');
  }
};

export const saveSongList = async (songList:SongType[]) => {
  try {
    const customSongs = songList.filter(s => s.isCustom);
    await AsyncStorage.setItem('customSongs', JSON.stringify(customSongs));
  } catch (e) {
    console.error('Failed to save custom song list:', e);
  }
};

export const saveCoreUpdates = async (coreUpdates:any) => {
  try {
    await AsyncStorage.setItem('coreUpdates', JSON.stringify(coreUpdates));
  } catch (e) {
    console.error('Failed to save core updates list:', e);
  }
};

export const setCoreUpdate = (coreUpdates:any, song:SongType) => {
  if (!song.id) song.id = generateSongID(song, song.isCustom ? 'custom' :  'core');
  if (song.id in coreUpdates) {
    coreUpdates[song.id] = {
      ...coreUpdates[song.id],
      bpm: song.bpm,
      name: song.name,
      artist: song.artist,
    };
  } else {
    coreUpdates[song.id] = {
      bpm: song.bpm,
      name: song.name,
      artist: song.artist,
    };
  }

  return coreUpdates;
};

export const loadSetlist = async () => {
  const setlistsJson = await AsyncStorage.getItem('setlist');
  const setlists = setlistsJson ? JSON.parse(setlistsJson) : [];
  
  return {setlists: setlists.slice(0, 5)};
}

export const saveSetlists = async (setlist:SetlistType[]) => {
  try {
    await AsyncStorage.setItem('setlist', JSON.stringify(setlist));
  } catch (e) {
    console.error('Failed to save setlist:', e);
  }
};

export function arangeSongs(songs:SongType[]) {
  const sortedSongList = songs.sort((a, b) => a.name.localeCompare(b.name));
  const arrangedSongList: SongType[] = [];

  let prevLabel:false|string = false;
  for (let i=0; i<sortedSongList.length; i++) {
    const item = sortedSongList[i];

    if (sortedSongList[i].label !== prevLabel) {
      arrangedSongList.push({
        id: `label-${item.label}`,
        name: item.label,
        isLabel: 1,
        label: item.label,
        artist: '',
        bpm: 120,
      });
      prevLabel = sortedSongList[i].label;
    }
    arrangedSongList.push(item);
  }

  return arrangedSongList;
}


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

export const importSongs = async (songs: SongType[], onProgress: (statusCode: number, progress: number, text: string, result?: any) => void, settings: SettingsType) => {
  if (!settings.apiUrl) {
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
    
    const response = await fetch(settings.apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      // throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      onProgress(4, 0, 'API server is not available. Please try again later.');
      return;
    }
    
    const jsonData = await response.json();
    const json = jsonData.data;
    
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


export const checkVersion = async (url: string):Promise<number> => {
  if (!url) {
    return 0;
  }
  
  // Check network connection first
  const isConnected = await checkNetworkConnection();
  if (!isConnected) {
    return 0;
  }
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      // throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      return 0;
    }
    
    const json = await response.json();
    return json.version ?? 0;
  } catch (error: any) {
    return 0
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

export async function loadSettings(): Promise<{settings: SettingsType}> {
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
