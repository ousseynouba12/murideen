"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/auth-client";
import { ApiError } from "@/lib/api";

const STAFF_ROLES = ["PROPRIETAIRE", "GESTIONNAIRE", "PREPARATION"];

export default function AdminConnexionPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    setError(null);
    setLoading(true);
    try {
      const auth = await login(email, motDePasse);
      if (!STAFF_ROLES.includes(auth.utilisateur.role)) {
        setError("Ce compte n'a pas accès à l'espace de gestion.");
        return;
      }
      router.push("/admin");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Connexion impossible.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center px-4"
      style={{ background: "linear-gradient(135deg, var(--wine) 0%, var(--ink) 100%)" }}
    >
      <div className="w-full max-w-sm rounded-card bg-sand-raised p-8">
        <h1 className="text-center font-display text-3xl italic text-wine">Murideen</h1>
        <p className="mb-6 mt-1 text-center text-sm text-ink-soft">Espace de gestion</p>

        <div className="flex flex-col gap-3">
          <input
            placeholder="E-mail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="tap-target rounded-pill border border-line bg-sand px-4 text-sm"
          />
          <input
            placeholder="Mot de passe"
            type="password"
            value={motDePasse}
            onChange={(e) => setMotDePasse(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            className="tap-target rounded-pill border border-line bg-sand px-4 text-sm"
          />
          {error && <p className="text-sm text-warn">{error}</p>}
          <button
            onClick={submit}
            disabled={loading}
            className="tap-target rounded-pill bg-wine text-sm font-medium text-sand-raised hover:bg-wine-soft disabled:opacity-50"
          >
            {loading ? "Connexion…" : "Se connecter"}
          </button>
        </div>

        <p className="mt-6 text-center text-xs text-ink-faint">
          Démo : proprietaire@murideen-demo.com / Murideen2026!
        </p>
      </div>
    </div>
  );
}
