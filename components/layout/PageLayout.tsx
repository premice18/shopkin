import Link from "next/link";
import Logo from "@/components/ui/Logo";

interface PageLayoutProps {
  children: React.ReactNode;
}

export default function PageLayout({ children }: PageLayoutProps) {
  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 flex h-16 items-center border-b border-border bg-white px-6">
        <Link href="/" aria-label="Accueil ShopKin" className="flex items-center gap-3">
          <Logo />
        </Link>
      </header>
      <main className="min-h-screen bg-surface pt-16">
        <div className="mx-auto max-w-3xl px-4 py-10">{children}</div>
      </main>
    </>
  );
}
