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