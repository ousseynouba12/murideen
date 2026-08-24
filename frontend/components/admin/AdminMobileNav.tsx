"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconLayoutDashboard,
  IconPackage,
  IconShoppingBag,
  IconUsers,
  IconTag,
  IconSettings,
} from "@/components/ui/Icons";

const NAV_ITEMS = [
  { href: "/admin", label: "Tableau de bord", icon: IconLayoutDashboard, exact: true },
  { href: "/admin/catalogue", label: "Catalogue", icon: IconPackage },
  { href: "/admin/commandes", label: "Commandes", icon: IconShoppingBag },
  { href: "/admin/clients", label: "Clients", icon: IconUsers },
  { href: "/admin/promotions", label: "Promotions", icon: IconTag },
  { href: "/admin/reglages", label: "Réglages", icon: IconSettings },
];

export function AdminMobileNav() {
  const pathname = usePathname();

  return (
    <div className="border-b border-line bg-wine text-sand-raised md:hidden">
      <div className="px-4 py-3">
        <span className="font-display text-xl italic">Murideen</span>
      </div>
      <div className="flex gap-1 overflow-x-auto no-scrollbar px-3 pb-2">
        {NAV_ITEMS.map((item) => {
          const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`tap-target flex items-center gap-2 whitespace-nowrap rounded-pill px-4 text-sm font-medium ${
                isActive ? "bg-sand-raised/15" : "text-sand-raised/70"
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
