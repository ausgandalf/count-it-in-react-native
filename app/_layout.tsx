import { SettingsProvider } from '@/context/SettingsContext';
import { SongsProvider } from '@/context/SongsContext';
import { delay } from '@/functions/common';
import { useColorScheme } from '@/hooks/useColorScheme';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import LoadingScreen from './loading';

// Prevent the native splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [appReady, setAppReady] = useState(false);
  const colorScheme = useColorScheme();

  useEffect(() => {
    async function prepareApp() {
      try {
        await delay(2000);
      } catch (e) {
        console.warn(e);
      } finally {
        setAppReady(true);
        await SplashScreen.hideAsync();
      }
    }
    prepareApp();
  }, []);
  
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const [loading, setLoading] = useState(true);

  if (!loaded || !appReady) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <GestureHandlerRootView>
      <ThemeProvider value={true || colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <SettingsProvider>
          <SongsProvider>
            {loading ? (
              <LoadingScreen onLoad={() => setLoading(false)} />
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
