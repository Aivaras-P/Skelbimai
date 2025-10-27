import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useUserContext } from '../../context/UserContext';

export default function RegisterScreen() {
  const { register } = useUserContext();
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [error, setError] = useState<string | null>(null);

const handleRegister = async () => {
  const result = await register(username, password, password2);
  if (result) {
    Alert.alert('Klaida', result);
  } else {
    Alert.alert('Sveikiname!', 'Sėkmingai prisiregistravote!');
    router.replace('/'); // pakeičiam ekraną
  }
};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registracija</Text>
      {error && <Text style={styles.error}>{error}</Text>}

      <TextInput placeholder="Vartotojo vardas" style={styles.input} value={username} onChangeText={setUsername} />
      <TextInput placeholder="Slaptažodis" secureTextEntry style={styles.input} value={password} onChangeText={setPassword} />
      <TextInput placeholder="Pakartokite slaptažodį" secureTextEntry style={styles.input} value={password2} onChangeText={setPassword2} />

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Registruotis</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.link}>Grįžti atgal</Text>
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
