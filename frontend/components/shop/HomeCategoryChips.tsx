import Link from "next/link";
import type { Category } from "@/lib/types";

export function HomeCategoryChips({ categories }: { categories: Category[] }) {
  const items = [{ id: 0, nom: "Toutes", slug: "toutes", ordre: -1 }, ...categories];
  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar px-4 py-1 -mx-4">
      {items.map((cat) => (
        <Link
          key={cat.slug}
          href={cat.slug === "toutes" ? "/catalogue" : `/catalogue?category=${cat.slug}`}
          className="tap-target flex items-center whitespace-nowrap rounded-pill border border-line bg-sand-raised px-5 text-sm font-medium text-ink-soft transition-colors hover:border-line-strong"
        >
          {cat.nom}
        </Link>
      ))}
    </div>
  );
}
