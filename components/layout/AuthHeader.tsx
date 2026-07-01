import Link from "next/link";
import Logo from "@/components/ui/Logo";

export default function AuthHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-white shadow-sm">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-center px-4 sm:justify-start">
        <Link href="/" aria-label="Accueil ShopKin">
          <Logo />
        </Link>
      </div>
    </header>
  );
}
