import { jwtDecode } from "jwt-decode";

interface TokenPayload {
  sub?: string;
  role?: string;
  exp?: number;
}


export function getToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem("token");
}


export function getDecodedToken(): TokenPayload | null {
  const token = getToken();

  if (!token) {
    return null;
  }

  try {
    const decoded =
      jwtDecode<TokenPayload>(token);

    return decoded;

  } catch {
    return null;
  }
}


export function isTokenExpired(): boolean {
  const decoded =
    getDecodedToken();

  if (!decoded) {
    return true;
  }

  if (!decoded.exp) {
    return false;
  }

  return decoded.exp * 1000 <= Date.now();
}


export function isAuthenticated(): boolean {
  const token = getToken();

  if (!token) {
    return false;
  }

  if (isTokenExpired()) {
    logout();
    return false;
  }

  return true;
}


export function getUserRole(): string | null {
  const decoded =
    getDecodedToken();

  if (!decoded) {
    return null;
  }

  if (isTokenExpired()) {
    return null;
  }

  return decoded.role || null;
}


export function logout(): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem("token");

  localStorage.removeItem(
    "user"
  );
}