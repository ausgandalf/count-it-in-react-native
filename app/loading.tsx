import LayoutTop from '@/components/LayoutTop';
import { ThemedText } from '@/components/ThemedText';
import { SettingsType } from '@/constants/Settings';
import { Songs } from '@/constants/Songs';
import { getCommonStyles } from '@/constants/Styles';
import { SongType } from '@/constants/Types';
import { useSettings } from '@/context/SettingsContext';
import { useSongs } from '@/context/SongsContext';
import { delay, getColors } from '@/functions/common';
import { useEffect, useState } from 'react';
import { Alert, View } from 'react-native';
import * as Progress from 'react-native-progress';
import { checkVersion, importSongs, loadSavedSongs, loadSettings, loadSongs, saveSettings } from '../functions/resources';

let loadedSongs: SongType[] = [];

export default function LoadingScreen({ onLoad }: { onLoad: () => void }) {
  const {settings, setSettings} = useSettings();
  const {songs, setSongs} = useSongs();
  const [loadingText, setLoadingText] = useState('Loading...');
  const [progress, setProgress] = useState(0);
  const themeColors = getColors();

  const finalizing = async () => {
    setLoadingText('Setting up songs library...');
    setProgress(1);
    await delay(1000);
    onLoad();
  }

  const doImportSongs = async (loadedSettings: {settings: SettingsType}, apiVersion: string) => {
    await importSongs(loadedSongs as SongType[], async (statusCode: number, progress: number, text: string, result?: any) => {
      if (statusCode == 1) {
        setLoadingText('Updating songs library...');
      } else if (statusCode == 2) {
        setLoadingText(text);
        setProgress(0.2 + 0.6 * progress);
      } else if (statusCode == 3) {
        setLoadingText(text);
        setProgress(0.8);

        // Save settings with new version
        const updatedSettings = {...loadedSettings.settings, version: apiVersion};
        setSettings(updatedSettings);
        saveSettings(updatedSettings);

        // Save songs
        console.log('doImportSongs result', result);
        setSongs(result);
        
        await finalizing();
      } else if ([4,5].indexOf(statusCode) != -1) {
        setProgress(0.8);
        await finalizing();
      }
    }, loadedSettings.settings);
  }

  useEffect(() => {
    const doInitialLoad = async () => {

      setLoadingText('Loading settings...');
      const loadedSettings = await loadSettings();
      setSettings(loadedSettings.settings as SettingsType);

      const savedSongs = await loadSavedSongs();
      if (savedSongs) {
        loadedSongs = savedSongs;
      } else {
        const loadedInfo = await loadSongs(Songs);
        loadedSongs = loadedInfo.songs;
      }
      setSongs(loadedSongs);
      
      setProgress(0.2);
      
      const apiVersion = await checkVersion(loadedSettings.settings.versionUrl);
      const importSongsOnLoad = apiVersion >loadedSettings.settings.version;
      if (importSongsOnLoad) {
        if (loadedSettings.settings.version == '0') {
          // Just import songs for very first time
          await doImportSongs(loadedSettings, apiVersion);
        } else {
          Alert.alert(
            "Song List Updated",
            "Do you want to import the new list?",
            [
              { 
                text: "No", 
                onPress: async () => {
                  setTimeout(async () => {
                    // User chose not to update, so save settings with new version
                    const updatedSettings = {...loadedSettings.settings, version: apiVersion};
                    setSettings(updatedSettings);
                    saveSettings(updatedSettings);
                    
                    await finalizing();  
                  }, 200); // delay allows alert to close first
                }
              },
              { 
                text: "Yes", 
                onPress: async () => {
                  setTimeout(async () => {
                    await doImportSongs(loadedSettings, apiVersion);
                  }, 200); // delay allows alert to close first
                }
              }
            ]
          );
        }
      } else {
        await finalizing();
      }
    }

    doInitialLoad();
  }, []);

  
  const commonStyles = getCommonStyles();
  return (
    <View style={commonStyles.container}>
      <View style={commonStyles.wrap}>
        <View style={[commonStyles.body, {flex: 1, justifyContent: 'center', alignItems: 'center', gap: 40,}, commonStyles.bg]}>
          <View style={{width: '100%', gap: 20}}>
            <LayoutTop />
          </View>
          <View style={{gap: 20, width: '100%'}}>
            <Progress.Bar progress={progress} width={null} height={10} color={themeColors.button.primary.background} />
            <ThemedText textAlign='center' style={{ marginTop: 10 }}>{loadingText}</ThemedText>
          </View>
        </View>
      </View>
    </View>
  );
}
