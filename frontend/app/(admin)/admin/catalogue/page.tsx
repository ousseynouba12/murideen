"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { adminFetch } from "@/lib/admin-api";
import { formatFCFA } from "@/lib/format";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { IconPlus } from "@/components/ui/Icons";
import type { PageResult, Product } from "@/lib/types";

export default function AdminCataloguePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const query = new URLSearchParams();
    if (search) query.set("search", search);
    query.set("size", "100");
    const page = await adminFetch<PageResult<Product>>(`/api/admin/products?${query.toString()}`);
    setProducts(page.content);
    setLoading(false);
  }

  useEffect(() => {
    const timeout = setTimeout(load, 300);
    return () => clearTimeout(timeout);
  }, [search]);

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h1 className="font-display text-3xl font-semibold text-ink">Catalogue</h1>
        <Link href="/admin/catalogue/nouveau" className="tap-target flex items-center gap-2 rounded-pill bg-wine px-5 text-sm font-medium text-sand-raised hover:bg-wine-soft">
          <IconPlus className="h-4 w-4" /> Nouveau produit
        </Link>
      </div>

      <input
        placeholder="Rechercher un produit…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="tap-target mb-4 w-full max-w-sm rounded-pill border border-line bg-sand-raised px-4 text-sm"
      />

      <div className="overflow-x-auto rounded-card border border-line bg-sand-raised">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line bg-sand-sunken/40 text-left text-ink-faint">
              <th className="px-4 py-3 font-medium">Produit</th>
              <th className="px-4 py-3 font-medium">Catégorie</th>
              <th className="px-4 py-3 font-medium">Prix</th>
              <th className="px-4 py-3 font-medium">Stock</th>
              <th className="px-4 py-3 font-medium">Statut</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3 font-medium text-ink">{p.nom}</td>
                <td className="px-4 py-3 text-ink-soft">{p.categorie.nom}</td>
                <td className="px-4 py-3 text-ink-soft">{formatFCFA(p.prix)}</td>
                <td className="px-4 py-3">
                  <span className={p.stockTotal === 0 ? "text-warn font-medium" : "text-ink-soft"}>{p.stockTotal}</span>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={p.statut} />
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/catalogue/${p.id}`} className="tap-target rounded-pill border border-line-strong px-4 text-xs font-medium text-ink">
                    Modifier
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && products.length === 0 && <p className="py-10 text-center text-ink-soft">Aucun produit trouvé.</p>}
      </div>
    </div>
  );
}
