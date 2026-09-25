import AsyncStorage from '@react-native-async-storage/async-storage';

import { api } from './api';

const TOKEN_KEY = 'mandimitra_auth_token';
const USER_KEY = 'mandimitra_user';

export interface AuthUser {
  id: number;
  phone: string;
  email?: string | null;
  role: string;
  created_at?: string;
  preferred_language?: string;
}

interface LoginResponse {
  success: boolean;
  data: {
    access_token: string;
    user: AuthUser;
  };
  message?: string;
}

export async function login(
  phone: string,
  password: string,
) {
  const response = await api.post<LoginResponse>(
    '/auth/login',
    {
      phone,
      password,
    },
  );

  if (!response.success) {
    throw new Error(
      response.message || 'Login failed',
    );
  }

  const accessToken =
    response.data?.access_token;

  const user = response.data?.user;

  if (!accessToken) {
    throw new Error(
      'Backend did not return an access token.',
    );
  }

  if (!user?.id) {
    throw new Error(
      'Backend did not return the user.',
    );
  }

  await AsyncStorage.setItem(
    TOKEN_KEY,
    accessToken,
  );

  await AsyncStorage.setItem(
    USER_KEY,
    JSON.stringify(user),
  );

  return {
    access_token: accessToken,
    user,
  };
}

export async function getStoredToken() {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function getStoredUser(): Promise<AuthUser | null> {
  const value =
    await AsyncStorage.getItem(USER_KEY);

  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as AuthUser;
  } catch {
    return null;
  }
}

export async function logout() {
  await AsyncStorage.multiRemove([
    TOKEN_KEY,
    USER_KEY,
  ]);
}