const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000";

export function apiUrl(path: string): string {
  if (!path.startsWith("/")) {
    return `${API_URL}/${path}`;
  }

  return `${API_URL}${path}`;
}

export function getApiUrl(): string {
  return API_URL;
}