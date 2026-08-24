"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { adminFetch } from "@/lib/admin-api";
import { getCurrentUser } from "@/lib/auth-client";
import { formatFCFA, formatDate } from "@/lib/format";
import { KpiCard } from "@/components/admin/KpiCard";
import { SalesAreaChart } from "@/components/admin/SalesAreaChart";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { IconTruck, IconShoppingBag, IconAlertTriangle, IconPackage } from "@/components/ui/Icons";
import type { BestSeller, DashboardSummary, LowStock, Order, PageResult, SalesPoint } from "@/lib/types";

export default function AdminDashboardPage() {
  const user = getCurrentUser();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [sales, setSales] = useState<SalesPoint[]>([]);
  const [bestSellers, setBestSellers] = useState<BestSeller[]>([]);
  const [lowStock, setLowStock] = useState<LowStock[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);

  useEffect(() => {
    adminFetch<DashboardSummary>("/api/admin/dashboard/summary").then(setSummary);
    adminFetch<SalesPoint[]>("/api/admin/dashboard/sales").then(setSales);
    adminFetch<BestSeller[]>("/api/admin/dashboard/best-sellers").then(setBestSellers);
    adminFetch<LowStock[]>("/api/admin/dashboard/low-stock").then(setLowStock);
    adminFetch<PageResult<Order>>("/api/admin/dashboard/recent-orders").then((p) => setRecentOrders(p.content));
  }, []);

  const prenom = user?.nom?.split(" ")[0] ?? "";
  const today = new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-semibold text-ink">Bonjour, {prenom}</h1>
        <p className="text-sm capitalize text-ink-soft">{today}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Chiffre d'affaires du jour"
          value={summary ? formatFCFA(summary.chiffreAffairesJour) : "—"}
          hint={summary ? `${summary.variationVsHier >= 0 ? "+" : ""}${summary.variationVsHier}% vs hier` : undefined}
          tone={summary && summary.variationVsHier >= 0 ? "positive" : "negative"}
          icon={<IconShoppingBag className="h-4 w-4" />}
        />
        <KpiCard
          label="Commandes en attente"
          value={summary ? String(summary.commandesEnAttente) : "—"}
          tone="warning"
          icon={<IconTruck className="h-4 w-4" />}
        />
        <KpiCard
          label="Panier moyen"
          value={summary ? formatFCFA(summary.panierMoyen) : "—"}
          tone="neutral"
          icon={<IconShoppingBag className="h-4 w-4" />}
        />
        <KpiCard
          label="Ruptures de stock"
          value={summary ? String(summary.rupturesDeStock) : "—"}
          tone={summary && summary.rupturesDeStock > 0 ? "negative" : "positive"}
          icon={<IconAlertTriangle className="h-4 w-4" />}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-card border border-line bg-sand-raised p-5 lg:col-span-2">
          <h2 className="mb-4 font-display text-lg font-semibold text-ink">Ventes des 7 derniers jours</h2>
          <SalesAreaChart data={sales} />
        </div>

        <div className="rounded-card border border-line bg-sand-raised p-5">
          <h2 className="mb-4 font-display text-lg font-semibold text-ink">Meilleures ventes</h2>
          <div className="flex flex-col gap-3">
            {bestSellers.map((b) => (
              <div key={b.productId}>
                <div className="flex justify-between text-sm">
                  <span className="text-ink">{b.nom}</span>
                  <span className="text-ink-soft">{b.nbVentes}</span>
                </div>
                <div className="mt-1 h-1.5 rounded-pill bg-sand-sunken">
                  <div className="h-1.5 rounded-pill bg-gold" style={{ width: `${Math.max(6, b.proportion * 100)}%` }} />
                </div>
              </div>
            ))}
            {bestSellers.length === 0 && <p className="text-sm text-ink-soft">Aucune vente pour le moment.</p>}
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-card border border-line bg-sand-raised p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-ink">Commandes récentes</h2>
            <Link href="/admin/commandes" className="text-sm text-wine hover:underline">
              Voir tout
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-ink-faint">
                  <th className="py-2 font-medium">Commande</th>
                  <th className="py-2 font-medium">Cliente</th>
                  <th className="py-2 font-medium">Montant</th>
                  <th className="py-2 font-medium">Statut</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o) => (
                  <tr key={o.id} className="border-b border-line last:border-0">
                    <td className="py-2.5 font-medium text-ink">{o.numero}</td>
                    <td className="py-2.5 text-ink-soft">{o.clientNom}</td>
                    <td className="py-2.5 text-ink-soft">{formatFCFA(o.total)}</td>
                    <td className="py-2.5">
                      <StatusBadge status={o.statut} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {recentOrders.length === 0 && <p className="py-6 text-center text-ink-soft">Aucune commande.</p>}
          </div>
        </div>

        <div className="rounded-card border border-line bg-sand-raised p-5">
          <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold text-ink">
            <IconPackage className="h-5 w-5 text-warn" /> Stock faible
          </h2>
          <div className="flex flex-col gap-3">
            {lowStock.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div>
                  <p className="text-ink">{item.nom}</p>
                  <p className="text-xs text-ink-faint">
                    {item.taille} · {item.couleur}
                  </p>
                </div>
                <span className={`font-medium ${item.stock === 0 ? "text-warn" : "text-gold-deep"}`}>
                  {item.stock === 0 ? "Rupture" : `${item.stock} restants`}
                </span>
              </div>
            ))}
            {lowStock.length === 0 && <p className="text-sm text-ink-soft">Tous les stocks sont sains.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
