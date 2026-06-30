'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import Logo from '@/components/ui/Logo';

type Devise = 'USD' | 'CDF';

interface HeaderProps {
  devise: Devise;
  onDeviseChange: (d: Devise) => void;
}

export default function Header({ devise, onDeviseChange }: HeaderProps) {
  const { user } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-white shadow-sm">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4">
        <Link href="/" aria-label="Accueil ShopKin">
          <Logo />
        </Link>

        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-full border border-border p-0.5 font-medium">
            <button
              onClick={() => onDeviseChange('USD')}
              aria-pressed={devise === 'USD'}
              aria-label={`USD ${devise === 'USD' ? 'sélectionné' : 'sélectionner'}`}
              className={`rounded-full px-3 py-1.5 text-sm transition-colors ${
                devise === 'USD'
                  ? 'bg-accent text-primary'
                  : 'text-muted hover:text-primary'
              }`}
            >
              USD
            </button>
            <button
              onClick={() => onDeviseChange('CDF')}
              aria-pressed={devise === 'CDF'}
              aria-label={`CDF ${devise === 'CDF' ? 'sélectionné' : 'sélectionner'}`}
              className={`rounded-full px-3 py-1.5 text-sm transition-colors ${
                devise === 'CDF'
                  ? 'bg-accent text-primary'
                  : 'text-muted hover:text-primary'
              }`}
            >
              CDF
            </button>
          </div>

          {user ? (
            <Link
              href="/profil"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-surface text-muted hover:bg-border transition-colors"
              aria-label="Mon profil"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </Link>
          ) : (
            <Link
              href="/auth/login"
              className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Connexion
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

export type { Devise };
