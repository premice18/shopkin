import Link from "next/link";
import PageLayout from "@/components/layout/PageLayout";

export default function AProposPage() {
  return (
    <PageLayout>
      <article className="space-y-8">
        {/* Hero */}
        <div className="rounded-2xl bg-gradient-to-br from-primary to-[#152A45] p-8 text-white md:p-12">
          <h1 className="font-heading text-3xl font-bold">A propos de ShopKin</h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-white/70">
            Connecter les Kinois pour des transactions simples, sures et rapides.
          </p>
        </div>

        {/* Mission */}
        <section className="rounded-2xl bg-white p-8 shadow-sm md:p-12">
          <h2 className="font-heading text-2xl font-bold text-primary">Notre mission</h2>
          <p className="mt-4 text-sm leading-relaxed text-muted">
            ShopKin est ne d&apos;un constat simple : a Kinshasa, des milliers de biens s&apos;echangent
            chaque jour sans plateforme dediee, fiable et adaptee au contexte local. Entre les
            groupes WhatsApp satures et les reseaux sociaux peu structurés, il manquait un espace
            concu specialement pour les Kinois.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Notre mission est de offrir a chaque Kinois un outil simple, rapide et sur pour
            acheter et vendre, en mettant l&apos;accent sur la confiance et la proximite.
          </p>
        </section>

        {/* Valeurs */}
        <section className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15 text-accent">
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <h3 className="mt-4 text-base font-semibold text-primary">Confiance</h3>
            <p className="mt-1 text-sm text-muted">
              Nous recommandons les rencontres dans des lieux publics et ne divulguons jamais les
              coordonnees sans action explicite de l&apos;utilisateur.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15 text-accent">
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
            <h3 className="mt-4 text-base font-semibold text-primary">Simplicite</h3>
            <p className="mt-1 text-sm text-muted">
              Deposez une annonce en quelques clics, discutez sur WhatsApp, et trouvez un acheteur
              pres de chez vous.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15 text-accent">
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <h3 className="mt-4 text-base font-semibold text-primary">Proximite</h3>
            <p className="mt-1 text-sm text-muted">
              Pense pour Kinshasa et ses 24 communes, ShopKin favorise les echanges de quartier
              et la vie locale.
            </p>
          </div>
        </section>

        {/* Comment ca marche */}
        <section className="rounded-2xl bg-white p-8 shadow-sm md:p-12">
          <h2 className="font-heading text-2xl font-bold text-primary">Comment ca marche ?</h2>
          <div className="mt-8 grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent/15 text-accent">
                <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 5v14" />
                  <path d="M5 12h14" />
                </svg>
              </div>
              <h3 className="mt-4 text-base font-semibold text-primary">1. Publiez</h3>
              <p className="mt-1 text-sm text-muted">
                Prenez une photo, decrivez votre article et fixez votre prix. Votre annonce est
                en ligne en quelques minutes.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent/15 text-accent">
                <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <h3 className="mt-4 text-base font-semibold text-primary">2. Discutez</h3>
              <p className="mt-1 text-sm text-muted">
                Les acheteurs vous contactent directement sur WhatsApp. Pas de messagerie
                interne, que du concret.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent/15 text-accent">
                <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <h3 className="mt-4 text-base font-semibold text-primary">3. Rencontrez</h3>
              <p className="mt-1 text-sm text-muted">
                Convenez d&apos;un lieu public pour l&apos;echange. Main propre ou livraison, a
                vous de choisir.
              </p>
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <div className="rounded-2xl bg-surface p-8 text-center md:p-12">
          <h2 className="font-heading text-xl font-bold text-primary">Une question ?</h2>
          <p className="mt-2 text-sm text-muted">
            Nous sommes disponibles via WhatsApp pour toute demande.
          </p>
          <Link
            href="/"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Retourner a l&apos;accueil
          </Link>
        </div>
      </article>
    </PageLayout>
  );
}
