"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { logout, getCurrentUser } from "@/lib/auth-client";
import {
  IconLayoutDashboard,
  IconPackage,
  IconShoppingBag,
  IconUsers,
  IconTag,
  IconSettings,
  IconLogout,
} from "@/components/ui/Icons";

const NAV_ITEMS = [
  { href: "/admin", label: "Tableau de bord", icon: IconLayoutDashboard, exact: true },
  { href: "/admin/catalogue", label: "Catalogue", icon: IconPackage },
  { href: "/admin/commandes", label: "Commandes", icon: IconShoppingBag },
  { href: "/admin/clients", label: "Clients", icon: IconUsers },
  { href: "/admin/promotions", label: "Promotions", icon: IconTag },
  { href: "/admin/reglages", label: "Réglages", icon: IconSettings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = getCurrentUser();

  return (
    <aside className="hidden w-64 flex-shrink-0 flex-col bg-wine text-sand-raised md:flex">
      <div className="px-6 py-7">
        <span className="font-display text-2xl italic">Murideen</span>
        <p className="mt-1 text-xs text-sand-raised/60">Espace de gestion</p>
      </div>
      <nav className="flex flex-1 flex-col gap-1 px-3">
        {NAV_ITEMS.map((item) => {
          const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`tap-target flex items-center gap-3 rounded-[12px] px-4 text-sm font-medium transition-colors ${
                isActive ? "bg-sand-raised/15 text-sand-raised" : "text-sand-raised/70 hover:bg-sand-raised/10"
              }`}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-sand-raised/15 px-4 py-4">
        <p className="px-2 text-xs text-sand-raised/60">{user?.nom}</p>
        <button
          onClick={() => {
            logout();
            router.push("/admin/connexion");
          }}
          className="tap-target mt-1 flex w-full items-center gap-2 rounded-[12px] px-2 text-sm text-sand-raised/80 hover:bg-sand-raised/10"
        >
          <IconLogout className="h-4 w-4" /> Se déconnecter
        </button>
      </div>
    </aside>
  );
}
