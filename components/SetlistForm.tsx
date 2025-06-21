import { alert } from '@/app/functions/common';
import { Colors } from '@/constants/Colors';
import { getCommonStyles } from '@/constants/Styles';
import { SetlistType } from '@/constants/Types';
import { useColorScheme } from '@/hooks/useColorScheme';
import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

type SetlistFormProps = {
  inputRef?: React.RefObject<TextInput>;
  setlist?: null | SetlistType;
  onSubmit: (setlist: { id: string, name: string; }) => void;
  onCancel?: () => void;
};

export default function SetlistForm({ inputRef, setlist, onSubmit, onCancel }: SetlistFormProps) {
  const [title, setTitle] = useState(setlist?.name || '');
  const [setlistId, setSetlistId] = useState(setlist?.id || '');

  useEffect(() => {
    setTitle(setlist?.name || '');
    setSetlistId(setlist?.id || '');
  }, [setlist]);

  const handleSave = () => {
    if (!title.trim()) {
      alert('Missing info', 'Please fill in the title field.');
      return;
    }

    onSubmit({ id:setlistId, name: title.trim() });
  };

  const colorScheme = useColorScheme();
  const placeholderTextColor = Colors[colorScheme ?? 'light'].input.placeholder;
  const commonStyles = getCommonStyles();

  return (
    <View style={[styles.container, commonStyles.bg]}>
      <View style={styles.row}>
        <Text style={commonStyles.text}>Setlist Name</Text>
        <TextInput
          ref={inputRef}
          value={title}
          onChangeText={setTitle}
          style={commonStyles.inputText}
          placeholder="Enter setlist name"
          placeholderTextColor={placeholderTextColor}
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
