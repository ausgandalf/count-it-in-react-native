import { getCommonStyles } from '@/constants/Styles';
import { SongType } from '@/constants/Types';
import { alert, getColors } from '@/functions/common';
import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

type SongFormProps = {
  inputRef?: React.RefObject<TextInput>;
  song?: null | SongType;
  onSubmit: (song: { id: string, name: string; artist: string; bpm: number }) => void;
  onCancel?: () => void;
};

export default function SongForm({ inputRef, song, onSubmit, onCancel }: SongFormProps) {
  const [title, setTitle] = useState(song?.name || '');
  const [artist, setArtist] = useState(song?.artist || '');
  const [bpm, setBpm] = useState((song && song.bpm) ? '' + song.bpm : `120`);
  const [songId, setSongId] = useState(song?.id || '');

  useEffect(() => {
    setTitle(song?.name || '');
    setArtist(song?.artist || '');
    setBpm((song && song.bpm) ? '' + song.bpm : `120`);
    setSongId(song?.id || '');
  }, [song]);

  const handleSave = () => {
    if (!title.trim() || !artist.trim()) {
      alert('Missing info', 'Please fill in all fields.');
      return;
    }

    if (isNaN(Number(bpm)) || (Number(bpm) < 40) || (Number(bpm) > 240)) {
      alert('Please fill in all fields correctly. BPM must be between 40 and 240.');
      return;
    }

    onSubmit({ id:songId, name: title.trim(), artist: artist.trim(), bpm: isNaN(Number(bpm)) ? 120 : Number(bpm) });
  };
  
  const themeColors = getColors();
  const placeholderTextColor = themeColors.input.placeholder;
  const commonStyles = getCommonStyles();

  return (
    <View style={[styles.container, commonStyles.bg]}>
      <View style={styles.row}>
        <Text style={commonStyles.text}>Title</Text>
        <TextInput
          ref={inputRef}
          value={title}
          onChangeText={setTitle}
          style={commonStyles.inputText}
          placeholder="Enter song title"
          placeholderTextColor={placeholderTextColor}
        />
      </View>

      <View style={styles.row}>
        <Text style={commonStyles.text}>Artist</Text>
        <TextInput
          value={artist}
          onChangeText={setArtist}
          style={commonStyles.inputText}
          placeholder="Enter artist name"
          placeholderTextColor={placeholderTextColor}
        />
      </View>

      <View style={styles.row}>
        <Text style={commonStyles.text}>BPM</Text>
        <TextInput
          value={bpm}
          onChangeText={setBpm}
          style={commonStyles.inputText}
          placeholder="Enter BPM"
          placeholderTextColor={placeholderTextColor}
          keyboardType="numeric"
        />
      </View>
      
      <View style={styles.buttonRow}>
        <TouchableOpacity style={[commonStyles.button, commonStyles.primaryButton]} onPress={handleSave}>
          <Text style={[commonStyles.buttonText]}>Save</Text>
        </TouchableOpacity>

        {onCancel && (
          <TouchableOpacity style={[commonStyles.button, commonStyles.tertiaryButton]} onPress={onCancel}>
            <Text style={[commonStyles.buttonText]}>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderRadius: 12,
    gap: 20,
  },
  row: {
    gap: 6,
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 20,
    justifyContent: 'flex-end',
    gap: 10,
  },
});
