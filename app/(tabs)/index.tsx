import BpmControls from '@/components/BpmControls';
import LayoutTop from '@/components/LayoutTop';
import SetListView from '@/components/SetListView';
import SongListOwner from '@/components/SongListOwner';
import { SetlistType, SongType } from '@/constants/Types';
import { useColorScheme } from '@/hooks/useColorScheme';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, StyleSheet, TextInput, TouchableWithoutFeedback, View, useWindowDimensions } from 'react-native';
import Modal from 'react-native-modal';

import SetlistForm from '@/components/SetlistForm';
import SongForm from '@/components/SongForm';
import SongList from '@/components/SongList';
import { getCommonStyles } from '@/constants/Styles';
import { useSongs } from '@/context/SongsContext';
import { arangeSongs, generateSongID, handleExport, isSongExists, loadSetlist, saveSetlists, saveSongList } from '../../functions/resources';

export default function HomeScreen() {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  const [viewMode, setViewMode] = useState<'songs' | 'setlist'>('songs');
  const [bpm, setBpm] = useState(120);
  const {songs, setSongs} = useSongs();
  const [coreUpdates, setCoreUpdates] = useState({});
  const sortedSongList = useCallback(() => arangeSongs(songs as SongType[]), [songs]);

  const [setlists, setSetlists] = useState<SetlistType[]>([]);
  const [selectedSong, setSelectedSong] = useState<SongType>();
  const [selectedSetlist, setSelectedSetlist] = useState<SetlistType>();
  const [selectedSongOnList, setSelectedSongOnList] = useState<SongType>();

  const [editingSong, setEditingSong] = useState<null|SongType>();

  const [songImportMode, setSongImportMode] = useState(1);
  const [isSongListModalVisible, setSongListModalVisible] = useState(false);

  const [isSongFormModalVisible, setSongFormModalVisible] = useState(false);
  const songFormInputRef = useRef<TextInput | null>(null);

  useEffect(() => {
    if (isSongFormModalVisible) {
      const timeout = setTimeout(() => {
        songFormInputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [isSongFormModalVisible]);

  const [isSetlistFormModalVisible, setSetlistFormModalVisible] = useState(false);

  const setlistFormInputRef = useRef<TextInput | null>(null);
  useEffect(() => {
    if (isSetlistFormModalVisible) {
      const timeout = setTimeout(() => {
        setlistFormInputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [isSetlistFormModalVisible]);

  const openSongForm = (isCreate:boolean, song:null|SongType) => {
    onUpdate('openSongFormModal', true);
    if (!isCreate && song) {
      setEditingSong(song);
    } else {
      setEditingSong(null);
    }
  }

  useEffect(() => {
    if (viewMode == 'songs') {
      setBpm(selectedSong ? selectedSong.bpm : 120);
    }
  }, [viewMode]);

  const updateSong = (song: any) => {
    const newSongs = songs ? JSON.parse(JSON.stringify(songs)) : []; // React Native compatible deep clone
    // console.log(song);
    if (song.id == '') {
      // New song
      if (!song.label) song.label = song.name.charAt(0).toUpperCase();
      newSongs.push({
        ...song,
        id: generateSongID(song, 'custom'),
        isCustom: true
      });
    } else {
      // Find a song
      let isFound = false;
      for (let i=0; i<newSongs.length; i++) {
        if (newSongs[i].id == song.id) {
          isFound = true;
          newSongs[i].bpm = song.bpm;
          newSongs[i].name = song.name;
          newSongs[i].artist = song.artist;

          /*
          const newCoreUpdates = setCoreUpdate(coreUpdates, song);
          setCoreUpdates(newCoreUpdates);
          saveCoreUpdates(newCoreUpdates);
          */

          break;
        }
      }
      if (!isFound) {
        // TODO : This should not be happening, but if so
        newSongs.push({...song});
      }
    }
    
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
    
    const newSetlists = JSON.parse(JSON.stringify(setlists)); // React Native compatible deep clone
    setSetlists(newSetlists);
    saveSetlists(newSetlists);
  }

  const onUpdate=async (type:string, v:any) => {
    // TODO
    if (type == 'song') {
      updateSong(v);
    } else if (type == 'onAddSongsToSetlist') {
      if (!selectedSetlist || !v) return;
      v.forEach((song:SongType) => {
        song.id = song.id + '--' + Date.now().toString();
        selectedSetlist.songs.push(song)
      });
      updateSetlist(selectedSetlist);
    } else if (type == 'updateSetlist') {
      updateSetlist(v);
    } else if (type == 'selectSetlist') {
      setSelectedSetlist(v);
      if (v) {
        setViewMode('setlist');
      } else {
        setViewMode('songs');
      }
    } else if (type == 'setViewMode') {
      setViewMode(v);
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

      let newSongs = JSON.parse(JSON.stringify(songs)); // React Native compatible deep clone
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
      const newSongs = songs ? songs.filter((item:SongType) => v.indexOf(item.id) == -1) : [];
      setSongs(newSongs);
      saveSongList(newSongs);
    } else if (type == 'openSongListModal') {
      setSongListModalVisible(v);
      setSongFormModalVisible(false);
    } else if (type == 'openSetlistFormModal') {
      setSetlistFormModalVisible(v);
    } else if (type == 'openSongFormModal') {
      setSongFormModalVisible(v);
    } else if (type == 'setSongListDragBegin') {
      
    } else if (type == 'setSongListDragEnd') {
      
    }
  }
  
  const commonStyles = getCommonStyles();
  const colorScheme = useColorScheme();
  const styles = StyleSheet.create({
    content: {
      // flex: 1,
      minHeight: windowHeight - 100,
    },
    middle: {
      flex: 1,
      // minHeight: viewMode == 'setlist' ? 270 : 100,
      width: '100%',
      zIndex: 1000,
    },
    bottom: {
      paddingBlockStart: 10,
      zIndex: 1001,
    },
  });

  // Load songs and setlists
  useEffect(() => {
    const doInitialLoad = async () => {
      /*
       * Moved this block to LoadingScreen.tsx
       * because it's not needed to load songs and setlists here
       */
      /*
      const savedSongs = await loadSavedSongs();
      if (savedSongs) {
        setSongs(savedSongs);
        setCoreUpdates({}); // We don't need core updates for saved songs
      } else {
        const loadedInfo = await loadSongs(Songs);
        setSongs(loadedInfo.songs);
        setCoreUpdates(loadedInfo.updates);
      }
      */
      
      const loadedSetlistInfo = await loadSetlist();
      setSetlists(loadedSetlistInfo.setlists);
    }
    doInitialLoad();
  }, []);

  return (
    <View style={{flex: 1, paddingBlockEnd: Platform.OS == 'ios' ? 80 : 0}}>
      {/* <ParallaxScrollView
      headerBackgroundColor={{dark: Colors.dark.background, light: Colors.light.background}}
      headerImage={<LayoutTop />}
      contentStyle={styles.content}
      > */}
      <View style={[commonStyles.container, {gap: 0}]}>
        <LayoutTop />
        <View style={commonStyles.wrap}>
          <View style={[commonStyles.body, {gap: 0}]}>

            <View style={styles.middle}>

              <View style={{gap: 10}}>
                <View style={{zIndex: 1000}}>
                  <SetListView
                    viewMode={viewMode}
                    selected={selectedSetlist}
                    setlist={setlists}
                    onUpdate={onUpdate}
                    modalOpen={isSongListModalVisible || isSetlistFormModalVisible || isSongFormModalVisible}
                  />
                </View>
                {
                  viewMode == 'songs' && (
                    <View style={{}}>
                      <SongListOwner
                        type='select'
                        viewMode={viewMode}
                        onUpdate={onUpdate}
                        currentSong={selectedSong ?? null}
                      />
                    </View>
                  )
                }
                
              </View>
                
            </View>

            <View style={[styles.bottom, commonStyles.bg]}>
              <BpmControls
                bpm={bpm}
                onUpdate={onUpdate}
              />
            </View>
          </View>
        </View>
      {/* </ParallaxScrollView> */}
      </View>
      
      <View>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={{ flex: 1 }}>
            <Modal
              isVisible={isSetlistFormModalVisible}
              onBackButtonPress={() => onUpdate('openSetlistFormModal', false)}
              onBackdropPress={() => onUpdate('openSetlistFormModal', false)}
              animationIn="fadeIn"
              animationOut="fadeOut"
              backdropOpacity={0.5}
              useNativeDriver={true}
              hideModalContentWhileAnimating={true}
              style={[commonStyles.modal, {padding: 0}]}
            >
              <View style={[commonStyles.overlay, {justifyContent: 'center',}]}>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%'}}>
                  <View style={[commonStyles.modalBox, { zIndex: 1, borderRadius: 10 }]}>
                    <SetlistForm
                      inputRef={setlistFormInputRef}
                      onSubmit={(setlist: { id: string, name: string; }) =>{
                        // TODO - Setlist list update
                        onUpdate('openSetlistFormModal', false)
                        onUpdate('updateSetlist', setlist);
                      }}
                      onCancel={() =>{
                        onUpdate('openSetlistFormModal', false)
                      }}
                    />
                  </View>
                </KeyboardAvoidingView>
              </View>
            </Modal>
          </View>
        </TouchableWithoutFeedback>

        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={{ flex: 1 }}>
            <Modal
              isVisible={isSongListModalVisible}
              onBackdropPress={() => onUpdate('openSongListModal', false)}
              onBackButtonPress={() => onUpdate('openSongListModal', false)}
              backdropOpacity={0.5}
              animationIn="slideInUp"
              animationOut="slideOutDown"
              useNativeDriver={true}
              hideModalContentWhileAnimating={true}
              style={[commonStyles.modal]}
              onDismiss={() => {
                onUpdate('openSongFormModal', true);
              }}
            >
              <View style={[commonStyles.overlay, {padding: 0}]}>
                
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{flex: 1, justifyContent: 'flex-end', alignItems: 'center', width: '100%'}}>
                
                  <View style={[commonStyles.modalBox, { zIndex: 1 }]}>
                    {
                      isSongFormModalVisible ? (
                        <SongForm
                          inputRef={songFormInputRef}
                          song={editingSong}
                          onSubmit={(song: { id: string, name: string; artist: string; bpm: number }) =>{
                            // TODO - Song list update
                            onUpdate('openSongFormModal', false);
                            onUpdate('song', song);
                          }}
                          onCancel={() =>{
                            onUpdate('openSongFormModal', false);
                          }}
                        />
                      ) : (
                        <SongList
                          songs={sortedSongList()}
                          onUpdate={onUpdate}
                          onSelect={(song) => {
                            // Close the modal
                            setTimeout(() => {
                              onUpdate('openSongListModal', false);
                            }, 1);

                            // Update the selected song
                            if (viewMode == 'songs') {
                              setSelectedSong(song);
                            } else {
                              // let's add it to selected setlist
                              if (!selectedSetlist) return;
                              song.id = song.id + '--' + Date.now().toString();
                              selectedSetlist.songs.push(song)
                              updateSetlist(selectedSetlist);
                            }

                            // Update the bpm
                            setBpm(song.bpm??120);
                          }}
                          openForm={openSongForm}
                          onDelete={(ids:string[]) => onUpdate('deleteSongsFromLibrary', ids)}
                        />
                      )
                    }
                  </View>

                </KeyboardAvoidingView>

              </View>
            </Modal>
          </View>
        </TouchableWithoutFeedback>

      </View>
      
    </View>
  );
}
