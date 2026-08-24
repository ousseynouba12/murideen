"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type { Category } from "@/lib/types";

export function CategoryChips({ categories, active }: { categories: Category[]; active: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const items = [{ id: 0, nom: "Toutes", slug: "toutes", ordre: -1 }, ...categories];

  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar px-4 py-1 -mx-4">
      {items.map((cat) => {
        const params = new URLSearchParams(searchParams.toString());
        if (cat.slug === "toutes") {
          params.delete("category");
        } else {
          params.set("category", cat.slug);
        }
        const isActive = active === cat.slug;
        const href = `${pathname}?${params.toString()}`;
        return (
          <Link
            key={cat.slug}
            href={href}
            className={`tap-target flex items-center whitespace-nowrap rounded-pill px-5 text-sm font-medium transition-colors border ${
              isActive
                ? "bg-wine text-sand-raised border-wine"
                : "bg-sand-raised text-ink-soft border-line hover:border-line-strong"
            }`}
          >
            {cat.nom}
          </Link>
        );
      })}
    </div>
  );
}
