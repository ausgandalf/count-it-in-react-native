import { Colors } from '@/constants/Colors';
import { SettingsType } from '@/constants/Settings';
import { useSettings } from '@/context/SettingsContext';
import {
  Alert,
  Platform,
  useColorScheme
} from 'react-native';

export const alert = (title:string, message: string = '') => {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n${message}`);
  } else {
    Alert.alert(title, message);
  }
}

export const confirm = (title:string, message: string, onOkay = () => {}) => {
  if (Platform.OS === 'web') {
    if (window.confirm(message)) onOkay();
  } else {
    Alert.alert(
      title,
      message,
      [
        { text: "Cancel", style: "cancel" },
        { text: "OK", onPress: onOkay }
      ],
      { cancelable: true }
    );
  }
}

export function delay(ms:number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function getColors(forcedTheme: 'light' | 'dark' | null = null) {
  const {settings} = useSettings()! as {settings: SettingsType, setSettings: (settings: SettingsType) => void};
  let theme = useColorScheme() ?? 'dark';
  if (settings && settings.theme != '') theme = settings.theme;

  return Colors[forcedTheme ?? theme];
}

export function getLogo(forcedTheme: 'light' | 'dark' | null = null) {
  const {settings} = useSettings()! as {settings: SettingsType, setSettings: (settings: SettingsType) => void};
  let theme = useColorScheme() ?? 'dark';
  if (settings && settings.theme != '') theme = settings.theme;
  
  return (forcedTheme ?? theme) === 'dark' ? require('../assets/images/logo.png') : require('../assets/images/logo--blue.png');
}