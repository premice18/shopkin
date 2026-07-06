// Layout minimal sans AdminGuard pour que la page de connexion admin
// soit accessible sans être connecté. Sans ce layout, le layout parent
// app/admin/layout.tsx wrapperait avec AdminGuard qui créérait une boucle
// de redirection (AdminGuard renvoie vers /admin/login).
export default function AdminLoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
