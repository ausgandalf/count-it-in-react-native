import BpmControls from '@/components/BpmControls';
import LayoutTop from '@/components/LayoutTop';
import SongListOwner from '@/components/SongListOwner';
import { useColorScheme } from '@/hooks/useColorScheme';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import React, { useCallback, useEffect, useState } from 'react';
import { Platform, StyleSheet, View, useWindowDimensions } from 'react-native';

import SetListView from '@/components/SetListView';
import { Songs } from '@/constants/Songs';
import { SetlistType, SongType } from '@/constants/Types';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { Colors } from '@/constants/Colors';
import { getCommonStyles } from '@/constants/Styles';
import { useSongs } from '@/context/SongsContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { alert } from '../../functions/common';
import { generateSongID, isSongExists, loadSongs } from '../../functions/resources';

const handleExport = async (setlist:SetlistType) => {
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

const handleExportWeb = async (fileName: string, csvContent:string) => {
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

const handleExportMobile = async (fileName: string, csvContent:string) => {
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

const saveSongList = async (songList:SongType[]) => {
  try {
    const customSongs = songList.filter(s => s.isCustom);
    await AsyncStorage.setItem('customSongs', JSON.stringify(customSongs));
  } catch (e) {
    console.error('Failed to save custom song list:', e);
  }
};

const saveCoreUpdates = async (coreUpdates:any) => {
  try {
    await AsyncStorage.setItem('coreUpdates', JSON.stringify(coreUpdates));
  } catch (e) {
    console.error('Failed to save core updates list:', e);
  }
};

const setCoreUpdate = (coreUpdates:any, song:SongType) => {
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

const loadSetlist = async () => {
  const setlistsJson = await AsyncStorage.getItem('setlist');
  const setlists = setlistsJson ? JSON.parse(setlistsJson) : [];
  
  return {setlists: setlists.slice(0, 5)};
}

const saveSetlists = async (setlist:SetlistType[]) => {
  try {
    await AsyncStorage.setItem('setlist', JSON.stringify(setlist));
  } catch (e) {
    console.error('Failed to save setlist:', e);
  }
};

function arangeSongs(songs:SongType[]) {
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


export default function HomeScreen() {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  const [viewMode, setViewMode] = useState<'songs' | 'setlist'>('songs');
  const [bpm, setBpm] = useState(120);
  const {songs, setSongs} = useSongs();
  const [coreUpdates, setCoreUpdates] = useState({});
  const sortedSongList = useCallback(() => arangeSongs(songs), [songs]);

  const [setlists, setSetlists] = useState<SetlistType[]>([]);
  const [selectedSong, setSelectedSong] = useState<SongType>();
  const [selectedSetlist, setSelectedSetlist] = useState<SetlistType>();
  const [selectedSongOnList, setSelectedSongOnList] = useState<SongType>();

  const [isSongListModalVisible, setSongListModalVisible] = useState(false);

  const [songImportMode, setSongImportMode] = useState(1);


  const updateSong = (song: any) => {
    // console.log(song);
    if (song.id == '') {
      // New song
      if (!song.label) song.label = song.name.charAt(0).toUpperCase();
      songs.push({
        ...song,
        id: generateSongID(song, 'custom'),
        isCustom: true 
      });
    } else {
      // Find a song
      for (let i=0; i<songs.length; i++) {
        if (songs[i].id == song.id) {

          songs[i].bpm = song.bpm;
          songs[i].name = song.name;
          songs[i].artist = song.artist;

          const newCoreUpdates = setCoreUpdate(coreUpdates, song);
          setCoreUpdates(newCoreUpdates);
          saveCoreUpdates(newCoreUpdates);

          break;
        } else {
          // TODO : This should not be happening, so what logic should be here???
          // console.log(`The song is not found: ${song}`);
        }
      }
    }
    
    const newSongs = structuredClone(songs);
    setSongs(newSongs);
    saveSongList(newSongs);
  }

  const updateSetlist = (setlist: any) => {
    if (setlist.id == '') {
      // New setlist
      if (setlists.length > 4) return; // Can not add more than 5 setlists
      const newSetlist = {
        id: Date.now().toString(),
        name: setlist.name,
        songs: [],
      }
      setlists.push(newSetlist);
      setSelectedSetlist(newSetlist);
    } else {
      // TODO
      for (let i=0; i<setlists.length; i++) {
        if (setlists[i].id == setlist.id) {
          setlists[i] = setlist;
          break;
        }
      }
    }
    
    const newSetlists = structuredClone(setlists);
    setSetlists(newSetlists);
    saveSetlists(newSetlists);
  }

  const onUpdate=(type:string, v:any) => {
    // TODO
    if (type == 'song') {
      updateSong(v);
    } else if (type == 'updateSetlist') {
      updateSetlist(v);
    } else if (type == 'selectSetlist') {
      setSelectedSetlist(v);
      setViewMode('setlist');
    } else if (type == 'setViewMode') {
      setViewMode(v);
    } else if (type == 'setSongListModalVisible') {
      setSongListModalVisible(v);
    } else if (type == 'selectSongOnList') {
      setBpm(v.bpm);
      setSelectedSongOnList(v);
    } else if (type == 'deleteSongFromSetlist') {
      if (!selectedSetlist) return;
      selectedSetlist.songs = selectedSetlist.songs.filter((item) => item.id != v.id);
      updateSetlist(selectedSetlist);
    } else if (type == 'deleteSelectedSetlist') {
      if (!selectedSetlist) return;
      const newSetlists = setlists.filter((item) => item.id != selectedSetlist.id);
      setSetlists(newSetlists);
      saveSetlists(newSetlists);
    } else if (type == 'setBpm') {
      setBpm(v);
    } else if (type == 'saveBpm') {
      // TODO 
      if (viewMode == 'songs') {
        if (selectedSong && !isNaN(Number(v))) {
          // Let's save a song
          selectedSong.bpm = Number(v);
          updateSong(selectedSong);
        }
      } else {
        // Let's save a song details in the setlist
        if (selectedSongOnList && selectedSetlist && !isNaN(Number(v))) {
          for (let i=0; i<selectedSetlist.songs.length; i++) {
            if (selectedSetlist.songs[i].id == selectedSongOnList.id) {
              selectedSetlist.songs[i]['bpm'] = v;
              updateSetlist(selectedSetlist);
              break;
            }
          }

        }
      }
    } else if (type == 'export') {
      if (selectedSetlist) handleExport(selectedSetlist);
    } else if (type == 'setImportMode') {
      setSongImportMode(v);
    } else if (type == 'importSongs') {

      let newSongs = structuredClone(songs);
      let isSongsLibraryUpdated = false;

      const songsToSetlist = [];

      for (let i=0; i<v.length; i++) {
        let song = v[i];
        song = {
          ...song,
          id: generateSongID(song, 'custom'),
          label: song.name.charAt(0).toUpperCase(),
          isCustom: true 
        };
        if ((songImportMode == 1) && !isSongExists(newSongs, song)) {
          newSongs.push({...song});
          isSongsLibraryUpdated = true;
        }
        songsToSetlist.push({...song, id: song.id + '--' + Date.now().toString() + '-' + i});
      }

      // Update songs library
      if (isSongsLibraryUpdated) {
        setSongs(newSongs);
        saveSongList(newSongs);
      }

      // Add to setlist
      if (selectedSetlist && songsToSetlist.length > 0) {
        selectedSetlist.songs = [...selectedSetlist.songs, ...songsToSetlist];
        updateSetlist(selectedSetlist);
      }
    } else if (type == 'deleteSongsFromLibrary') {
      const newSongs = songs.filter((item:SongType) => v.indexOf(item.id) == -1);
      setSongs(newSongs);
      saveSongList(newSongs);
    }
  }
  
  const commonStyles = getCommonStyles();
  const colorScheme = useColorScheme();
  const styles = StyleSheet.create({
    content: {
      // flex: 1,
      minHeight: windowHeight - 50,
    },
    middle: {
      flex: 1,
      // minHeight: viewMode == 'setlist' ? 440 : 100,
      width: '100%',
      zIndex: 1000,
    },
    bottom: {
      // paddingBlockEnd: 20
    },
  });

  // Load songs and setlists
  useEffect(() => {
    const doInitialLoad = async () => {
      const loadedInfo = await loadSongs(Songs);
      setSongs(loadedInfo.songs);
      setCoreUpdates(loadedInfo.updates);

      const loadedSetlistInfo = await loadSetlist();
      setSetlists(loadedSetlistInfo.setlists);
    }
    doInitialLoad();
  }, []);

  return (
    <ParallaxScrollView 
      headerBackgroundColor={{dark: Colors.dark.background, light: Colors.light.background}} 
      headerImage={<LayoutTop />}
      contentStyle={styles.content}
    >
        {/* <LayoutTop /> */}
        <View style={commonStyles.wrap}>
          <View style={[commonStyles.body, {gap: 10}]}>

            <View style={styles.middle}>

              <View style={{gap: 10, zIndex: 1000}}>
                <View style={{zIndex: 1000}}>
                  <SetListView 
                    viewMode={viewMode}
                    selected={selectedSetlist}
                    setlist={setlists}
                    onUpdate={onUpdate} 
                  />
                </View>

                <View>
                  <SongListOwner 
                    type='select'
                    viewMode={viewMode} 
                    isSongModalOpen={isSongListModalVisible}
                    songs={sortedSongList()} 
                    onSelect={(song:SongType) => {
                      // TODO
                      if (viewMode == 'songs') {
                        setSelectedSong(song);
                      } else {
                        // let's add it to selected setlist
                        if (!selectedSetlist) return;
                        song.id = song.id + '--' + Date.now().toString();
                        selectedSetlist.songs.push(song)
                        updateSetlist(selectedSetlist);
                      }
                      setBpm(song.bpm??120);
                    }} 
                    onUpdate={onUpdate} 
                  />
                </View>
                
              </View>
                
            </View>

            <View style={styles.bottom}>
              <BpmControls
                bpm={bpm}
                onUpdate={onUpdate}
              />
            </View>
          </View>
        </View>
      
    </ParallaxScrollView>
  );
}
