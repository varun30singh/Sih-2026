import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
  Stack,
} from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider
      value={
        colorScheme === 'dark'
          ? DarkTheme
          : DefaultTheme
      }
    >
      <AnimatedSplashOverlay />

      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen
          name="index"
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="register"
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="home"
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="smart-centres"
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="book-slot"
          options={{
            headerShown: true,
            title: 'Book Slot',
            headerStyle: {
              backgroundColor: '#F5F7F4',
            },
            headerTintColor: '#1F6B45',
            headerTitleStyle: {
              fontWeight: '700',
            },
            headerShadowVisible: false,
          }}
        />

        <Stack.Screen
          name="queue"
          options={{
            headerShown: true,
            title: 'My Queue',
            headerStyle: {
              backgroundColor: '#F5F7F4',
            },
            headerTintColor: '#1F6B45',
            headerTitleStyle: {
              fontWeight: '700',
            },
            headerShadowVisible: false,
          }}
        />

        <Stack.Screen
          name="payments"
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="history"
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="profile"
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="notifications"
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="chat"
          options={{
            headerShown: true,
            title: 'Krish AI',
            headerStyle: {
              backgroundColor: '#F5F7F4',
            },
            headerTintColor: '#1F6B45',
            headerTitleStyle: {
              fontWeight: '700',
            },
            headerShadowVisible: false,
          }}
        />

        <Stack.Screen
          name="chatbot"
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="explore"
          options={{ headerShown: false }}
        />
      </Stack>
    </ThemeProvider>
  );
}
