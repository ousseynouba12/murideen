import { apiFetch } from "./api";
import { getToken } from "./auth-client";

export function adminFetch<T>(path: string, options: Parameters<typeof apiFetch>[1] = {}) {
  return apiFetch<T>(path, { token: getToken(), cache: "no-store", ...options });
}
