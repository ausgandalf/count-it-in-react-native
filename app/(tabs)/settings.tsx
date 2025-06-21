import { StyleSheet, Text, TextInput, View } from 'react-native';

import { useState } from 'react';
export default function SettingsScreen() {
  const [url, setUrl] = useState('https://default-song-list.com');

  return (
    <View className="flex-1 p-4">
      <Text className="mb-2 text-lg">Song List URL</Text>
      <TextInput
        className="border p-2 rounded"
        value={url}
        onChangeText={setUrl}
        autoCapitalize="none"
        keyboardType="url"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
});
