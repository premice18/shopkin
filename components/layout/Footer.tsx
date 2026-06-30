export default function Footer() {
  return (
    <footer role="contentinfo" className="hidden border-t border-border bg-white py-8 md:block">
      <div className="mx-auto max-w-7xl px-4 text-center text-sm text-muted">
        <p>&copy; {new Date().getFullYear()} ShopKin — Kinshasa</p>
        <p className="mt-1 text-xs">
          Marketplace de confiance pour acheter et vendre à Kinshasa.
        </p>
      </div>
    </footer>
  );
}
