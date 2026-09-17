"use client";

import { apiFetch } from "./api";
import { getToken } from "./auth-client";
import type { Product } from "./types";

export async function fetchWishlist(): Promise<Product[]> {
  return apiFetch<Product[]>("/api/me/wishlist", { token: getToken(), cache: "no-store" });
}

export async function addToWishlist(productId: number): Promise<void> {
  await apiFetch<void>(`/api/me/wishlist/${productId}`, { method: "POST", token: getToken() });
}

export async function removeFromWishlist(productId: number): Promise<void> {
  await apiFetch<void>(`/api/me/wishlist/${productId}`, { method: "DELETE", token: getToken() });
}
