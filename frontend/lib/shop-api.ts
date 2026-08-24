import { apiFetch } from "./api";
import type { Category, PageResult, Product } from "./types";

export interface DeliveryZone {
  id: number;
  nom: string;
  frais: number;
  delaiEstime: string | null;
}

export interface PublicSettings {
  nomBoutique: string;
  emailContact: string | null;
  telephoneContact: string | null;
  fraisLivraisonDefaut: number;
  seuilLivraisonOfferte: number | null;
  banniereTitre: string | null;
  banniereTexte: string | null;
  banniereActive: boolean;
}

export function getDeliveryZones() {
  return apiFetch<DeliveryZone[]>("/api/delivery-zones", { revalidate: 900 });
}

export function getPublicSettings() {
  return apiFetch<PublicSettings>("/api/settings/public", { revalidate: 900 });
}

export function getCategories() {
  return apiFetch<Category[]>("/api/categories", { revalidate: 900 });
}

export function getBestSellers() {
  return apiFetch<Product[]>("/api/products/best-sellers", { revalidate: 300 });
}

export function getProducts(params: { category?: string; search?: string; sort?: string; page?: number; size?: number }) {
  const query = new URLSearchParams();
  if (params.category && params.category !== "toutes") query.set("category", params.category);
  if (params.search) query.set("search", params.search);
  if (params.sort) query.set("sort", params.sort);
  query.set("page", String(params.page ?? 0));
  query.set("size", String(params.size ?? 24));
  return apiFetch<PageResult<Product>>(`/api/products?${query.toString()}`, { revalidate: 120 });
}

export function getProductBySlug(slug: string) {
  return apiFetch<Product>(`/api/products/${slug}`, { revalidate: 300 });
}
