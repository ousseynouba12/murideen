"use client";

import { useEffect, useState } from "react";
import { login, register, logout, isAuthenticated, getCurrentUser, getToken } from "@/lib/auth-client";
import { apiFetch, ApiError } from "@/lib/api";
import { fetchWishlist } from "@/lib/wishlist-client";
import { formatFCFA, formatDate } from "@/lib/format";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ProductCard } from "@/components/shop/ProductCard";
import { IconUser, IconLogout } from "@/components/ui/Icons";
import type { Order, Product, UserProfile } from "@/lib/types";

export default function ComptePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setUser(getCurrentUser());
    setReady(true);
  }, []);

  if (!ready) return null;

  if (!user || !isAuthenticated()) {
    return <AuthForms onAuthenticated={setUser} />;
  }

  return <AccountView user={user} onLogout={() => setUser(null)} />;
}

function AuthForms({ onAuthenticated }: { onAuthenticated: (u: UserProfile) => void }) {
  const [mode, setMode] = useState<"connexion" | "inscription">("connexion");
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [nom, setNom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    setError(null);
    setLoading(true);
    try {
      const auth = mode === "connexion" ? await login(email, motDePasse) : await register(email, motDePasse, nom, telephone);
      onAuthenticated(auth.utilisateur);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="px-4 pb-10 pt-10">
      <div className="mx-auto max-w-sm">
        <h1 className="mb-1 text-center font-display text-3xl italic text-wine">Murideen</h1>
        <p className="mb-6 text-center text-sm text-ink-soft">
          {mode === "connexion" ? "Connectez-vous à votre compte" : "Créez votre compte"}
        </p>

        <div className="flex flex-col gap-3">
          {mode === "inscription" && (
            <>
              <input
                placeholder="Nom complet"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                className="tap-target rounded-pill border border-line bg-sand-raised px-4 text-sm"
              />
              <input
                placeholder="Téléphone (optionnel)"
                value={telephone}
                onChange={(e) => setTelephone(e.target.value)}
                className="tap-target rounded-pill border border-line bg-sand-raised px-4 text-sm"
              />
            </>
          )}
          <input
            placeholder="E-mail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="tap-target rounded-pill border border-line bg-sand-raised px-4 text-sm"
          />
          <input
            placeholder="Mot de passe"
            type="password"
            value={motDePasse}
            onChange={(e) => setMotDePasse(e.target.value)}
            className="tap-target rounded-pill border border-line bg-sand-raised px-4 text-sm"
          />
          {error && <p className="text-sm text-warn">{error}</p>}
          <button
            onClick={submit}
            disabled={loading}
            className="tap-target rounded-pill bg-wine text-sm font-medium text-sand-raised hover:bg-wine-soft disabled:opacity-50"
          >
            {loading ? "Un instant…" : mode === "connexion" ? "Se connecter" : "Créer mon compte"}
          </button>
          <button
            onClick={() => setMode(mode === "connexion" ? "inscription" : "connexion")}
            className="tap-target text-sm text-wine underline"
          >
            {mode === "connexion" ? "Pas encore de compte ? Inscrivez-vous" : "Déjà un compte ? Connectez-vous"}
          </button>
        </div>
      </div>
    </main>
  );
}

function AccountView({ user, onLogout }: { user: UserProfile; onLogout: () => void }) {
  const [tab, setTab] = useState<"commandes" | "envies">("commandes");
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    Promise.all([
      apiFetch<Order[]>("/api/me/orders", { token, cache: "no-store" }).catch(() => []),
      fetchWishlist().catch(() => []),
    ]).then(([o, w]) => {
      setOrders(o);
      setWishlist(w);
      setLoading(false);
    });
  }, []);

  return (
    <main className="px-4 pb-10 pt-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-wine-tint text-wine">
            <IconUser className="h-5 w-5" />
          </div>
          <div>
            <p className="font-display text-lg font-semibold text-ink">{user.nom}</p>
            <p className="text-xs text-ink-faint">{user.email}</p>
          </div>
        </div>
        <button
          onClick={() => {
            logout();
            onLogout();
          }}
          className="tap-target flex items-center gap-1 rounded-pill border border-line px-4 text-sm text-ink-soft"
        >
          <IconLogout className="h-4 w-4" /> Quitter
        </button>
      </div>

      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setTab("commandes")}
          className={`tap-target rounded-pill px-5 text-sm font-medium ${tab === "commandes" ? "bg-wine text-sand-raised" : "bg-sand-raised border border-line text-ink-soft"}`}
        >
          Mes commandes
        </button>
        <button
          onClick={() => setTab("envies")}
          className={`tap-target rounded-pill px-5 text-sm font-medium ${tab === "envies" ? "bg-wine text-sand-raised" : "bg-sand-raised border border-line text-ink-soft"}`}
        >
          Liste d'envies
        </button>
      </div>

      {loading ? (
        <p className="py-10 text-center text-ink-soft">Chargement…</p>
      ) : tab === "commandes" ? (
        orders.length === 0 ? (
          <p className="py-10 text-center text-ink-soft">Vous n'avez pas encore de commande.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {orders.map((o) => (
              <div key={o.id} className="rounded-card border border-line bg-sand-raised p-4">
                <div className="flex items-center justify-between">
                  <span className="font-display font-semibold text-ink">{o.numero}</span>
                  <StatusBadge status={o.statut} />
                </div>
                <p className="mt-1 text-xs text-ink-faint">{formatDate(o.createdAt)}</p>
                <p className="mt-2 text-sm text-ink-soft">
                  {o.articles.length} article{o.articles.length > 1 ? "s" : ""} · {formatFCFA(o.total)}
                </p>
              </div>
            ))}
          </div>
        )
      ) : wishlist.length === 0 ? (
        <p className="py-10 text-center text-ink-soft">
          Votre liste d'envies est vide. Touchez le cœur sur un article pour l'ajouter ici.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {wishlist.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </main>
  );
}
