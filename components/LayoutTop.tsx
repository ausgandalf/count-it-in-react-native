import React from 'react';
import { Image, StyleSheet, useColorScheme, View } from 'react-native';

export default function LayoutTop() {
  const colorScheme = useColorScheme();
  const logo = colorScheme === 'dark' ? require('../assets/images/logo.png') : require('../assets/images/logo--blue.png');
  return (
    <View style={styles.top}>
      <Image
        source={logo} // or use a remote URL
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
    marginBlockEnd: 20,
    width: '100%',
  },
});