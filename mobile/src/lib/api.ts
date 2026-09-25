const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  'http://192.168.1.38:4000/api';

type RequestMethod =
  | 'GET'
  | 'POST'
  | 'PATCH'
  | 'DELETE';

interface RequestOptions {
  method?: RequestMethod;
  body?: unknown;
  token?: string | null;
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const {
    method = 'GET',
    body,
    token,
  } = options;

  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const url = `${API_BASE_URL}${endpoint}`;

  console.log(
    `MandiMitra API ${method}: ${url}`,
  );

  const response = await fetch(url, {
    method,
    headers,
    body:
      body !== undefined
        ? JSON.stringify(body)
        : undefined,
  });

  const responseText =
    await response.text();

  let data: unknown = null;

  if (responseText) {
    try {
      data = JSON.parse(responseText);
    } catch {
      data = responseText;
    }
  }

  if (!response.ok) {
    let message =
      `Request failed with status ${response.status}`;

    if (
      typeof data === 'object' &&
      data !== null &&
      'message' in data
    ) {
      const serverMessage =
        (data as { message?: unknown }).message;

      if (typeof serverMessage === 'string') {
        message = serverMessage;
      } else if (
        Array.isArray(serverMessage)
      ) {
        message = serverMessage.join(', ');
      }
    }

    throw new Error(message);
  }

  return data as T;
}

export const api = {
  get: <T>(
    endpoint: string,
    token?: string | null,
  ) =>
    apiRequest<T>(endpoint, {
      method: 'GET',
      token,
    }),

  post: <T>(
    endpoint: string,
    body?: unknown,
    token?: string | null,
  ) =>
    apiRequest<T>(endpoint, {
      method: 'POST',
      body,
      token,
    }),

  patch: <T>(
    endpoint: string,
    body?: unknown,
    token?: string | null,
  ) =>
    apiRequest<T>(endpoint, {
      method: 'PATCH',
      body,
      token,
    }),

  delete: <T>(
    endpoint: string,
    token?: string | null,
  ) =>
    apiRequest<T>(endpoint, {
      method: 'DELETE',
      token,
    }),
};

export { API_BASE_URL };