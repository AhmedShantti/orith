"use client";

// Base URL of the NestJS backend (e.g. http://localhost:4000). Empty string
// falls back to same-origin relative paths.
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

/** Prefix an `/api/...` path with the backend base URL. */
export function apiUrl(path: string): string {
  return `${BASE_URL}${path}`;
}

function authHeaders(): Record<string, string> {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("orith_token")
      : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (res.status === 401) {
    if (typeof window !== "undefined") {
      localStorage.removeItem("orith_token");
      window.location.href = "/login";
    }
    throw new Error("Unauthorized");
  }
  const data = await res.json();
  return data as T;
}

export const api = {
  get: async <T>(url: string): Promise<T> => {
    const res = await fetch(`${BASE_URL}${url}`, {
      method: "GET",
      headers: authHeaders(),
    });
    return handleResponse<T>(res);
  },

  post: async <T>(url: string, body: Record<string, unknown>): Promise<T> => {
    const res = await fetch(`${BASE_URL}${url}`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(body),
    });
    return handleResponse<T>(res);
  },

  put: async <T>(url: string, body: Record<string, unknown>): Promise<T> => {
    const res = await fetch(`${BASE_URL}${url}`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(body),
    });
    return handleResponse<T>(res);
  },

  patch: async <T>(url: string, body: Record<string, unknown>): Promise<T> => {
    const res = await fetch(`${BASE_URL}${url}`, {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify(body),
    });
    return handleResponse<T>(res);
  },

  delete: async <T>(url: string): Promise<T> => {
    const res = await fetch(`${BASE_URL}${url}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    return handleResponse<T>(res);
  },
};
