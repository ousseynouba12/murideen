"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { adminFetch } from "@/lib/admin-api";
import { getToken } from "@/lib/auth-client";
import { API_URL, ApiError } from "@/lib/api";
import { IconPlus, IconTrash, IconX } from "@/components/ui/Icons";
import type { Category, Product } from "@/lib/types";

interface VariantRow {
  id?: number;
  taille: string;
  couleur: string;
  stock: number;
}

export function ProductForm({ product }: { product?: Product }) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [nom, setNom] = useState(product?.nom ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [prix, setPrix] = useState(product?.prix?.toString() ?? "");
  const [categoryId, setCategoryId] = useState<number | null>(product?.categorie.id ?? null);
  const [statut, setStatut] = useState(product?.statut ?? "BROUILLON");
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [variantes, setVariantes] = useState<VariantRow[]>(
    product?.variantes.map((v) => ({ id: v.id, taille: v.taille, couleur: v.couleur, stock: v.stock })) ?? [
      { taille: "S", couleur: "Principale", stock: 0 },
    ]
  );
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminFetch<Category[]>("/api/categories").then((cats) => {
      setCategories(cats);
      if (!categoryId && cats.length > 0) setCategoryId(cats[0].id);
    });
  }, []);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("fichier", file);
      const res = await fetch(`${API_URL}/api/admin/media/produits`, {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}` },
        body: formData,
      });
      if (!res.ok) throw new Error("Échec de l'envoi de l'image.");
      const urls: Record<string, string> = await res.json();
      setImages((prev) => [...prev, urls.medium ?? urls.original]);
    } catch {
      setError("Impossible d'envoyer l'image.");
    } finally {
      setUploading(false);
    }
  }

  function updateVariant(index: number, patch: Partial<VariantRow>) {
    setVariantes((prev) => prev.map((v, i) => (i === index ? { ...v, ...patch } : v)));
  }

  function removeVariant(index: number) {
    setVariantes((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit() {
    setError(null);
    if (!nom || !prix || !categoryId) {
      setError("Merci de renseigner au minimum le nom, le prix et la catégorie.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        nom,
        description,
        prix: parseFloat(prix),
        categoryId,
        images,
        statut,
        variantes: variantes.map((v) => ({ id: v.id, taille: v.taille, couleur: v.couleur, stock: v.stock })),
      };
      if (product) {
        await adminFetch(`/api/admin/products/${product.id}`, { method: "PUT", body: JSON.stringify(payload) });
      } else {
        await adminFetch("/api/admin/products", { method: "POST", body: JSON.stringify(payload) });
      }
      router.push("/admin/catalogue");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Impossible d'enregistrer le produit.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!product) return;
    if (!confirm(`Supprimer « ${product.nom} » ? Cette action est irréversible.`)) return;
    await adminFetch(`/api/admin/products/${product.id}`, { method: "DELETE" });
    router.push("/admin/catalogue");
  }

  return (
    <div className="max-w-2xl">
      <div className="rounded-card border border-line bg-sand-raised p-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm sm:col-span-2">
            Nom du produit
            <input value={nom} onChange={(e) => setNom(e.target.value)} className="tap-target rounded-pill border border-line px-4" />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Prix (FCFA)
            <input type="number" value={prix} onChange={(e) => setPrix(e.target.value)} className="tap-target rounded-pill border border-line px-4" />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Catégorie
            <select
              value={categoryId ?? ""}
              onChange={(e) => setCategoryId(Number(e.target.value))}
              className="tap-target rounded-pill border border-line px-4"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nom}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm sm:col-span-2">
            Description
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="rounded-[18px] border border-line px-4 py-3" />
          </label>
        </div>

        <div className="mt-5">
          <p className="mb-2 text-sm font-medium text-ink">Publication</p>
          <div className="flex gap-2">
            {(["ACTIF", "BROUILLON"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatut(s)}
                className={`tap-target rounded-pill border px-5 text-sm font-medium ${statut === s ? "border-wine bg-wine text-sand-raised" : "border-line text-ink-soft"}`}
              >
                {s === "ACTIF" ? "Publié" : "Brouillon"}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5">
          <p className="mb-2 text-sm font-medium text-ink">Photos</p>
          <div className="flex flex-wrap gap-3">
            {images.map((url, i) => (
              <div key={i} className="relative h-20 w-20 overflow-hidden rounded-[12px] bg-sand-sunken">
                <Image src={url} alt={`Photo ${i + 1} du produit`} fill className="object-cover" />
                <button
                  onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
                  aria-label={`Retirer la photo ${i + 1}`}
                  className="absolute right-0.5 top-0.5 rounded-full bg-ink/60 p-0.5 text-sand-raised"
                >
                  <IconX className="h-3 w-3" />
                </button>
              </div>
            ))}
            <label className="tap-target flex h-20 w-20 cursor-pointer flex-col items-center justify-center rounded-[12px] border border-dashed border-line-strong text-ink-faint">
              <IconPlus className="h-5 w-5" />
              <span className="text-[10px]">{uploading ? "Envoi…" : "Ajouter"}</span>
              <input type="file" accept="image/*" onChange={handleUpload} className="hidden" disabled={uploading} />
            </label>
          </div>
        </div>

        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-medium text-ink">Variantes (taille, couleur, stock)</p>
            <button
              onClick={() => setVariantes((prev) => [...prev, { taille: "", couleur: "Principale", stock: 0 }])}
              className="tap-target flex items-center gap-1 text-sm text-wine"
            >
              <IconPlus className="h-4 w-4" /> Ajouter
            </button>
          </div>
          <div className="flex flex-col gap-2">
            {variantes.map((v, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  placeholder="Taille"
                  value={v.taille}
                  onChange={(e) => updateVariant(i, { taille: e.target.value })}
                  className="tap-target w-24 rounded-pill border border-line px-3 text-sm"
                />
                <input
                  placeholder="Couleur"
                  value={v.couleur}
                  onChange={(e) => updateVariant(i, { couleur: e.target.value })}
                  className="tap-target flex-1 rounded-pill border border-line px-3 text-sm"
                />
                <input
                  type="number"
                  placeholder="Stock"
                  value={v.stock}
                  onChange={(e) => updateVariant(i, { stock: Number(e.target.value) })}
                  className="tap-target w-24 rounded-pill border border-line px-3 text-sm"
                />
                <button
                  onClick={() => removeVariant(i)}
                  aria-label={`Retirer la variante ${i + 1}`}
                  className="tap-target text-ink-faint hover:text-warn"
                >
                  <IconTrash className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {error && <p className="mt-4 text-sm text-warn">{error}</p>}

        <div className="mt-6 flex items-center justify-between">
          {product ? (
            <button onClick={handleDelete} className="tap-target text-sm font-medium text-warn">
              Supprimer ce produit
            </button>
          ) : (
            <span />
          )}
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="tap-target rounded-pill bg-wine px-6 text-sm font-medium text-sand-raised hover:bg-wine-soft disabled:opacity-50"
          >
            {saving ? "Enregistrement…" : "Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  );
}
