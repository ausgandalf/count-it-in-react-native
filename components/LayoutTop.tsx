import { getLogo } from '@/functions/common';
import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

export default function LayoutTop() {
  return (
    <View style={styles.top}>
      <Image
        source={getLogo()} // or use a remote URL
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  logo: {
    width: '80%',
  },
  top: {
    alignItems: 'center',
    gap: 10,
    height: 85,
    marginBlockStart: 0,
    marginBlockEnd: 10,
    width: '100%',
  },
});