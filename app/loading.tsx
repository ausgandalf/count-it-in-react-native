import LayoutTop from '@/components/LayoutTop';
import { ThemedText } from '@/components/ThemedText';
import { SettingsType } from '@/constants/Settings';
import { Songs } from '@/constants/Songs';
import { getCommonStyles } from '@/constants/Styles';
import { SongType } from '@/constants/Types';
import { useSettings } from '@/context/SettingsContext';
import { useSongs } from '@/context/SongsContext';
import { delay, getColors } from '@/functions/common';
import { useEffect, useRef, useState } from 'react';
import { Alert, View } from 'react-native';
import * as Progress from 'react-native-progress';
import { checkVersion, fillSongsID, importSongs, loadSavedSongs, loadSettings, saveSettings } from '../functions/resources';

export default function LoadingScreen({ onLoad }: { onLoad: () => void }) {
  console.log('LoadingScreen rendered, onLoad function:', typeof onLoad);
  
  const {settings, setSettings} = useSettings();
  const {songs, setSongs} = useSongs();
  const [loadingText, setLoadingText] = useState('Loading...');
  const [progress, setProgress] = useState(0);
  const [importConfirmed, setImportConfirmed] = useState<string | null>(null);
  const themeColors = getColors();
  
  // Use refs instead of module-level variables to ensure proper closure handling
  const loadedSongsRef = useRef<SongType[]>([]);
  const loadedSettingsRef = useRef<{settings: SettingsType} | null>(null);
  const apiVersionRef = useRef<string>('0');

  const finalizing = async () => {
    console.log('finalizing called, setting up songs library...');
    try {
      setLoadingText('Setting up songs library...');
      setProgress(1);
      console.log('Waiting 1 second before calling onLoad...');
      await delay(1000);
      console.log('finalizing complete, calling onLoad...');
      if (typeof onLoad === 'function') {
        console.log('onLoad is a function, calling it...');
        onLoad();
      } else {
        console.error('onLoad is not a function:', typeof onLoad);
      }
    } catch (error) {
      console.error('Error in finalizing:', error);
      // Try to continue anyway
      console.log('Continuing despite error...');
      if (typeof onLoad === 'function') {
        onLoad();
      }
    }
  }

  const doImportSongs = async (loadedSettings: {settings: SettingsType}, apiVersion: string) => {
    console.log('doImportSongs called with:', { loadedSettings, apiVersion });
    console.log('doImportSongs', loadedSongsRef.current);
    
    // Add a timeout to prevent the function from getting stuck
    // const importTimeout = setTimeout(() => {
    //   console.log('Import timeout reached, finalizing anyway...');
    //   finalizing();
    // }, 60000); // 60 second timeout
    
    try {
      await importSongs(loadedSongsRef.current as SongType[], async (statusCode: number, progress: number, text: string, result?: any) => {
        console.log('importSongs callback:', { statusCode, progress, text, result });
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
          
          console.log('Calling finalizing from doImportSongs...');
          // clearTimeout(importTimeout);
          await finalizing();
        } else if ([4,5].indexOf(statusCode) != -1) {
          setProgress(0.8);
          console.log('Calling finalizing from doImportSongs (status 4/5)...');
          // clearTimeout(importTimeout);
          await finalizing();
        }
      }, loadedSettings.settings);
    } catch (error) {
      console.error('Error in doImportSongs:', error);
      // clearTimeout(importTimeout);
      // If there's an error, try to continue anyway
      setLoadingText('Import failed, continuing anyway...');
      await delay(1000);
      await finalizing();
    }
  }

  useEffect(() => {
    console.log('useEffect triggered with importConfirmed:', importConfirmed);
    
    const onConfirmed = async (confirmed: string|null) => {
      console.log('onConfirmed called with:', confirmed);
      if (!confirmed) {
        console.log('No confirmation, returning early');
        return;
      }
      if (confirmed == 'yes') {
        console.log('Starting import process...');
        try {
          await doImportSongs(loadedSettingsRef.current!, apiVersionRef.current);
        } catch (error) {
          console.error('Error in doImportSongs:', error);
          // Fallback to finalizing if there's an error
          await finalizing();
        }
      } else {
        console.log('User chose not to update, finalizing...');
        try {
          // User chose not to update, so save settings with new version
          const updatedSettings = {...loadedSettingsRef.current!.settings, version: apiVersionRef.current};
          setSettings(updatedSettings);
          saveSettings(updatedSettings);
          
          await finalizing();
        } catch (error) {
          console.error('Error in finalizing after no update:', error);
          // Try to continue anyway
          await finalizing();
        }
      }
    }

    if (importConfirmed) {
      console.log('Calling onConfirmed with:', importConfirmed);
      onConfirmed(importConfirmed).catch((error) => {
        console.error('Error in onConfirmed:', error);
        // Fallback to finalizing if there's an error
        console.log('Calling finalizing due to error in onConfirmed...');
        finalizing();
      });
    }

  }, [importConfirmed]);

  useEffect(() => {
    const doInitialLoad = async () => {
      try {
        console.log('doInitialLoad started');
        setLoadingText('Loading settings...');
        loadedSettingsRef.current = await loadSettings();
        setSettings(loadedSettingsRef.current.settings as SettingsType);

        const savedSongs = await loadSavedSongs();
        if (savedSongs) {
          loadedSongsRef.current = savedSongs;
        } else {
          loadedSongsRef.current = fillSongsID(Songs);
          /*
          const loadedInfo = await loadSongs(Songs);
          loadedSongsRef.current = loadedInfo.songs;
          */
        }
        setSongs(loadedSongsRef.current);
        
        setProgress(0.2);
        
        console.log('Checking version...');
        apiVersionRef.current = await checkVersion(loadedSettingsRef.current.settings.versionUrl);
        console.log('Version check result:', apiVersionRef.current);
        
        const importSongsOnLoad = apiVersionRef.current > loadedSettingsRef.current.settings.version;
        console.log('Import songs on load:', importSongsOnLoad, 'Current version:', loadedSettingsRef.current.settings.version, 'API version:', apiVersionRef.current);
        
        if (importSongsOnLoad) {
          if (loadedSettingsRef.current.settings.version == '0') {
            // Just import songs for very first time
            console.log('First time import, starting import process...');
            await doImportSongs(loadedSettingsRef.current, apiVersionRef.current);
          } else {
            console.log('Showing import confirmation dialog...');
            Alert.alert(
              "Song List Updated",
              "Do you want to import the new list?",
              [
                { 
                  text: "No", 
                  onPress: () => {
                    console.log('User chose No, setting importConfirmed to no');
                    setTimeout(() => {
                      setImportConfirmed('no');
                    }, 200); // delay allows alert to close first
                  }
                },
                { 
                  text: "Yes", 
                  onPress: () => {
                    console.log('User chose Yes, setting importConfirmed to yes');
                    setTimeout(() => {
                      setImportConfirmed('yes');
                    }, 200); // delay allows alert to close first
                  }
                }
              ]
            );

          }
        } else {
          console.log('No import needed, finalizing...');
          await finalizing();
        }
      } catch (error) {
        console.error('Error in doInitialLoad:', error);
        // If there's an error, try to continue anyway
        setLoadingText('Error loading, continuing anyway...');
        await delay(1000);
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
