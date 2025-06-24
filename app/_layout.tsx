import LayoutTop from '@/components/LayoutTop';
import { ThemedText } from '@/components/ThemedText';
import { getCommonStyles } from '@/constants/Styles';
import { SettingsProvider } from '@/context/SettingsContext';
import { SongsProvider } from '@/context/SongsContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const commonStyles = getCommonStyles();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const [loading, setLoading] = useState(true);

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <GestureHandlerRootView>
      <ThemeProvider value={true || colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <SettingsProvider>
          <SongsProvider>
            {loading ? (
              <View style={[{flex: 1, justifyContent: 'center', alignItems: 'center', gap: 40,}, commonStyles.bg]}>
                <View style={{width: '100%', gap: 20}}>
                  <LayoutTop />
                </View>
                <View style={{gap: 20}}>
                  <ActivityIndicator size="large" color="#0000ff" />
                  <ThemedText style={{ marginTop: 10 }}>Loading...</ThemedText>
                </View>
              </View>
            ) : (
              <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="+not-found" />
              </Stack>
            )}
          </SongsProvider>
          <StatusBar style="auto" />
        </SettingsProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
