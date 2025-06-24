import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { Settings } from '@/constants/Settings';
import { getCommonStyles } from '@/constants/Styles';
import { SongType } from '@/constants/Types';
import { useSettings } from '@/context/SettingsContext';
import { useSongs } from '@/context/SongsContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, useColorScheme, useWindowDimensions, View } from 'react-native';
import Modal from 'react-native-modal';
import * as Progress from 'react-native-progress';
import { alert, delay, generateSongID, isSongExists } from '../../functions/common';

const saveSettings = async (settings:{}) => {
  try {
    await AsyncStorage.setItem('settings', JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings:', e);
  }
};

async function loadSettings():Promise<{settings:{}}> {
  
  const settingsStored = await AsyncStorage.getItem('settings');
  const settings = settingsStored ? JSON.parse(settingsStored) : Settings;

  return {settings};
}


export default function SettingsScreen() {
  
  const {settings, setSettings} = useSettings();
  const {songs, setSongs} = useSongs();
  const [savedSettings, setSavedSettings] = useState(Settings);
  const isSettingsChanged = JSON.stringify(settings) !== JSON.stringify(savedSettings);
  const isSettingsDefault = JSON.stringify(settings) === JSON.stringify(Settings);

  const [isProgressVisible, setProgressVisible] = useState(false);
  const toggleProgressModal = () => setProgressVisible(!isProgressVisible);
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState('');
  useEffect(() => {
    const doInitialLoad = async () => {
      const loadedInfo = await loadSettings();
      setSettings(loadedInfo.settings);
    }
    doInitialLoad();
  }, []);

  const loadSongs = async () => {
    if (!settings.url) {
      alert('Error', 'Please enter a URL');
      return;
    }
    setProgressVisible(true);
    setProgress(0);
    setProgressText('Accessing URL...');
    fetch(settings.url) // Replace with your actual URL
    .then((res) => {
      if (!res.ok) {
        setProgressText('Failed to load songs from ' + settings.url);
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
        setProgress((i + 1) / json.length);
        setProgressText('Loading songs... ' + i + ' of ' + json.length);
        const song = json[i];
        if (!song.label) song.label = song.name.charAt(0).toUpperCase();
        song.id = generateSongID(song, 'custom');
        if (!isSongExists(songs, song)) {
          newSongs.push(song);
          newlyAddedSongsCount++;
        }
      }
      setSongs(newSongs);
      // alert('Found ' + json.length + ' song(s). Imported ' + newlyAddedSongsCount + ', skipping duplicates.');
      setProgressText('Found ' + json.length + ' song(s). Imported ' + newlyAddedSongsCount + ', skipping duplicates.');
    })
    .catch((error) => {
      setProgressText('Failed to load songs from ' + settings.url);
      console.error('Error fetching JSON:', error);
    });
  }

  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const colorScheme = useColorScheme();
  const commonStyles = getCommonStyles();
  const styles = StyleSheet.create({
    container: {
      backgroundColor: Colors[colorScheme ?? 'light'].background,
      flex: 1,
      gap: 20,
      padding: 20,
      margin: 0,
    },
    content: {
      minHeight: windowHeight - 200,
    },
    wrap: {
      alignItems: 'center',
      flex: 1,
    },
    body: {
      flex: 1,
      gap: 20,
      maxWidth: windowWidth < 768 ? '100%' : 600,
      width: '100%',
    },    
    middle: {
      flex: 1,
      // minHeight: viewMode == 'setlist' ? 480 : 100,
      width: '100%',
      zIndex: 1000,
    },
    bottom: {
      
    },
    modalContainer: {
      padding: 20,
      borderRadius: 12,
      gap: 20,
    },
  });
  
  return (
    <>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.wrap}>
          <View style={styles.body}>

            <View style={styles.middle}>
              <View style={[commonStyles.sub, {gap: 10}]}>
                <ThemedText type="default" textAlign="left">Import Songs from Library</ThemedText>
                <TextInput
                  style={commonStyles.inputText}
                  value={settings.url}
                  onChangeText={(v) => setSettings({...settings, url: v})}
                  placeholder="https://default-song-list.com"
                />
                <View style={[commonStyles.buttonGroup, {justifyContent: 'flex-end'}]}>
                  <TouchableOpacity style={[commonStyles.button, commonStyles.primaryButton]} onPress={() => {
                    // TO DO -- import songs
                    loadSongs();
                  }}>
                    <Text style={commonStyles.buttonText}>Import Songs</Text>
                  </TouchableOpacity>
                </View>
              </View>
              
            </View>

            <View style={styles.bottom}>
              <View style={commonStyles.buttonGroup}>
                <TouchableOpacity 
                  style={[commonStyles.button, commonStyles.primaryButton, isSettingsChanged ? {} : commonStyles.disabledButton]} 
                  onPress={() => {
                    setSettings(settings);
                    saveSettings(settings);
                    setSavedSettings(settings);
                  }}
                  disabled={!isSettingsChanged}
                >
                  <Text style={commonStyles.buttonText}>Save</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[commonStyles.button, commonStyles.tertiaryButton, isSettingsDefault ? commonStyles.disabledButton : {}]} 
                  onPress={() => {
                    setSettings(Settings);
                  }}
                  disabled={isSettingsDefault}
                >
                  <Text style={commonStyles.buttonText}>Restore Defaults</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

      </ScrollView>
      
      <Modal 
        isVisible={isProgressVisible} 
        onBackButtonPress={toggleProgressModal}
        animationIn="fadeIn"
        animationOut="fadeOut"
        style={[commonStyles.modal, {padding: 20}]}
      >
        <View style={[commonStyles.overlay, {justifyContent: 'center',}]}>
          <View style={[commonStyles.modalBox, { zIndex: 1, borderRadius: 10, gap: 20 }]}>
            <View style={[styles.modalContainer, commonStyles.bg]}>
              <ThemedText type="default" textAlign="left">{progressText}</ThemedText>
              <Progress.Bar progress={progress} width={null} height={10} color="#4ade80" />
              <View style={[commonStyles.buttonGroup, {justifyContent: 'flex-end'}]}>
                <TouchableOpacity style={[commonStyles.button, commonStyles.primaryButton]} onPress={() => setProgressVisible(false)}>
                  <Text style={commonStyles.buttonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

    </>
  );
}

