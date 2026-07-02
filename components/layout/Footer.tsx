import Link from "next/link";
import Logo from "@/components/ui/Logo";

export default function Footer() {
  return (
    <footer role="contentinfo" className="hidden border-t border-border bg-white py-10 md:block">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 sm:grid-cols-4">
        <div>
          <Link href="/" aria-label="Accueil ShopKin" className="inline-block">
            <Logo />
          </Link>
          <p className="mt-3 text-xs leading-relaxed text-muted">
            Marketplace de confiance pour acheter et vendre à Kinshasa.
          </p>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold text-primary">Navigation</h4>
          <ul className="space-y-1.5 text-xs text-muted">
            <li><Link href="/" className="transition hover:text-primary">Accueil</Link></li>
            <li><Link href="/deposer" className="transition hover:text-primary">Déposer une annonce</Link></li>
            <li><Link href="/profil" className="transition hover:text-primary">Mon profil</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold text-primary">Informations</h4>
          <ul className="space-y-1.5 text-xs text-muted">
            <li><Link href="/a-propos" className="transition hover:text-primary">À propos</Link></li>
            <li><Link href="/cgu" className="transition hover:text-primary">Conditions d&apos;utilisation</Link></li>
            <li><Link href="/privacy" className="transition hover:text-primary">Confidentialité</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold text-primary">Contact</h4>
          <p className="text-xs leading-relaxed text-muted">
            Disponible via WhatsApp<br />
            Kinshasa, RDC
          </p>
        </div>
      </div>
      <div className="mx-auto mt-8 max-w-7xl border-t border-border pt-6 text-center text-xs text-muted">
        &copy; {new Date().getFullYear()} ShopKin
      </div>
    </footer>
  );
}
