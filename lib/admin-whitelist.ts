export function isEmailAllowedForAdmin(email: string): boolean {
  const raw = process.env.ALLOWED_ADMIN_EMAILS || "";
  if (!raw.trim()) return false;
  const allowed = raw.split(",").map((e) => e.trim().toLowerCase());
  return allowed.includes(email.toLowerCase());
}
