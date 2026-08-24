"use client";

import { apiFetch } from "./api";
import { setCookie, getCookie, deleteCookie } from "./cookies";
import type { UserProfile } from "./types";

const TOKEN_COOKIE = "murideen_token";
const REFRESH_COOKIE = "murideen_refresh";
const ROLE_COOKIE = "murideen_role";
const USER_STORAGE_KEY = "murideen_user";

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  utilisateur: UserProfile;
}

function persistSession(auth: AuthResponse) {
  setCookie(TOKEN_COOKIE, auth.accessToken, 30);
  setCookie(REFRESH_COOKIE, auth.refreshToken, 30);
  setCookie(ROLE_COOKIE, auth.utilisateur.role, 30);
  if (typeof window !== "undefined") {
    window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(auth.utilisateur));
  }
}

export async function login(email: string, motDePasse: string): Promise<AuthResponse> {
  const auth = await apiFetch<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, motDePasse }),
  });
  persistSession(auth);
  return auth;
}

export async function register(email: string, motDePasse: string, nom: string, telephone?: string): Promise<AuthResponse> {
  const auth = await apiFetch<AuthResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, motDePasse, nom, telephone }),
  });
  persistSession(auth);
  return auth;
}

export function logout() {
  deleteCookie(TOKEN_COOKIE);
  deleteCookie(REFRESH_COOKIE);
  deleteCookie(ROLE_COOKIE);
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(USER_STORAGE_KEY);
  }
}

export function getToken(): string | null {
  return getCookie(TOKEN_COOKIE);
}

export function getRole(): string | null {
  return getCookie(ROLE_COOKIE);
}

export function getCurrentUser(): UserProfile | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(USER_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UserProfile;
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  return !!getToken();
}
