import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useUserContext } from '../../context/UserContext';

export default function LoginScreen() {
  const { login } = useUserContext();
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

const handleLogin = async () => {
  const result = await login(username, password);
  if (result) {
    Alert.alert('Klaida', result);
  } else {
    Alert.alert(`Prisijungėte kaip ${username}`);
    // Naudojame replace, kad išjungtume galimybę grįžti
    router.replace('/'); // nukreipiame į HomeScreen
  }
};


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Prisijungimas</Text>
      {error && <Text style={styles.error}>{error}</Text>}

      <TextInput placeholder="Vartotojo vardas" style={styles.input} value={username} onChangeText={setUsername} />
      <TextInput placeholder="Slaptažodis" secureTextEntry style={styles.input} value={password} onChangeText={setPassword} />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Prisijungti</Text>
      </TouchableOpacity>

<TouchableOpacity onPress={() => router.push({ pathname: '/auth/register' })}>
  <Text style={styles.link}>Neturi paskyros? Registruokis</Text>
</TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: '600', marginBottom: 20, textAlign: 'center' },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, marginBottom: 10, padding: 10 },
  button: { backgroundColor: '#007AFF', padding: 12, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '600' },
  link: { textAlign: 'center', color: '#007AFF', marginTop: 10 },
  error: { color: 'red', marginBottom: 10, textAlign: 'center' },
});
