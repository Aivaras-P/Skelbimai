import { Stack } from 'expo-router';
import { AdProvider } from '../context/AdContext';
import { UserProvider } from '../context/UserContext';

export default function Layout() {
  return (
    <UserProvider>
      <AdProvider>
        <Stack screenOptions={{ headerShown: true }}>
          <Stack.Screen name="index" options={{ title: 'Skelbimai' }} />
          <Stack.Screen name="add" options={{ title: 'Pridėti skelbimą' }} />
          <Stack.Screen
            name="auth/login"
            options={{ headerTitle: 'Prisijungimas' }}
          />
          <Stack.Screen
            name="auth/register"
            options={{ headerTitle: 'Registracija' }}
          />
          <Stack.Screen name="ad/[id]" options={{ title: 'Skelbimo informacija' }} />
        </Stack>
      </AdProvider>
    </UserProvider>
  );
}
