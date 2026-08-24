"use client";

import { apiFetch } from "./api";
import { getCookie, setCookie } from "./cookies";
import { getToken } from "./auth-client";
import type { CartResponse } from "./types";

const CART_COOKIE = "murideen_cart_token";

export function getCartToken(): string | null {
  return getCookie(CART_COOKIE);
}

function persistCartToken(cart: CartResponse) {
  if (cart.sessionToken) {
    setCookie(CART_COOKIE, cart.sessionToken, 60);
  }
}

export async function fetchCart(): Promise<CartResponse> {
  const cart = await apiFetch<CartResponse>("/api/cart", {
    token: getToken(),
    cartToken: getCartToken(),
    cache: "no-store",
  });
  persistCartToken(cart);
  return cart;
}

export async function addToCart(productVariantId: number, quantite: number): Promise<CartResponse> {
  const cart = await apiFetch<CartResponse>("/api/cart", {
    method: "POST",
    token: getToken(),
    cartToken: getCartToken(),
    body: JSON.stringify({ productVariantId, quantite }),
  });
  persistCartToken(cart);
  return cart;
}

export async function updateCartItem(itemId: number, quantite: number): Promise<CartResponse> {
  const cart = await apiFetch<CartResponse>(`/api/cart/items/${itemId}`, {
    method: "PUT",
    token: getToken(),
    cartToken: getCartToken(),
    body: JSON.stringify({ quantite }),
  });
  persistCartToken(cart);
  return cart;
}

export async function removeCartItem(itemId: number): Promise<CartResponse> {
  const cart = await apiFetch<CartResponse>(`/api/cart/items/${itemId}`, {
    method: "DELETE",
    token: getToken(),
    cartToken: getCartToken(),
  });
  persistCartToken(cart);
  return cart;
}

export async function applyPromoCode(code: string): Promise<CartResponse> {
  const cart = await apiFetch<CartResponse>("/api/cart/promo", {
    method: "POST",
    token: getToken(),
    cartToken: getCartToken(),
    body: JSON.stringify({ code }),
  });
  persistCartToken(cart);
  return cart;
}
