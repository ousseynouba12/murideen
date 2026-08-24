"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { adminFetch } from "@/lib/admin-api";
import { IconChevronLeft } from "@/components/ui/Icons";
import { ProductForm } from "@/components/admin/ProductForm";
import type { Product } from "@/lib/types";

export default function ModifierProduitPage({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    adminFetch<Product>(`/api/admin/products/${params.id}`).then(setProduct);
  }, [params.id]);

  return (
    <div>
      <div className="mb-5 flex items-center gap-3">
        <Link href="/admin/catalogue" className="tap-target flex items-center justify-center rounded-full border border-line bg-sand-raised">
          <IconChevronLeft className="h-5 w-5 text-ink-soft" />
        </Link>
        <h1 className="font-display text-3xl font-semibold text-ink">Modifier le produit</h1>
      </div>
      {product ? <ProductForm product={product} /> : <p className="text-ink-soft">Chargement…</p>}
    </div>
  );
}
