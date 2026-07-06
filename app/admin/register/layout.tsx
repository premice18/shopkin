// Layout minimal sans AdminGuard pour que la page d'inscription admin
// soit accessible sans être connecté (contrairement au layout admin parent)
export default function AdminRegisterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
