"use client";

import { useEffect, useState } from "react";
import { adminFetch } from "@/lib/admin-api";
import { formatFCFA, formatDateTime } from "@/lib/format";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { IconX } from "@/components/ui/Icons";
import type { Order, PageResult } from "@/lib/types";

const TABS = [
  { key: "TOUTES", label: "Toutes" },
  { key: "EN_ATTENTE", label: "En attente" },
  { key: "CONFIRMEE", label: "Confirmées" },
  { key: "EXPEDIEE", label: "Expédiées" },
  { key: "LIVREE", label: "Livrées" },
];

const NEXT_STATUS: Record<string, string[]> = {
  EN_ATTENTE: ["CONFIRMEE", "ANNULEE"],
  CONFIRMEE: ["EXPEDIEE", "ANNULEE"],
  EXPEDIEE: ["LIVREE"],
  LIVREE: [],
  ANNULEE: [],
};

export default function AdminCommandesPage() {
  const [tab, setTab] = useState("TOUTES");
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Order | null>(null);

  async function loadCounts() {
    const results = await Promise.all(
      TABS.map((t) =>
        adminFetch<PageResult<Order>>(`/api/admin/orders?status=${t.key}&size=1`).then((p) => [t.key, p.totalElements] as const)
      )
    );
    setCounts(Object.fromEntries(results));
  }

  async function loadOrders(status: string) {
    setLoading(true);
    const page = await adminFetch<PageResult<Order>>(`/api/admin/orders?status=${status}&size=100`);
    setOrders(page.content);
    setLoading(false);
  }

  useEffect(() => {
    loadCounts();
  }, []);

  useEffect(() => {
    loadOrders(tab);
  }, [tab]);

  async function updateStatus(order: Order, statut: string) {
    const updated = await adminFetch<Order>(`/api/admin/orders/${order.id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ statut }),
    });
    setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
    setSelected(updated);
    loadCounts();
  }

  return (
    <div>
      <h1 className="mb-5 font-display text-3xl font-semibold text-ink">Commandes</h1>

      <div className="mb-5 flex gap-2 overflow-x-auto no-scrollbar">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`tap-target flex items-center gap-2 whitespace-nowrap rounded-pill border px-4 text-sm font-medium ${
              tab === t.key ? "border-wine bg-wine text-sand-raised" : "border-line bg-sand-raised text-ink-soft"
            }`}
          >
            {t.label}
            <span
              className={`rounded-pill px-1.5 text-xs ${tab === t.key ? "bg-sand-raised/20" : "bg-sand-sunken"}`}
            >
              {counts[t.key] ?? 0}
            </span>
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-card border border-line bg-sand-raised">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line bg-sand-sunken/40 text-left text-ink-faint">
              <th className="px-4 py-3 font-medium">N° commande</th>
              <th className="px-4 py-3 font-medium">Cliente</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Montant</th>
              <th className="px-4 py-3 font-medium">Paiement</th>
              <th className="px-4 py-3 font-medium">Statut</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3 font-medium text-ink">{o.numero}</td>
                <td className="px-4 py-3 text-ink-soft">{o.clientNom}</td>
                <td className="px-4 py-3 text-ink-soft">{formatDateTime(o.createdAt)}</td>
                <td className="px-4 py-3 text-ink-soft">{formatFCFA(o.total)}</td>
                <td className="px-4 py-3 text-ink-soft">
                  {o.modePaiement === "WAVE" ? "Wave" : o.modePaiement === "ORANGE_MONEY" ? "Orange Money" : "Livraison"}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={o.statut} />
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => setSelected(o)} className="tap-target rounded-pill border border-line-strong px-4 text-xs font-medium text-ink">
                    Voir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && orders.length === 0 && <p className="py-10 text-center text-ink-soft">Aucune commande dans cette catégorie.</p>}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 sm:items-center" onClick={() => setSelected(null)}>
          <div
            className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-t-card bg-sand-raised p-6 sm:rounded-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-xl font-semibold text-ink">{selected.numero}</h2>
              <button
                onClick={() => setSelected(null)}
                aria-label="Fermer les détails de la commande"
                className="tap-target flex items-center justify-center text-ink-faint"
              >
                <IconX className="h-5 w-5" />
              </button>
            </div>

            <StatusBadge status={selected.statut} />

            <div className="mt-4 space-y-1 text-sm text-ink-soft">
              <p><span className="text-ink-faint">Cliente : </span>{selected.clientNom} · {selected.clientTelephone}</p>
              <p><span className="text-ink-faint">Adresse : </span>{selected.adresseLivraison} {selected.ville ? `(${selected.ville})` : ""}</p>
              <p><span className="text-ink-faint">Paiement : </span>{selected.modePaiement}</p>
            </div>

            <div className="mt-4 divide-y divide-line border-y border-line">
              {selected.articles.map((a) => (
                <div key={a.id} className="flex justify-between py-2 text-sm">
                  <span className="text-ink">{a.nomProduit} <span className="text-ink-faint">({a.taille}, {a.couleur}) ×{a.quantite}</span></span>
                  <span className="text-ink-soft">{formatFCFA(a.prixUnitaire * a.quantite)}</span>
                </div>
              ))}
            </div>

            <div className="mt-3 flex justify-between font-display text-lg font-semibold text-wine">
              <span>Total</span>
              <span>{formatFCFA(selected.total)}</span>
            </div>

            {NEXT_STATUS[selected.statut]?.length > 0 && (
              <div className="mt-5">
                <p className="mb-2 text-sm font-medium text-ink">Faire évoluer le statut</p>
                <div className="flex flex-wrap gap-2">
                  {NEXT_STATUS[selected.statut].map((s) => (
                    <button
                      key={s}
                      onClick={() => updateStatus(selected, s)}
                      className="tap-target rounded-pill bg-wine px-4 text-sm font-medium text-sand-raised hover:bg-wine-soft"
                    >
                      Marquer « {TABS.find((t) => t.key === s)?.label ?? s} »
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
