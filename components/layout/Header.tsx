'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { getProfile } from '@/lib/profile';
import { getAvatarUrl } from '@/lib/images';
import Logo from '@/components/ui/Logo';
import Avatar from '@/components/ui/Avatar';

type Devise = 'USD' | 'CDF';

interface HeaderProps {
  devise: Devise;
  onDeviseChange: (d: Devise) => void;
}

export default function Header({ devise, onDeviseChange }: HeaderProps) {
  const { user, loading } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState("");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!user) { setAvatarUrl(null); setDisplayName(""); return; }
    getProfile(user.$id).then((p) => {
      const prenom = (p?.prenom as string) || "";
      const nom = (p?.nom as string) || "";
      setDisplayName(prenom || nom ? `${prenom} ${nom}`.trim() : (p?.username as string) || "");
      const raw = (p?.avatar_url as string) || "";
      setAvatarUrl(getAvatarUrl(raw));
    }).catch(() => {});
  }, [user]);

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

          {loading ? (
            // Pendant le chargement de l'auth, on ne rend rien pour éviter le flash du bouton Connexion
            <div className="h-10 w-10 animate-pulse rounded-full bg-zinc-200" />
          ) : user ? (
            <Link
              href="/profil"
              aria-label="Mon profil"
            >
              <Avatar src={avatarUrl} alt={displayName || "Profil"} size={40} fallbackName={displayName || "U"} />
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
