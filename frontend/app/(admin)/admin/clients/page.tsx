"use client";

import { useEffect, useState } from "react";
import { adminFetch } from "@/lib/admin-api";
import { getToken } from "@/lib/auth-client";
import { API_URL } from "@/lib/api";
import { formatFCFA } from "@/lib/format";
import type { Customer } from "@/lib/types";

export default function AdminClientsPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminFetch<Customer[]>("/api/admin/customers").then((c) => {
      setCustomers(c);
      setLoading(false);
    });
  }, []);

  async function exportCsv() {
    const res = await fetch(`${API_URL}/api/admin/customers/export.csv`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "clients-murideen.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h1 className="font-display text-3xl font-semibold text-ink">Clients</h1>
        <button onClick={exportCsv} className="tap-target rounded-pill border border-line-strong px-5 text-sm font-medium text-ink">
          Exporter en CSV
        </button>
      </div>

      <div className="overflow-x-auto rounded-card border border-line bg-sand-raised">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line bg-sand-sunken/40 text-left text-ink-faint">
              <th className="px-4 py-3 font-medium">Nom</th>
              <th className="px-4 py-3 font-medium">Contact</th>
              <th className="px-4 py-3 font-medium">Commandes</th>
              <th className="px-4 py-3 font-medium">Total dépensé</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3 font-medium text-ink">{c.nom}</td>
                <td className="px-4 py-3 text-ink-soft">
                  {c.email}
                  {c.telephone ? ` · ${c.telephone}` : ""}
                </td>
                <td className="px-4 py-3 text-ink-soft">{c.nombreCommandes}</td>
                <td className="px-4 py-3 font-medium text-wine">{formatFCFA(c.totalDepense)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && customers.length === 0 && <p className="py-10 text-center text-ink-soft">Aucun client pour le moment.</p>}
      </div>
    </div>
  );
}
