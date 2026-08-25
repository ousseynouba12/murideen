"use client";

import { useEffect, useState } from "react";
import { adminFetch } from "@/lib/admin-api";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { IconPlus, IconTrash } from "@/components/ui/Icons";
import type { Category, Promotion } from "@/lib/types";

interface ShopSettingsDto {
  nomBoutique: string;
  emailContact: string | null;
  telephoneContact: string | null;
  fraisLivraisonDefaut: number;
  seuilLivraisonOfferte: number | null;
  banniereTitre: string | null;
  banniereTexte: string | null;
  banniereActive: boolean;
}

const TYPE_LABELS: Record<string, string> = {
  POURCENTAGE: "Pourcentage",
  MONTANT_FIXE: "Montant fixe",
  LIVRAISON_OFFERTE: "Livraison offerte",
};

export default function AdminPromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<ShopSettingsDto | null>(null);
  const [form, setForm] = useState({ code: "", type: "POURCENTAGE", valeur: "10", categoryId: "" });
  const [error, setError] = useState<string | null>(null);

  function load() {
    adminFetch<Promotion[]>("/api/admin/promotions").then(setPromotions);
    adminFetch<Category[]>("/api/categories").then(setCategories);
    adminFetch<ShopSettingsDto>("/api/admin/settings").then(setSettings);
  }

  useEffect(load, []);

  async function createPromotion() {
    setError(null);
    if (!form.code) {
      setError("Merci de renseigner un code.");
      return;
    }
    try {
      await adminFetch("/api/admin/promotions", {
        method: "POST",
        body: JSON.stringify({
          code: form.code,
          type: form.type,
          valeur: form.type === "LIVRAISON_OFFERTE" ? 0 : parseFloat(form.valeur || "0"),
          actif: true,
          categoryId: form.categoryId ? Number(form.categoryId) : null,
        }),
      });
      setForm({ code: "", type: "POURCENTAGE", valeur: "10", categoryId: "" });
      load();
    } catch {
      setError("Impossible de créer ce code promo (existe peut-être déjà).");
    }
  }

  async function toggleActive(promo: Promotion) {
    await adminFetch(`/api/admin/promotions/${promo.id}`, {
      method: "PUT",
      body: JSON.stringify({ ...promo, actif: !promo.actif }),
    });
    load();
  }

  async function deletePromotion(id: number) {
    if (!confirm("Supprimer ce code promo ?")) return;
    await adminFetch(`/api/admin/promotions/${id}`, { method: "DELETE" });
    load();
  }

  async function saveBanner() {
    if (!settings) return;
    await adminFetch("/api/admin/settings", { method: "PUT", body: JSON.stringify(settings) });
  }

  return (
    <div>
      <h1 className="mb-5 font-display text-3xl font-semibold text-ink">Promotions</h1>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-card border border-line bg-sand-raised p-5">
            <h2 className="mb-3 font-display text-lg font-semibold text-ink">Codes promo</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-line text-left text-ink-faint">
                    <th className="py-2 font-medium">Code</th>
                    <th className="py-2 font-medium">Type</th>
                    <th className="py-2 font-medium">Valeur</th>
                    <th className="py-2 font-medium">Catégorie</th>
                    <th className="py-2 font-medium">Statut</th>
                    <th className="py-2 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {promotions.map((p) => (
                    <tr key={p.id} className="border-b border-line last:border-0">
                      <td className="py-2.5 font-medium text-ink">{p.code}</td>
                      <td className="py-2.5 text-ink-soft">{TYPE_LABELS[p.type]}</td>
                      <td className="py-2.5 text-ink-soft">
                        {p.type === "POURCENTAGE" ? `${p.valeur}%` : p.type === "MONTANT_FIXE" ? `${p.valeur} FCFA` : "—"}
                      </td>
                      <td className="py-2.5 text-ink-soft">{p.categoryNom ?? "Toutes"}</td>
                      <td className="py-2.5">
                        <button onClick={() => toggleActive(p)}>
                          <StatusBadge status={p.actif ? "ACTIF" : "BROUILLON"} />
                        </button>
                      </td>
                      <td className="py-2.5 text-right">
                        <button
                          onClick={() => deletePromotion(p.id)}
                          aria-label={`Supprimer le code promo ${p.code}`}
                          className="tap-target text-ink-faint hover:text-warn"
                        >
                          <IconTrash className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {promotions.length === 0 && <p className="py-6 text-center text-ink-soft">Aucun code promo pour le moment.</p>}
            </div>
          </div>

          <div className="mt-5 rounded-card border border-line bg-sand-raised p-5">
            <h2 className="mb-3 font-display text-lg font-semibold text-ink">Créer un code promo</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input
                placeholder="Code (ex : SOLDES20)"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                className="tap-target rounded-pill border border-line px-4 text-sm"
              />
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="tap-target rounded-pill border border-line px-4 text-sm"
              >
                <option value="POURCENTAGE">Pourcentage</option>
                <option value="MONTANT_FIXE">Montant fixe (FCFA)</option>
                <option value="LIVRAISON_OFFERTE">Livraison offerte</option>
              </select>
              {form.type !== "LIVRAISON_OFFERTE" && (
                <input
                  type="number"
                  placeholder="Valeur"
                  value={form.valeur}
                  onChange={(e) => setForm({ ...form, valeur: e.target.value })}
                  className="tap-target rounded-pill border border-line px-4 text-sm"
                />
              )}
              <select
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                className="tap-target rounded-pill border border-line px-4 text-sm"
              >
                <option value="">Toutes les catégories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nom}
                  </option>
                ))}
              </select>
            </div>
            {error && <p className="mt-2 text-sm text-warn">{error}</p>}
            <button
              onClick={createPromotion}
              className="tap-target mt-4 flex items-center gap-2 rounded-pill bg-wine px-5 text-sm font-medium text-sand-raised hover:bg-wine-soft"
            >
              <IconPlus className="h-4 w-4" /> Créer le code
            </button>
          </div>
        </div>

        <div className="rounded-card border border-line bg-sand-raised p-5">
          <h2 className="mb-3 font-display text-lg font-semibold text-ink">Bannière d'accueil</h2>
          {settings && (
            <div className="flex flex-col gap-3">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={settings.banniereActive}
                  onChange={(e) => setSettings({ ...settings, banniereActive: e.target.checked })}
                />
                Afficher la bannière
              </label>
              <input
                placeholder="Titre"
                value={settings.banniereTitre ?? ""}
                onChange={(e) => setSettings({ ...settings, banniereTitre: e.target.value })}
                className="tap-target rounded-pill border border-line px-4 text-sm"
              />
              <textarea
                placeholder="Texte"
                value={settings.banniereTexte ?? ""}
                onChange={(e) => setSettings({ ...settings, banniereTexte: e.target.value })}
                rows={3}
                className="rounded-[18px] border border-line px-4 py-3 text-sm"
              />
              <button onClick={saveBanner} className="tap-target rounded-pill bg-gold px-5 text-sm font-medium text-ink hover:bg-gold-deep hover:text-sand-raised">
                Enregistrer la bannière
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
