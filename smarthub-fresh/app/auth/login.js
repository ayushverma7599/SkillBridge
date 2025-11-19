import React, { useState } from 'react';
import { 
  View, 
  StyleSheet, 
  Alert, 
  SafeAreaView, 
  TextInput, 
  TouchableOpacity, 
  Text, 
  ActivityIndicator 
} from 'react-native';
import { useRouter } from 'expo-router';
import { authAPI, storage } from '../../services/api';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('testuser@example.com');
  const [password, setPassword] = useState('Test@123');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    setLoading(true);
    try {
      console.log('Login attempt with:', email);
      
      const response = await authAPI.login({ email, password });
      console.log('Login response:', response.data);

      if (response.data && response.data.token) {
        await storage.setItem('token', response.data.token);
        console.log('✅ Token saved');
      }
      
      if (response.data && response.data.user) {
        await storage.setItem('user', JSON.stringify(response.data.user));
        console.log('✅ User data saved');
      }

      Alert.alert('Success', 'Login successful!');
      router.replace('/(tabs)');
      
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Login failed. Please try again.';
      Alert.alert('Login Error', errorMessage);
      console.error('Login failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Login</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor="#999"
        />
        
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
          placeholderTextColor="#999"
        />
        
        <TouchableOpacity 
          style={styles.loginButton} 
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.loginButtonText}>Login</Text>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity onPress={() => router.push('/auth/register')}>
          <Text style={styles.registerLink}>Don't have an account? Register</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 32, fontWeight: 'bold', marginBottom: 30, textAlign: 'center', color: '#333' },
  input: { backgroundColor: '#fff', borderRadius: 10, padding: 15, marginBottom: 15, borderWidth: 1, borderColor: '#ddd', fontSize: 16, color: '#333' },
  loginButton: { backgroundColor: '#007AFF', borderRadius: 10, padding: 15, alignItems: 'center', marginTop: 20 },
  loginButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  registerLink: { color: '#007AFF', textAlign: 'center', marginTop: 15, fontSize: 14 },
});
