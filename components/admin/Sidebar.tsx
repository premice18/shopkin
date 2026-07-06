"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Package,
  Settings,
  ArrowLeft,
} from "lucide-react";

// Barre latérale de navigation admin avec icônes lucide-react.
// Protégée par AdminGuard — aucun risque d'exposition publique.
const links = [
  { href: "/admin", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/admin/users", label: "Utilisateurs", icon: Users },
  { href: "/admin/annonces", label: "Annonces", icon: Package },
  { href: "/admin/settings", label: "Paramètres", icon: Settings },
];

export default function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-60 flex-col bg-primary text-white shadow-lg">
      <div className="flex items-center gap-2 border-b border-white/10 px-5 py-5">
        <span className="text-xl font-bold tracking-tight">ShopKin</span>
        <span className="rounded-md bg-accent px-2 py-0.5 text-xs font-semibold text-primary">
          Admin
        </span>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4" aria-label="Administration">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = link.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                isActive
                  ? "bg-white/15 text-white"
                  : "text-white/60 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 px-5 py-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm text-white/50 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Retour au site
        </Link>
      </div>
    </aside>
  );
}
