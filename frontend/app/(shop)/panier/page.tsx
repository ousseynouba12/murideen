"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { IconChevronLeft, IconMinus, IconPlus, IconTrash } from "@/components/ui/Icons";
import { formatFCFA } from "@/lib/format";
import { fetchCart, updateCartItem, removeCartItem, applyPromoCode } from "@/lib/cart-client";
import { getToken } from "@/lib/auth-client";
import { apiFetch, ApiError } from "@/lib/api";
import { getCartToken } from "@/lib/cart-client";
import type { CartResponse } from "@/lib/types";

interface DeliveryZone {
  id: number;
  nom: string;
  frais: number;
  delaiEstime: string | null;
}

const PAYMENT_NOTES: Record<string, string> = {
  WAVE: "Vous serez redirigée vers Wave pour finaliser le paiement en toute sécurité.",
  ORANGE_MONEY: "Vous serez redirigée vers Orange Money pour finaliser le paiement en toute sécurité.",
  LIVRAISON: "Vous payez en espèces directement à la réception de votre commande.",
};

export default function PanierPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [promoInput, setPromoInput] = useState("");
  const [promoError, setPromoError] = useState<string | null>(null);

  const [form, setForm] = useState({
    clientNom: "",
    clientTelephone: "",
    clientEmail: "",
    adresseLivraison: "",
    ville: "",
    modePaiement: "WAVE",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([fetchCart(), apiFetch<DeliveryZone[]>("/api/delivery-zones", { cache: "no-store" })])
      .then(([cartData, zonesData]) => {
        setCart(cartData);
        setZones(zonesData);
      })
      .finally(() => setLoading(false));
  }, []);

  const livraison = useMemo(() => {
    if (!form.ville) return zones[0]?.frais ?? 2000;
    return zones.find((z) => z.nom.toLowerCase() === form.ville.toLowerCase())?.frais ?? (zones[0]?.frais ?? 2000);
  }, [form.ville, zones]);

  const sousTotal = cart?.sousTotal ?? 0;
  const remise = cart?.remise ?? 0;
  const livraisonAffichee = cart && cart.codePromo && cart.remise === 0 ? livraison : livraison;
  const total = Math.max(0, sousTotal - remise) + livraisonAffichee;

  async function handleQuantityChange(itemId: number, quantite: number) {
    if (quantite < 1) return;
    const updated = await updateCartItem(itemId, quantite);
    setCart(updated);
    window.dispatchEvent(new Event("murideen:cart-updated"));
  }

  async function handleRemove(itemId: number) {
    const updated = await removeCartItem(itemId);
    setCart(updated);
    window.dispatchEvent(new Event("murideen:cart-updated"));
  }

  async function handlePromo() {
    setPromoError(null);
    try {
      const updated = await applyPromoCode(promoInput.trim());
      setCart(updated);
    } catch (e) {
      setPromoError(e instanceof ApiError ? e.message : "Code promo invalide.");
    }
  }

  async function handleConfirm() {
    setError(null);
    if (!form.clientNom || !form.clientTelephone || !form.adresseLivraison) {
      setError("Merci de renseigner votre nom, téléphone et adresse de livraison.");
      return;
    }
    setSubmitting(true);
    try {
      const response = await apiFetch<{ commande: { numero: string }; urlPaiement: string | null }>("/api/orders", {
        method: "POST",
        token: getToken(),
        cartToken: getCartToken(),
        body: JSON.stringify(form),
      });
      if (response.urlPaiement) {
        window.location.href = response.urlPaiement;
      } else {
        router.push(`/compte?commande=${response.commande.numero}`);
      }
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Impossible de finaliser la commande.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <div className="px-4 py-10 text-center text-ink-soft">Chargement du panier…</div>;
  }

  const articles = cart?.articles ?? [];

  return (
    <main className="px-4 pb-10 pt-4">
      <div className="mb-4 flex items-center gap-3">
        <Link href="/catalogue" className="tap-target flex items-center justify-center rounded-full border border-line bg-sand-raised">
          <IconChevronLeft className="h-5 w-5 text-ink-soft" />
        </Link>
        <h1 className="font-display text-2xl font-semibold text-ink">Mon panier</h1>
      </div>

      {articles.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-24 text-center">
          <p className="font-display text-xl text-ink">Votre panier est vide</p>
          <Link href="/catalogue" className="tap-target rounded-pill bg-wine px-6 text-sm font-medium text-sand-raised">
            Découvrir la boutique
          </Link>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-3">
            {articles.map((item) => (
              <div key={item.id} className="flex gap-3 rounded-card border border-line bg-sand-raised p-3">
                <div className="relative h-24 w-20 flex-shrink-0 overflow-hidden rounded-[12px] bg-sand-sunken">
                  {item.image && <Image src={item.image} alt={item.nom} fill className="object-cover" />}
                </div>
                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <p className="font-display text-base font-semibold text-ink">{item.nom}</p>
                    <p className="text-xs text-ink-faint">
                      {item.taille} · {item.couleur}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center rounded-pill border border-line">
                      <button
                        aria-label="Diminuer"
                        onClick={() => handleQuantityChange(item.id, item.quantite - 1)}
                        className="tap-target flex items-center justify-center px-2"
                      >
                        <IconMinus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-6 text-center text-sm">{item.quantite}</span>
                      <button
                        aria-label="Augmenter"
                        onClick={() => handleQuantityChange(item.id, item.quantite + 1)}
                        className="tap-target flex items-center justify-center px-2"
                        disabled={item.quantite >= item.stockDisponible}
                      >
                        <IconPlus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <span className="font-display font-semibold text-wine">{formatFCFA(item.sousTotal)}</span>
                  </div>
                </div>
                <button
                  aria-label="Retirer l'article"
                  onClick={() => handleRemove(item.id)}
                  className="tap-target flex items-start text-ink-faint hover:text-warn"
                >
                  <IconTrash className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="mt-5 flex gap-2">
            <input
              value={promoInput}
              onChange={(e) => setPromoInput(e.target.value)}
              placeholder="Code promo"
              className="tap-target flex-1 rounded-pill border border-line bg-sand-raised px-4 text-sm"
            />
            <button
              onClick={handlePromo}
              className="tap-target rounded-pill border border-line-strong px-5 text-sm font-medium text-ink"
            >
              Appliquer
            </button>
          </div>
          {promoError && <p className="mt-1 text-xs text-warn">{promoError}</p>}
          {cart?.codePromo && <p className="mt-1 text-xs text-ok">Code « {cart.codePromo} » appliqué.</p>}

          <div className="mt-6 rounded-card border border-line bg-sand-raised p-4">
            <div className="flex justify-between py-1 text-sm text-ink-soft">
              <span>Sous-total</span>
              <span className="text-ink">{formatFCFA(sousTotal)}</span>
            </div>
            <div className="flex justify-between py-1 text-sm text-ink-soft">
              <span>Livraison estimée</span>
              <span className="text-ink">{formatFCFA(livraisonAffichee)}</span>
            </div>
            {remise > 0 && (
              <div className="flex justify-between py-1 text-sm text-ok">
                <span>Remise</span>
                <span>-{formatFCFA(remise)}</span>
              </div>
            )}
            <div className="mt-2 flex justify-between border-t border-line pt-2 font-display text-lg font-semibold text-wine">
              <span>Total</span>
              <span>{formatFCFA(total)}</span>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3">
            <h2 className="font-display text-lg font-semibold text-ink">Livraison</h2>
            <input
              placeholder="Nom complet"
              value={form.clientNom}
              onChange={(e) => setForm({ ...form, clientNom: e.target.value })}
              className="tap-target rounded-pill border border-line bg-sand-raised px-4 text-sm"
            />
            <input
              placeholder="Téléphone"
              value={form.clientTelephone}
              onChange={(e) => setForm({ ...form, clientTelephone: e.target.value })}
              className="tap-target rounded-pill border border-line bg-sand-raised px-4 text-sm"
            />
            <input
              placeholder="E-mail (optionnel)"
              value={form.clientEmail}
              onChange={(e) => setForm({ ...form, clientEmail: e.target.value })}
              className="tap-target rounded-pill border border-line bg-sand-raised px-4 text-sm"
            />
            <select
              value={form.ville}
              onChange={(e) => setForm({ ...form, ville: e.target.value })}
              className="tap-target rounded-pill border border-line bg-sand-raised px-4 text-sm text-ink-soft"
            >
              <option value="">Choisir une zone de livraison</option>
              {zones.map((z) => (
                <option key={z.id} value={z.nom}>
                  {z.nom} — {formatFCFA(z.frais)}
                </option>
              ))}
            </select>
            <textarea
              placeholder="Adresse complète (quartier, repère...)"
              value={form.adresseLivraison}
              onChange={(e) => setForm({ ...form, adresseLivraison: e.target.value })}
              rows={3}
              className="rounded-[18px] border border-line bg-sand-raised px-4 py-3 text-sm"
            />
          </div>

          <div className="mt-6">
            <h2 className="mb-3 font-display text-lg font-semibold text-ink">Mode de paiement</h2>
            <div className="flex flex-col gap-2">
              {(["WAVE", "ORANGE_MONEY", "LIVRAISON"] as const).map((mode) => (
                <label
                  key={mode}
                  className={`tap-target flex items-center gap-3 rounded-card border px-4 py-3 text-sm ${
                    form.modePaiement === mode ? "border-wine bg-wine-tint" : "border-line bg-sand-raised"
                  }`}
                >
                  <input
                    type="radio"
                    name="modePaiement"
                    checked={form.modePaiement === mode}
                    onChange={() => setForm({ ...form, modePaiement: mode })}
                  />
                  <span className="font-medium text-ink">
                    {mode === "WAVE" ? "Wave" : mode === "ORANGE_MONEY" ? "Orange Money" : "Paiement à la livraison"}
                  </span>
                </label>
              ))}
            </div>
            <p className="mt-2 text-xs text-ink-soft">{PAYMENT_NOTES[form.modePaiement]}</p>
          </div>

          {error && <p className="mt-4 text-sm text-warn">{error}</p>}

          <button
            onClick={handleConfirm}
            disabled={submitting}
            className="tap-target mt-6 w-full rounded-pill bg-wine text-sm font-medium text-sand-raised hover:bg-wine-soft disabled:opacity-50"
          >
            {submitting ? "Confirmation en cours…" : `Confirmer la commande — ${formatFCFA(total)}`}
          </button>
        </>
      )}
    </main>
  );
}
