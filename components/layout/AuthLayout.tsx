"use client";

import Link from "next/link";
import Logo from "@/components/ui/Logo";

interface AuthLayoutProps {
  children: React.ReactNode;
  variant: "login" | "register";
}

const benefits = [
  {
    icon: (
      <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    title: "Achats sécurisés",
    desc: "Lieux publics recommandés pour toutes vos rencontres.",
  },
  {
    icon: (
      <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
        <line x1="12" y1="18" x2="12.01" y2="18" />
      </svg>
    ),
    title: "Paiement Mobile Money",
    desc: "M-Pesa, Airtel Money, Orange Money.",
  },
  {
    icon: (
      <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    title: "Livraison flexible",
    desc: "Remise en main propre ou livraison à domicile.",
  },
  {
    icon: (
      <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    title: "Communaute kinoise",
    desc: "Des milliers d'acheteurs et vendeurs a Kinshasa.",
  },
];

const socialProofs = ["+2000 membres actifs", "Taux de confiance 4.8/5", "24 communes couvertes"];

export default function AuthLayout({ children, variant }: AuthLayoutProps) {
  const headline = variant === "login" ? "Bon retour parmi nous" : "Pret a rejoindre la communaute ?";
  const subtitle = variant === "login"
    ? "Connectez-vous pour acheter, vendre et echanger avec des milliers de Kinois."
    : "Creez votre compte en 2 minutes et accedez au plus grand marche de Kinshasa.";

  return (
    <div className="min-h-screen md:h-screen md:overflow-hidden md:flex md:flex-row">
      {/* Left column — Form (scrollable independently) */}
      <div className="flex flex-col bg-surface md:w-1/2 md:h-screen md:overflow-y-auto md:shrink-0">
        {/* Mini header with logo */}
        <div className="shrink-0 px-6 pt-6 pb-2 md:px-10 md:pt-10">
          <Link href="/" aria-label="Accueil ShopKin" className="inline-block">
            <Logo />
          </Link>
        </div>

        {/* Form card — centered via spacers on desktop, natural flow on mobile */}
        <div className="hidden md:block md:flex-1" />
        <div className="w-full max-w-md mx-auto shrink-0 px-6 pb-10 md:px-0">
          {children}
        </div>
        <div className="hidden md:block md:flex-1" />
      </div>

      {/* Right column — Marketing (desktop only, fixed, centered) */}
      <aside className="hidden md:flex md:w-1/2 md:h-screen md:shrink-0 md:flex-col md:items-center md:justify-center md:relative md:overflow-hidden md:bg-gradient-to-br md:from-[#0B192C] md:via-[#0F1F35] md:to-[#1A365D]">
        {/* Decorative blurred circles */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-[30rem] w-[30rem] rounded-full bg-accent/[0.04] blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-white/[0.03] blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute top-1/3 right-1/3 h-40 w-40 rounded-full bg-blue-500/[0.06] blur-3xl" aria-hidden="true" />

        <div className="relative z-10 mx-auto w-full max-w-sm px-8 py-16 lg:max-w-md">
          {/* Logo */}
          <div className="mb-14 text-center">
            <span className="inline-flex items-baseline gap-0 font-heading text-3xl font-bold tracking-tight text-white lg:text-4xl">
              <span className="text-white/90">S</span>
              <span className="text-white/50">hop</span>
              <span className="text-accent">K</span>
              <span className="text-white/50">in</span>
            </span>
          </div>

          {/* Headline */}
          <h2 className="text-center font-heading text-[1.75rem] font-bold leading-tight text-white lg:text-[2rem]">
            {headline}
          </h2>
          <p className="mx-auto mt-4 max-w-xs text-center text-base leading-relaxed text-white/50">
            {subtitle}
          </p>

          {/* Benefits — glass cards */}
          <ul className="mt-12 space-y-3">
            {benefits.map((b) => (
              <li
                key={b.title}
                className="group flex items-center gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.04] px-5 py-4 transition hover:border-white/[0.14] hover:bg-white/[0.07]"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.08] text-accent transition group-hover:bg-white/[0.12]">
                  {b.icon}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white">{b.title}</p>
                  <p className="mt-px text-sm text-white/45">{b.desc}</p>
                </div>
              </li>
            ))}
          </ul>

          {/* Social proof */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 border-t border-white/[0.08] pt-7 text-sm text-white/40">
            {socialProofs.map((s) => (
              <span key={s} className="flex items-center gap-1.5">
                <svg className="h-3.5 w-3.5 text-accent" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
                {s}
              </span>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}
