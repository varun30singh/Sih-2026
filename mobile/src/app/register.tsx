import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { api } from '../lib/api';

interface CreatedUser {
  id: number;
  phone: string;
  role: string;
}

interface CreateUserResponse {
  success?: boolean;
  data?: CreatedUser;
  message?: string;
}

interface CreateFarmerResponse {
  success?: boolean;
  data?: {
    id: number;
    name: string;
    phone?: string;
    village?: string;
    id_proof?: string;
    user_id?: number;
  };
  message?: string;
}

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [aadhaar, setAadhaar] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] =
    useState('');
  const [village, setVillage] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    const cleanName = name.trim();
    const cleanAadhaar = aadhaar.replace(/\s/g, '');
    const cleanPhone = phone.trim();
    const cleanPassword = password;
    const cleanConfirmPassword = confirmPassword;
    const cleanVillage = village.trim();

    if (
      !cleanName ||
      !cleanAadhaar ||
      !cleanPhone ||
      !cleanPassword ||
      !cleanConfirmPassword ||
      !cleanVillage
    ) {
      Alert.alert(
        'Missing Information',
        'Please fill in all fields.',
      );
      return;
    }

    if (!/^\d{12}$/.test(cleanAadhaar)) {
      Alert.alert(
        'Invalid Aadhaar',
        'Please enter a valid 12-digit Aadhaar number.',
      );
      return;
    }

    if (!/^\d{10}$/.test(cleanPhone)) {
      Alert.alert(
        'Invalid Mobile Number',
        'Please enter a valid 10-digit mobile number.',
      );
      return;
    }

    if (cleanPassword.length < 6) {
      Alert.alert(
        'Weak Password',
        'Password must contain at least 6 characters.',
      );
      return;
    }

    if (cleanPassword !== cleanConfirmPassword) {
      Alert.alert(
        'Password Mismatch',
        'Password and Confirm Password do not match.',
      );
      return;
    }

    try {
      setLoading(true);

      /*
       * STEP 1
       * Create the login user in the existing
       * PostgreSQL users table.
       */
      const userResponse =
        await api.post<CreateUserResponse>(
          '/users',
          {
            phone: cleanPhone,
            password: cleanPassword,
            role: 'farmer',
            preferred_language: 'en',
          },
        );

      console.log(
        'USER REGISTRATION RESPONSE:',
        userResponse,
      );

      const user =
        userResponse.data;

      if (!user?.id) {
        throw new Error(
          userResponse.message ||
            'User account could not be created.',
        );
      }

      /*
       * STEP 2
       * Create the farmer profile using the
       * same user ID.
       */
      const farmerResponse =
        await api.post<CreateFarmerResponse>(
          '/farmers/register',
          {
            user_id: user.id,
            name: cleanName,
            mobile: cleanPhone,
            phone: cleanPhone,
            village: cleanVillage,
            id_proof: cleanAadhaar,
          },
        );

      console.log(
        'FARMER REGISTRATION RESPONSE:',
        farmerResponse,
      );

      const farmer =
        farmerResponse.data;

      if (!farmer?.id) {
        throw new Error(
          farmerResponse.message ||
            'Farmer profile could not be created.',
        );
      }

      Alert.alert(
        'Account Created Successfully',
        `Your farmer account has been created.\n\nFarmer ID: ${farmer.id}\n\nYou can now login using your mobile number and password.`,
        [
          {
            text: 'Go to Login',
            onPress: () => {
              router.replace('/');
            },
          },
        ],
      );
    } catch (error) {
      console.error(
        'REGISTRATION ERROR:',
        error,
      );

      const message =
        error instanceof Error
          ? error.message
          : 'Registration failed.';

      Alert.alert(
        'Registration Failed',
        message,
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : undefined
        }
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Pressable
              style={styles.backButton}
              onPress={() => router.back()}
              disabled={loading}
            >
              <Text style={styles.backText}>
                ‹
              </Text>
            </Pressable>

            <View style={styles.headerText}>
              <Text style={styles.logo}>
                MandiMitra
              </Text>

              <Text style={styles.subtitle}>
                Farmer Registration
              </Text>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.title}>
              Create Farmer Account
            </Text>

            <Text style={styles.description}>
              Create your MandiMitra account using
              your mobile number and password.
            </Text>

            <Text style={styles.label}>
              Full Name *
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Enter your full name"
              placeholderTextColor="#8A938D"
              value={name}
              onChangeText={setName}
              editable={!loading}
              autoCapitalize="words"
            />

            <Text style={styles.label}>
              Aadhaar Number *
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Enter 12-digit Aadhaar number"
              placeholderTextColor="#8A938D"
              value={aadhaar}
              onChangeText={setAadhaar}
              keyboardType="number-pad"
              maxLength={12}
              editable={!loading}
            />

            <Text style={styles.label}>
              Mobile Number *
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Enter 10-digit mobile number"
              placeholderTextColor="#8A938D"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              maxLength={10}
              editable={!loading}
            />

            <Text style={styles.label}>
              Password *
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Create a password"
              placeholderTextColor="#8A938D"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />

            <Text style={styles.passwordHint}>
              Minimum 6 characters
            </Text>

            <Text style={styles.label}>
              Confirm Password *
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Re-enter your password"
              placeholderTextColor="#8A938D"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />

            <Text style={styles.label}>
              Village *
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Enter your village"
              placeholderTextColor="#8A938D"
              value={village}
              onChangeText={setVillage}
              editable={!loading}
              autoCapitalize="words"
            />

            <Pressable
              style={({ pressed }) => [
                styles.registerButton,
                pressed &&
                  styles.buttonPressed,
                loading &&
                  styles.buttonDisabled,
              ]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator
                  color="#FFFFFF"
                />
              ) : (
                <Text
                  style={styles.registerText}
                >
                  Create Farmer Account
                </Text>
              )}
            </Pressable>

            <Pressable
              style={styles.loginButton}
              onPress={() =>
                router.replace('/')
              }
              disabled={loading}
            >
              <Text style={styles.loginText}>
                Already have an account? Login
              </Text>
            </Pressable>
          </View>

          <Text style={styles.footer}>
            Your account is connected to the
            existing MandiMitra database.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F7F4',
  },

  keyboard: {
    flex: 1,
  },

  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    paddingBottom: 40,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  backText: {
    fontSize: 34,
    lineHeight: 38,
  },

  headerText: {
    flex: 1,
  },

  logo: {
    fontSize: 30,
    fontWeight: '700',
  },

  subtitle: {
    marginTop: 3,
    fontSize: 14,
    color: '#68736B',
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 24,
    elevation: 4,
  },

  title: {
    fontSize: 25,
    fontWeight: '700',
  },

  description: {
    marginTop: 7,
    marginBottom: 24,
    fontSize: 14,
    color: '#68736B',
    lineHeight: 20,
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
    marginBottom: 8,
    backgroundColor: '#FAFBF9',
    color: '#111111',
  },

  passwordHint: {
    fontSize: 11,
    color: '#89928B',
    marginBottom: 17,
  },

  registerButton: {
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1F6B45',
    marginTop: 10,
  },

  buttonPressed: {
    opacity: 0.8,
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  registerText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  loginButton: {
    alignItems: 'center',
    marginTop: 18,
    paddingVertical: 8,
  },

  loginText: {
    color: '#1F6B45',
    fontSize: 14,
    fontWeight: '600',
  },

  footer: {
    textAlign: 'center',
    marginTop: 18,
    fontSize: 11,
    color: '#89928B',
    lineHeight: 16,
  },
});