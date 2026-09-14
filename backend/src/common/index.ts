export * from './nestjs-shims';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp: string;
}

export function createSuccessResponse<T>(data: T, message?: string): ApiResponse<T> {
  return {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString(),
  };
}

export function createErrorResponse(error: string, message?: string): ApiResponse<null> {
  return {
    success: false,
    error,
    message,
    timestamp: new Date().toISOString(),
  };
}
