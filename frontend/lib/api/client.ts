/**
 * Central API Client configuration for MandiSetu
 * Designed to seamlessly connect with future NestJS + PostgreSQL + Redis backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Helper wrapper to make fetch calls with headers, error handling, and mock fallback
   */
  async get<T>(endpoint: string, mockFallback?: T): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const json: ApiResponse<T> = await response.json();
      return json.data;
    } catch (err) {
      if (mockFallback !== undefined) {
        // Return typed mock fallback during prototype phase
        return mockFallback;
      }
      throw err;
    }
  }

  async post<T, B = unknown>(endpoint: string, body: B, mockFallback?: T): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const json: ApiResponse<T> = await response.json();
      return json.data;
    } catch (err) {
      if (mockFallback !== undefined) {
        return mockFallback;
      }
      throw err;
    }
  }
}

export const apiClient = new ApiClient();
