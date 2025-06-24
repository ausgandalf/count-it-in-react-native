import { SongType } from '@/constants/Types';
import {
  Alert,
  Platform
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

export function isSongExists(list:SongType[], song:SongType) {
  for (let i=0; i<list.length; i++) {
    if (list[i].name == song.name && list[i].artist == song.artist) {
      return true;
    }
  }
  return false;
}

export function generateSongID(song: SongType, type: 'core'|'custom') {
  return `${type}-${song.name}-${song.artist}`
}

export function delay(ms:number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}