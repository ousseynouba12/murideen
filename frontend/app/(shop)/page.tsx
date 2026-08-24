import Link from "next/link";
import { getBestSellers, getCategories } from "@/lib/shop-api";
import { HomeCategoryChips } from "@/components/shop/HomeCategoryChips";
import { ProductCard } from "@/components/shop/ProductCard";

// Rendu dynamique : évite de dépendre du backend au moment du build de l'image Docker.
// Les appels fetch() ci-dessous utilisent tout de même { next: { revalidate } } (Data Cache ISR).
export const dynamic = "force-dynamic";

export default async function AccueilPage() {
  const [categories, bestSellers] = await Promise.all([getCategories(), getBestSellers()]);

  return (
    <main>
      <section
        className="relative overflow-hidden px-6 pb-10 pt-14 text-sand-raised"
        style={{
          background:
            "linear-gradient(135deg, var(--wine) 0%, var(--wine-soft) 45%, var(--ink) 100%)",
        }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "repeating-linear-gradient(115deg, transparent 0 22px, rgba(255,255,255,0.6) 22px 23px)",
          }}
        />
        <div className="relative mx-auto max-w-3xl">
          <p className="mb-3 font-display text-sm uppercase tracking-[0.3em] text-gold-tint">Nouvelle collection</p>
          <h1 className="font-display text-4xl italic leading-tight sm:text-5xl">
            L'élégance sénégalaise,<br />réinventée pour vous.
          </h1>
          <p className="mt-4 max-w-md text-sand-raised/85">
            Robes, ensembles, boubous et accessoires façonnés avec soin. Chaque pièce raconte une histoire d'artisanat et de style.
          </p>
          <Link
            href="/catalogue"
            className="tap-target mt-6 inline-flex items-center rounded-pill bg-gold px-7 text-sm font-medium text-ink hover:bg-gold-deep hover:text-sand-raised"
          >
            Découvrir la boutique
          </Link>
        </div>
      </section>

      <section className="px-4 pt-6">
        <HomeCategoryChips categories={categories} />
      </section>

      <section className="px-4 pt-8">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="font-display text-2xl font-semibold text-ink">Sélection du moment</h2>
          <Link href="/catalogue" className="text-sm font-medium text-wine hover:underline">
            Tout voir
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {bestSellers.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        {bestSellers.length === 0 && (
          <p className="py-10 text-center text-ink-soft">Aucun produit disponible pour le moment.</p>
        )}
      </section>
    </main>
  );
}
