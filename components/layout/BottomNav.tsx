'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, CirclePlus, User } from 'lucide-react';

const links = [
  {
    label: 'Accueil',
    href: '/',
    icon: Home,
  },
  {
    label: 'Déposer',
    href: '/deposer',
    icon: CirclePlus,
  },
  {
    label: 'Profil',
    href: '/profil',
    icon: User,
  },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav role="navigation" aria-label="Navigation principale" className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.05)] pb-safe md:hidden">
      <div className="mx-auto flex max-w-lg items-center justify-around py-1">
        {links.map((link) => {
          const isActive = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);
          const Icon = link.icon;
          return (
            <Link
              key={link.label}
              href={link.href}
              className={`flex flex-col items-center gap-0.5 px-5 py-2 min-w-[72px] min-h-[52px] items-center justify-center transition-colors rounded-xl ${
                isActive ? 'text-primary bg-primary/5' : 'text-muted hover:text-primary hover:bg-zinc-50'
              }`}
              aria-label={link.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className="h-6 w-6" aria-hidden="true" />
              <span className="text-[11px] font-medium">{link.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
