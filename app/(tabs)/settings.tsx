import { ThemedText } from '@/components/ThemedText';
import { Settings } from '@/constants/Settings';
import { getCommonStyles } from '@/constants/Styles';
import { useSettings } from '@/context/SettingsContext';
import { useSongs } from '@/context/SongsContext';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, useColorScheme, useWindowDimensions, View } from 'react-native';
import Modal from 'react-native-modal';
import * as Progress from 'react-native-progress';
import { importSongs, saveSettings } from '../../functions/resources';

export default function SettingsScreen() {
  
  const {settings, setSettings} = useSettings();
  const {songs, setSongs} = useSongs();
  const [savedSettings, setSavedSettings] = useState(settings);
  const isSettingsChanged = JSON.stringify(settings) !== JSON.stringify(savedSettings);
  const isSettingsDefault = JSON.stringify(settings) === JSON.stringify(Settings);

  const [isImporting, setIsImporting] = useState(false);
  const [isProgressVisible, setProgressVisible] = useState(false);
  const toggleProgressModal = () => setProgressVisible(!isProgressVisible);
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState('');

  const doImportSongs = async () => {
    importSongs(songs, (statusCode: number, progress: number, text: string, result?: any) => {
      if (statusCode == 1) {
        setIsImporting(true);
        setProgressVisible(true);
      } else if (statusCode != 2) {
        setIsImporting(false);
      }
      setProgress(progress);
      setProgressText(text);
      if (statusCode == 3) {
        setSongs(result);
      }
    }, settings);
  }

  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const colorScheme = useColorScheme();
  const commonStyles = getCommonStyles();
  const styles = StyleSheet.create({
    content: {
      minHeight: windowHeight - 200,
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
      <ScrollView style={commonStyles.container} contentContainerStyle={styles.content}>
        <View style={commonStyles.wrap}>
          <View style={commonStyles.body}>

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
                  <TouchableOpacity style={[commonStyles.button, commonStyles.primaryButton, isImporting ? commonStyles.disabledButton : {}]} onPress={doImportSongs} disabled={isImporting}>
                    <Text style={commonStyles.buttonText}>{isImporting ? 'Importing...' : 'Start'}</Text>
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

