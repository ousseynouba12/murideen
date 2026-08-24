"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import type { Product } from "@/lib/types";
import { formatFCFA } from "@/lib/format";
import { IconMinus, IconPlus, IconStar, IconCheck } from "@/components/ui/Icons";
import { addToCart } from "@/lib/cart-client";

export function ProductDetail({ product }: { product: Product }) {
  const images = product.images.length ? product.images : ["https://placehold.co/800x1000/EFE4D2/6F6255?text=Murideen"];
  const [activeImage, setActiveImage] = useState(0);

  const tailles = useMemo(() => Array.from(new Set(product.variantes.map((v) => v.taille))), [product.variantes]);
  const couleurs = useMemo(() => Array.from(new Set(product.variantes.map((v) => v.couleur))), [product.variantes]);

  const [taille, setTaille] = useState(tailles[0] ?? "");
  const [couleur, setCouleur] = useState(couleurs[0] ?? "");
  const [quantite, setQuantite] = useState(1);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  const selectedVariant = product.variantes.find((v) => v.taille === taille && v.couleur === couleur);
  const stock = selectedVariant?.stock ?? 0;
  const total = product.prix * quantite;

  async function handleAdd() {
    if (!selectedVariant || stock < 1) return;
    setStatus("loading");
    try {
      await addToCart(selectedVariant.id, quantite);
      setStatus("done");
      setTimeout(() => setStatus("idle"), 2000);
      window.dispatchEvent(new Event("murideen:cart-updated"));
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="pb-28">
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-sand-sunken">
        <Image src={images[activeImage]} alt={product.nom} fill sizes="100vw" className="object-cover" priority />
        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                aria-label={`Voir l'image ${i + 1}`}
                onClick={() => setActiveImage(i)}
                className={`h-1.5 rounded-pill transition-all ${i === activeImage ? "w-6 bg-wine" : "w-1.5 bg-sand-raised/80"}`}
              />
            ))}
          </div>
        )}
      </div>

      <div className="px-4 pt-5">
        <p className="text-xs uppercase tracking-[0.2em] text-ink-faint">{product.categorie.nom}</p>
        <h1 className="mt-1 font-display text-2xl font-semibold text-ink">{product.nom}</h1>

        {product.nbAvis > 0 && (
          <div className="mt-2 flex items-center gap-1.5 text-sm text-ink-soft">
            <IconStar className="h-4 w-4 text-gold" />
            <span className="font-medium text-ink">{product.noteMoyenne.toFixed(1)}</span>
            <span>({product.nbAvis} avis)</span>
          </div>
        )}

        <p className="mt-3 font-display text-2xl font-semibold text-wine">{formatFCFA(product.prix)}</p>

        {tailles.length > 0 && (
          <div className="mt-6">
            <p className="mb-2 text-sm font-medium text-ink">Taille</p>
            <div className="flex flex-wrap gap-2">
              {tailles.map((t) => (
                <button
                  key={t}
                  onClick={() => setTaille(t)}
                  className={`tap-target rounded-pill border px-5 text-sm font-medium ${
                    t === taille ? "border-wine bg-wine text-sand-raised" : "border-line bg-sand-raised text-ink-soft"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        )}

        {couleurs.length > 1 && (
          <div className="mt-5">
            <p className="mb-2 text-sm font-medium text-ink">Couleur</p>
            <div className="flex flex-wrap gap-2">
              {couleurs.map((c) => (
                <button
                  key={c}
                  onClick={() => setCouleur(c)}
                  className={`tap-target rounded-pill border px-4 text-sm font-medium ${
                    c === couleur ? "border-wine bg-wine-tint text-wine" : "border-line bg-sand-raised text-ink-soft"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6">
          <p className="mb-2 text-sm font-medium text-ink">Quantité</p>
          <div className="flex items-center gap-4">
            <div className="flex items-center rounded-pill border border-line">
              <button
                aria-label="Diminuer la quantité"
                onClick={() => setQuantite((q) => Math.max(1, q - 1))}
                className="tap-target flex items-center justify-center px-3"
              >
                <IconMinus className="h-4 w-4" />
              </button>
              <span className="w-8 text-center text-sm font-medium">{quantite}</span>
              <button
                aria-label="Augmenter la quantité"
                onClick={() => setQuantite((q) => Math.min(stock || 1, q + 1))}
                className="tap-target flex items-center justify-center px-3"
              >
                <IconPlus className="h-4 w-4" />
              </button>
            </div>
            <span className="text-sm text-ink-faint">
              {stock > 0 ? `${stock} en stock` : "Rupture de stock"}
            </span>
          </div>
        </div>

        {product.description && (
          <div className="mt-8">
            <p className="mb-2 text-sm font-medium text-ink">Description</p>
            <p className="text-sm leading-relaxed text-ink-soft">{product.description}</p>
          </div>
        )}
      </div>

      <div className="fixed bottom-16 left-0 right-0 z-30 border-t border-line bg-sand-raised px-4 py-3">
        <div className="mx-auto flex max-w-3xl items-center gap-4">
          <div className="flex-1">
            <p className="text-xs text-ink-faint">Total</p>
            <p className="font-display text-lg font-semibold text-wine">{formatFCFA(total)}</p>
          </div>
          <button
            onClick={handleAdd}
            disabled={stock < 1 || status === "loading"}
            className="tap-target flex flex-1 items-center justify-center gap-2 rounded-pill bg-wine px-6 text-sm font-medium text-sand-raised transition-colors hover:bg-wine-soft disabled:opacity-50"
          >
            {status === "done" ? (
              <>
                <IconCheck className="h-4 w-4" /> Ajouté au panier
              </>
            ) : stock < 1 ? (
              "Rupture de stock"
            ) : (
              "Ajouter au panier"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
