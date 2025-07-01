import LayoutTop from '@/components/LayoutTop';
import { ThemedText } from '@/components/ThemedText';
import { getCommonStyles } from '@/constants/Styles';
import { useSettings } from '@/context/SettingsContext';
import { useSongs } from '@/context/SongsContext';
import { getColors } from '@/functions/common';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import * as Progress from 'react-native-progress';
import 'react-native-reanimated';
import { importSongs, loadSettings } from '../functions/resources';

export default function LoadingScreen({ onLoad }: { onLoad: () => void }) {
  const themeColors = getColors();
  const {settings, setSettings} = useSettings();
  const {songs, setSongs} = useSongs()!;
  const [loadingText, setLoadingText] = useState('Loading...');
  const [progress, setProgress] = useState(0);

  const finalizing = async () => {
    setLoadingText('Setting up songs library...');
    setProgress(1);
    onLoad();
  }

  useEffect(() => {
    const doInitialLoad = async () => {

      setLoadingText('Loading settings...');
      const loadedSettings = await loadSettings();
      setSettings(loadedSettings.settings);
      setProgress(0.2);

      importSongs(songs, async (statusCode: number, progress: number, text: string, result?: any) => {
        if (statusCode == 1) {
          setLoadingText('Updating songs library...');
        } else if (statusCode == 2) {
          setLoadingText(text);
          setProgress(0.2 + 0.6 * progress);
        } else if (statusCode == 3) {
          setLoadingText(text);
          setProgress(0.8);
          await finalizing();
        } else if ([4,5].indexOf(statusCode) != -1) {
          setProgress(0.8);
          await finalizing();
        }
      }, loadedSettings.settings);
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
