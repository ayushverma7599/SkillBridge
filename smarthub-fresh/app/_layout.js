import { Stack } from 'expo-router';
import { MD3LightTheme, Provider as PaperProvider } from 'react-native-paper';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import socketService from '../services/socketService';
import { colors, paperTheme } from '../constants/appTheme';

const theme = {
  ...MD3LightTheme,
  colors: { ...MD3LightTheme.colors, ...paperTheme.colors },
  roundness: paperTheme.roundness,
};

export default function RootLayout() {
  useEffect(() => {
    // Connect socket when app starts
    socketService.connect();

    return () => {
      // Disconnect when app closes
      socketService.disconnect();
    };
  }, []);

  return (
    <PaperProvider theme={theme}>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          contentStyle: { backgroundColor: colors.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="auth/login" options={{ headerShown: false }} />
        <Stack.Screen name="auth/register" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="project/[id]"
          options={{
            title: 'Project Details',
            headerStyle: { backgroundColor: colors.surface },
            headerTintColor: colors.text,
            headerTitleStyle: { fontWeight: '700' },
            headerShadowVisible: false,
          }}
        />
        <Stack.Screen
          name="learning/quiz"
          options={{
            title: 'Diagnostic Quiz',
            headerStyle: { backgroundColor: colors.surface },
            headerTintColor: colors.text,
            headerTitleStyle: { fontWeight: '700' },
            headerShadowVisible: false,
          }}
        />
      </Stack>
    </PaperProvider>
  );
}
