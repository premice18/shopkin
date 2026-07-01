'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  {
    label: 'Accueil',
    href: '/',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" aria-hidden="true">
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    label: 'Déposer',
    href: '/deposer',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="16" />
        <line x1="8" y1="12" x2="16" y2="12" />
      </svg>
    ),
  },
  {
    label: 'Profil',
    href: '/profil',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" aria-hidden="true">
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav role="navigation" aria-label="Navigation principale" className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-white pb-safe md:hidden">
      <div className="mx-auto flex max-w-lg items-center justify-around py-1">
        {links.map((link) => {
          const isActive = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);
          return (
            <Link
              key={link.label}
              href={link.href}
              className={`flex flex-col items-center gap-0.5 px-4 py-2 min-w-[64px] transition-colors rounded-lg ${
                isActive ? 'text-primary bg-primary/5' : 'text-muted hover:text-primary hover:bg-zinc-50'
              }`}
              aria-label={link.label}
              aria-current={isActive ? 'page' : undefined}
            >
              {link.icon}
              <span className="text-[11px] font-medium">{link.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
