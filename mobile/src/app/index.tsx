import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { login } from '../lib/auth';

export default function LoginScreen() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  async function handleLogin() {
    const cleanPhone = phone.trim();
    const cleanPassword = password.trim();

    setErrorMessage('');

    if (!cleanPhone || !cleanPassword) {
      setErrorMessage(
        'Please enter phone number and password.',
      );
      return;
    }

    try {
      setLoading(true);

      console.log('LOGIN BUTTON PRESSED');
      console.log('LOGIN REQUEST STARTING');

      const result = await login(
        cleanPhone,
        cleanPassword,
      );

      console.log(
        'LOGIN SUCCESS:',
        result.user,
      );

      router.replace('/home');
    } catch (error) {
      console.error(
        'LOGIN ERROR:',
        error,
      );

      const message =
        error instanceof Error
          ? error.message
          : 'Unknown login error';

      setErrorMessage(message);

      Alert.alert(
        'Login Error',
        message,
      );
    } finally {
      setLoading(false);
    }
  }

  function openRegister() {
    router.push('/register');
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : undefined
        }
      >
        <View style={styles.header}>
          <Text style={styles.logo}>
            MandiMitra
          </Text>

          <Text style={styles.subtitle}>
            Smart Procurement for Farmers
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>
            Farmer Login
          </Text>

          <Text style={styles.label}>
            Mobile Number
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Enter mobile number"
            placeholderTextColor="#8A938D"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
          />

          <Text style={styles.label}>
            Password
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Enter password"
            placeholderTextColor="#8A938D"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
          />

          <Pressable
            style={({ pressed }) => [
              styles.loginButton,
              pressed && styles.buttonPressed,
              loading && styles.buttonDisabled,
            ]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.loginButtonText}>
                Login
              </Text>
            )}
          </Pressable>

          {errorMessage ? (
            <Text style={styles.errorText}>
              {errorMessage}
            </Text>
          ) : null}

          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.orText}>
              OR
            </Text>
            <View style={styles.divider} />
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.createAccountButton,
              pressed && styles.createAccountPressed,
              loading && styles.buttonDisabled,
            ]}
            onPress={openRegister}
            disabled={loading}
          >
            <Text style={styles.createAccountText}>
              Create Account
            </Text>
          </Pressable>

          <Text style={styles.info}>
            Connected to MandiMitra backend
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F7F4',
  },

  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },

  header: {
    alignItems: 'center',
    marginBottom: 30,
  },

  logo: {
    fontSize: 36,
    fontWeight: '700',
  },

  subtitle: {
    fontSize: 15,
    color: '#666666',
    marginTop: 8,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 24,
    elevation: 4,
  },

  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 24,
  },

  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 7,
  },

  input: {
    height: 52,
    borderWidth: 1,
    borderColor: '#D7DCD5',
    borderRadius: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 18,
    backgroundColor: '#FAFBF9',
    color: '#111111',
  },

  loginButton: {
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1F6B45',
    marginTop: 4,
  },

  buttonPressed: {
    opacity: 0.8,
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },

  errorText: {
    color: '#C62828',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 14,
    lineHeight: 19,
  },

  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },

  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#E1E5E1',
  },

  orText: {
    marginHorizontal: 12,
    fontSize: 12,
    color: '#89928B',
    fontWeight: '600',
  },

  createAccountButton: {
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#1F6B45',
    backgroundColor: '#FFFFFF',
  },

  createAccountPressed: {
    opacity: 0.7,
  },

  createAccountText: {
    color: '#1F6B45',
    fontSize: 16,
    fontWeight: '700',
  },

  info: {
    textAlign: 'center',
    marginTop: 18,
    color: '#6B756C',
    fontSize: 12,
  },
});