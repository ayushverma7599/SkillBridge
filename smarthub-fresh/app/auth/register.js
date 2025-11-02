// frontend/app/auth/register.js

import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Menu, Button } from 'react-native-paper';

export default function RegisterScreen() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'student'
  });

  const [userTypeMenuVisible, setUserTypeMenuVisible] = useState(false);

  const userTypeOptions = [
    { label: 'Student', value: 'student' },
    { label: 'Freelancer', value: 'freelancer' },
    { label: 'Admin', value: 'admin' }
  ];

  const handleRegister = async () => {
    if (!formData.fullName || !formData.email || !formData.password) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    // TODO: Implement registration logic
    Alert.alert('Info', 'Registration functionality to be implemented');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Create Account</Text>

      <TextInput
        style={styles.input}
        placeholder="Full Name"
        value={formData.fullName}
        onChangeText={(text) => setFormData({ ...formData, fullName: text })}
      />

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={formData.email}
        onChangeText={(text) => setFormData({ ...formData, email: text })}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={formData.password}
        onChangeText={(text) => setFormData({ ...formData, password: text })}
        secureTextEntry
      />

      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        value={formData.confirmPassword}
        onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
        secureTextEntry
      />

      {/* User Type Dropdown using React Native Paper Menu */}
      <View style={styles.pickerContainer}>
        <Menu
          visible={userTypeMenuVisible}
          onDismiss={() => setUserTypeMenuVisible(false)}
          anchor={
            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => setUserTypeMenuVisible(true)}
            >
              <Text style={styles.menuButtonText}>
                {userTypeOptions.find(opt => opt.value === formData.userType)?.label || 'Select User Type'}
              </Text>
            </TouchableOpacity>
          }
        >
          {userTypeOptions.map((option) => (
            <Menu.Item
              key={option.value}
              onPress={() => {
                setFormData({ ...formData, userType: option.value });
                setUserTypeMenuVisible(false);
              }}
              title={option.label}
            />
          ))}
        </Menu>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.link}>Already have an account? Login</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    marginTop: 50,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    marginBottom: 15,
    borderRadius: 8,
    fontSize: 16,
  },
  pickerContainer: {
    marginBottom: 15,
  },
  menuButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  menuButtonText: {
    fontSize: 16,
    color: '#333',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
  },
  link: {
    color: '#007AFF',
    textAlign: 'center',
    marginBottom: 30,
    fontSize: 16,
  },
});
