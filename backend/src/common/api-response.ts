// Shared response envelope, matching the shape the Next.js routes returned so
// the frontend needs no changes to its parsing.

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[] | null;
  error?: string;
  message?: string;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export function ok<T>(data: T, message?: string): ApiResponse<T> {
  return { success: true, data, ...(message ? { message } : {}) };
}

export function paginated<T>(
  data: T[],
  pagination: { total: number; page: number; limit: number; pages: number }
): PaginatedResponse<T> {
  return { success: true, data, pagination };
}
