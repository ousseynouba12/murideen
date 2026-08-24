"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { IconHome, IconSearch, IconBag, IconUser } from "@/components/ui/Icons";
import { fetchCart } from "@/lib/cart-client";

const NAV_ITEMS = [
  { href: "/", label: "Accueil", icon: IconHome },
  { href: "/catalogue", label: "Recherche", icon: IconSearch },
  { href: "/panier", label: "Panier", icon: IconBag },
  { href: "/compte", label: "Compte", icon: IconUser },
];

export function BottomNav() {
  const pathname = usePathname();
  const [count, setCount] = useState(0);

  useEffect(() => {
    let active = true;
    function refresh() {
      fetchCart()
        .then((cart) => {
          if (active) setCount(cart.nombreArticles);
        })
        .catch(() => {});
    }
    refresh();
    window.addEventListener("murideen:cart-updated", refresh);
    return () => {
      active = false;
      window.removeEventListener("murideen:cart-updated", refresh);
    };
  }, [pathname]);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-line bg-sand-raised/95 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-stretch justify-around">
        {NAV_ITEMS.map((item) => {
          const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`tap-target relative flex flex-1 flex-col items-center justify-center gap-1 py-2 text-[11px] font-medium ${
                isActive ? "text-wine" : "text-ink-faint"
              }`}
            >
              <span className="relative">
                <Icon className="h-6 w-6" />
                {item.href === "/panier" && count > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-pill bg-wine px-1 text-[10px] font-semibold text-sand-raised">
                    {count}
                  </span>
                )}
              </span>
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
