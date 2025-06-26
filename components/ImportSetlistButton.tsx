import { getCommonStyles } from '@/constants/Styles';
import { alert } from '@/functions/common';
import { parseSetlistCSV } from '@/functions/files';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import React from 'react';
import { Platform, Text, TouchableOpacity } from 'react-native';

export default function ImportSetlistButton({ buttonText='Import', onSuccess }:{
  buttonText?: string,
  onSuccess: (type:string, v:any) => void,
}) {
  
  const commonStyles = getCommonStyles();

  const handleImport = async () => {
    // Confirm dialog
    // let addNewSongs = false;
    // await new Promise((resolve) => {
    //   Alert.alert(
    //     'Import Songs',
    //     'Would you like to add new songs to main library?',
    //     [
    //       { text: 'No', onPress: () => { addNewSongs = false; resolve(); }, style: 'cancel' },
    //       { text: 'Yes', onPress: () => { addNewSongs = true; resolve(); } },
    //     ],
    //     { cancelable: false }
    //   );
    // });

    // Pick the file
    const result:DocumentPicker.DocumentPickerResult = await DocumentPicker.getDocumentAsync({ type: 'text/csv' });
    console.log(result);
    if (result.assets && result.assets.length > 0) {
      try {
        let content = '';
        if (Platform.OS === 'web') {
          const webFile = result.assets[0].file as File;
          content = await webFile.text();
        } else {
          content = await FileSystem.readAsStringAsync(result.assets[0].uri);
        }
        const setlists = parseSetlistCSV(content);
        const importedSongs = setlists && setlists['imported'] ? setlists['imported'].songs : [];
        console.log(importedSongs);
        onSuccess('importSongs', importedSongs);

      } catch (err) {
        console.error('Failed to read file', err);
        alert('Failed to open file.');
      }
    }
  };

  return (
    <TouchableOpacity style={[commonStyles.buttonSm, commonStyles.secondaryButton]} onPress={handleImport}>
      <Text style={commonStyles.buttonText}>{buttonText}</Text>
    </TouchableOpacity>
  );
}
