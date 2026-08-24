import Link from "next/link";
import { getCategories, getProducts } from "@/lib/shop-api";
import { CategoryChips } from "@/components/shop/CategoryChips";
import { ProductCard } from "@/components/shop/ProductCard";
import { SortSelect } from "@/components/shop/SortSelect";
import { IconChevronLeft } from "@/components/ui/Icons";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: { category?: string; sort?: string; search?: string };
}

export default async function CataloguePage({ searchParams }: Props) {
  const category = searchParams.category ?? "toutes";
  const sort = searchParams.sort ?? "nouveautes";

  const [categories, page] = await Promise.all([
    getCategories(),
    getProducts({ category, sort, search: searchParams.search, size: 40 }),
  ]);

  const categoryLabel =
    category === "toutes" ? "Toutes" : categories.find((c) => c.slug === category)?.nom ?? "Toutes";

  return (
    <main className="px-4 pt-6">
      <div className="mb-4 flex items-center gap-3">
        <Link href="/" className="tap-target flex items-center justify-center rounded-full border border-line bg-sand-raised">
          <IconChevronLeft className="h-5 w-5 text-ink-soft" />
        </Link>
        <h1 className="font-display text-2xl font-semibold text-ink">Catalogue</h1>
      </div>

      <CategoryChips categories={categories} active={category} />

      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm text-ink-soft">
          {page.totalElements} article{page.totalElements > 1 ? "s" : ""} · {categoryLabel}
        </p>
        <SortSelect value={sort} />
      </div>

      {page.content.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-24 text-center">
          <p className="font-display text-xl text-ink">Aucun article dans cette catégorie</p>
          <p className="text-sm text-ink-soft">Revenez bientôt, de nouvelles pièces arrivent régulièrement.</p>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {page.content.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </main>
  );
}
