// URL publique (accessible depuis le navigateur) — utilisée par les composants client.
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// URL interne (réseau Docker) utilisée par les composants serveur / route handlers Next.js.
// À l'intérieur de docker compose, "localhost" désignerait le conteneur frontend lui-même,
// pas le backend : on utilise donc le nom de service Docker ("backend") côté serveur.
const SERVER_API_URL = process.env.API_URL || API_URL;

function resolveBaseUrl(): string {
  return typeof window === "undefined" ? SERVER_API_URL : API_URL;
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

interface FetchOptions extends RequestInit {
  token?: string | null;
  cartToken?: string | null;
  revalidate?: number | false;
}

export async function apiFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { token, cartToken, revalidate, headers, ...rest } = options;

  const finalHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...(headers as Record<string, string>),
  };
  if (token) finalHeaders["Authorization"] = `Bearer ${token}`;
  if (cartToken) finalHeaders["X-Cart-Token"] = cartToken;

  const init: RequestInit & { next?: { revalidate?: number | false } } = {
    ...rest,
    headers: finalHeaders,
  };
  if (revalidate !== undefined) {
    init.next = { revalidate };
  }

  const res = await fetch(`${resolveBaseUrl()}${path}`, init);

  if (!res.ok) {
    let message = `Une erreur est survenue (${res.status}).`;
    try {
      const body = await res.json();
      if (body?.message) message = body.message;
    } catch {
      // ignore
    }
    throw new ApiError(res.status, message);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export { API_URL };
