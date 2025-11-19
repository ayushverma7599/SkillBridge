import { Stack } from 'expo-router';
import { Provider as PaperProvider } from 'react-native-paper';
import { useEffect } from 'react';
import socketService from '../services/socketService';

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
    <PaperProvider>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="auth/login" options={{ headerShown: false }} />
        <Stack.Screen name="auth/register" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </PaperProvider>
  );
}
