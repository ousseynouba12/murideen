"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { Product } from "@/lib/types";
import { formatFCFA } from "@/lib/format";
import { IconHeart, IconHeartFilled, IconStar } from "@/components/ui/Icons";

export function ProductCard({ product }: { product: Product }) {
  const [liked, setLiked] = useState(false);
  const image = product.images[0] ?? "https://placehold.co/800x1000/EFE4D2/6F6255?text=Murideen";
  const enRupture = product.stockTotal <= 0;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-card bg-sand-raised border border-line">
      <Link href={`/produit/${product.slug}`} className="relative block aspect-[4/5] overflow-hidden bg-sand-sunken">
        <Image
          src={image}
          alt={product.nom}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {enRupture && (
          <span className="absolute left-3 top-3 rounded-pill bg-warn-tint px-3 py-1 text-xs font-medium text-warn">
            Rupture de stock
          </span>
        )}
      </Link>
      <button
        type="button"
        aria-label="Ajouter à la liste d'envies"
        onClick={(e) => {
          e.preventDefault();
          setLiked((v) => !v);
        }}
        className="tap-target absolute right-2 top-2 flex items-center justify-center rounded-full bg-sand-raised/90 text-wine shadow-sm"
      >
        {liked ? <IconHeartFilled className="h-5 w-5" /> : <IconHeart className="h-5 w-5" />}
      </button>

      <Link href={`/produit/${product.slug}`} className="flex flex-1 flex-col gap-1 p-3">
        <span className="font-display text-base leading-tight text-ink line-clamp-2">{product.nom}</span>
        {product.nbAvis > 0 && (
          <span className="flex items-center gap-1 text-xs text-ink-faint">
            <IconStar className="h-3.5 w-3.5 text-gold" />
            {product.noteMoyenne.toFixed(1)} ({product.nbAvis})
          </span>
        )}
        <span className="mt-1 font-display text-lg font-semibold text-wine">{formatFCFA(product.prix)}</span>
      </Link>
    </div>
  );
}
