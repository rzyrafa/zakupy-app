import { Pacifico_400Regular } from '@expo-google-fonts/pacifico';
import { SpaceMono_400Regular, SpaceMono_700Bold } from '@expo-google-fonts/space-mono';
import { useFonts } from 'expo-font';
import { DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { SQLiteProvider } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { KeyboardProvider } from 'react-native-keyboard-controller';

import { bandHeader } from '@/constants/navigation';
import { Palette } from '@/constants/theme';
import { DATABASE_NAME, migrateDb } from '@/db/schema';

SplashScreen.preventAutoHideAsync();

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: Palette.ink,
    background: Palette.cream,
    card: Palette.cream,
    text: Palette.ink,
    border: Palette.ink,
  },
};

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({ SpaceMono_400Regular, SpaceMono_700Bold, Pacifico_400Regular });
  const ready = fontsLoaded || !!fontError;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  return (
    <KeyboardProvider>
    <ThemeProvider value={navigationTheme}>
      <SQLiteProvider databaseName={DATABASE_NAME} onInit={migrateDb}>
        <Stack screenOptions={{ ...bandHeader(Palette.cream), headerBackTitle: 'Wróć' }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="recipe/[id]" options={{ ...bandHeader(Palette.sunshine), title: 'Przepis' }} />
          <Stack.Screen name="recipe/edit/[id]" options={{ ...bandHeader(Palette.sunshine), title: 'Edytuj przepis' }} />
          <Stack.Screen name="settings" options={{ ...bandHeader(Palette.lavender), title: 'Ustawienia' }} />
        </Stack>
      </SQLiteProvider>
      <StatusBar style="dark" />
    </ThemeProvider>
    </KeyboardProvider>
  );
}
