import { Colors } from '@/constants/Colors';
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
  return Colors[forcedTheme ?? useColorScheme() ?? 'dark'];
}

export function getLogo(forcedTheme: 'light' | 'dark' | null = null) {
  return (forcedTheme ?? useColorScheme() ?? 'dark') === 'dark' ? require('../assets/images/logo.png') : require('../assets/images/logo--blue.png');
}