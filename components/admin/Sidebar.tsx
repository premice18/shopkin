"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin", label: "Tableau de bord", icon: "📊" },
  { href: "/admin/users", label: "Utilisateurs", icon: "👥" },
  { href: "/admin/annonces", label: "Annonces", icon: "📦" },
  { href: "/admin/settings", label: "Paramètres", icon: "⚙️" },
];

export default function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-60 flex-col bg-primary text-white">
      <div className="flex items-center gap-2 border-b border-white/10 px-5 py-5">
        <span className="text-xl font-bold tracking-tight">ShopKin</span>
        <span className="rounded-md bg-accent px-2 py-0.5 text-xs font-semibold text-primary">
          Admin
        </span>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4" aria-label="Administration">
        {links.map((link) => {
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
              <span className="text-base">{link.icon}</span>
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
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Retour au site
        </Link>
      </div>
    </aside>
  );
}
