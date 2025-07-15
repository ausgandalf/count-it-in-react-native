import { ExternalLink } from '@/components/ExternalLink';
import LayoutTop from '@/components/LayoutTop';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import RadioButtonGroup from '@/components/RadioButtonGroup';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { Settings } from '@/constants/Settings';
import { getCommonStyles } from '@/constants/Styles';
import { SongType } from '@/constants/Types';
import { useSettings } from '@/context/SettingsContext';
import { useSongs } from '@/context/SongsContext';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, useColorScheme, useWindowDimensions, View } from 'react-native';
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
    importSongs(songs as SongType[], (statusCode: number, progress: number, text: string, result?: any) => {
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
      // minHeight: windowHeight - 100,
    },
    middle: {
      flex: 1,
      minHeight: windowHeight - 280,
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
    <View style={{flex: 1}}>
      {/* <View style={[commonStyles.container, {minHeight: '100%', gap: 0}]}> */}
      <ParallaxScrollView 
        headerBackgroundColor={{dark: Colors.dark.background, light: Colors.light.background}} 
        headerImage={<LayoutTop />}
        contentStyle={styles.content}
      >
        {/* <LayoutTop /> */}
        <View style={commonStyles.wrap}>
          <View style={commonStyles.body}>

            <View style={[styles.middle, {gap: 20}]}>
              <View style={[commonStyles.sub, {gap: 10}]}>
                <View style={{flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'flex-start', gap: 10}}>
                  <ThemedText type="title" textAlign="left">About</ThemedText>
                  <ThemedText type="default" textAlign="left">v1.0.0</ThemedText>
                </View>
                <ThemedText type="default" textAlign="left">
                  This app does not collect, store, or transmit any personal data. It only fetches public music metadata from a remote source for display.
                </ThemedText>
                <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
                  <ThemedText type="default" textAlign="left">© 2025 countitin.com</ThemedText>
                  <ExternalLink href="https://countitin.com/privacy-policy">
                    <ThemedText type="link" textAlign="left">Privacy Policy</ThemedText>
                  </ExternalLink>
                </View>
              </View>

              <View style={{alignItems: 'flex-end'}}>
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

              <View style={[commonStyles.sub, {gap: 10}]}>
                <View style={{flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 10}}>
                  <ThemedText type="default" textAlign="left">Theme Settings</ThemedText>
                </View>
                <View>
                  <RadioButtonGroup 
                    options={[{label: 'System Default', value: ''}, {label: 'Light', value: 'light'}, {label: 'Dark', value: 'dark'}]} 
                    selected={settings.theme} 
                    onSelect={(v: string) => setSettings({...settings, theme: v as 'light' | 'dark' | ''})} 
                  />
                </View>
              </View>

              <View style={[commonStyles.sub, {gap: 10}]}>
                <View style={{flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 10}}>
                  <ThemedText type="default" textAlign="left">Import</ThemedText>
                  <TouchableOpacity style={[commonStyles.buttonSm, commonStyles.primaryButton, isImporting ? commonStyles.disabledButton : {}]} onPress={doImportSongs} disabled={isImporting}>
                    <Text style={commonStyles.buttonText}>{isImporting ? 'Importing...' : 'Start'}</Text>
                  </TouchableOpacity>
                </View>
                <TextInput
                  style={commonStyles.inputText}
                  value={settings.url}
                  onChangeText={(v) => setSettings({...settings, url: v})}
                  placeholder="https://default-song-list.com"
                />
              </View>
              
            </View>

            <View style={styles.bottom}>
              
            </View>
          </View>
        </View>
      </ParallaxScrollView>
      {/* </View> */}
      
      <Modal 
        isVisible={isProgressVisible} 
        onBackButtonPress={toggleProgressModal}
        animationIn="fadeIn"
        animationOut="fadeOut"
        backdropOpacity={0.5}
        useNativeDriver={true}
        hideModalContentWhileAnimating={true}
        style={[commonStyles.modal, {padding: 0}]}
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

    </View>
  );
}

