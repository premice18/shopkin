"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { getAdminJWT } from "@/lib/admin";
import { useToast } from "@/lib/contexts/ToastContext";
import Link from "next/link";

export default function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { success, error: toastError } = useToast();
  const [user, setUser] = useState<Record<string, unknown> | null>(null);
  const [annonces, setAnnonces] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminJWT()
      .then((jwt) =>
        fetch(`/api/admin/users/${id}`, {
          headers: { Authorization: `Bearer ${jwt}` },
        })
      )
      .then((r) => r.json())
      .then((data) => {
        if (data.error) { toastError(data.error); return; }
        setUser(data.user);
        setAnnonces(data.annonces || []);
      })
      .catch(() => toastError("Erreur de chargement"))
      .finally(() => setLoading(false));
  }, [id, toastError]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return <p className="text-sm text-muted">Utilisateur introuvable</p>;
  }

  const handleSuspend = async () => {
    const suspended = !(user.suspended as boolean);
    try {
      const jwt = await getAdminJWT();
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${jwt}`, "Content-Type": "application/json" },
        body: JSON.stringify({ suspended }),
      });
      if (res.ok) {
        success(suspended ? "Utilisateur suspendu" : "Utilisateur réactivé");
        setUser((prev) => ({ ...prev!, suspended }));
      } else {
        toastError("Erreur");
      }
    } catch {
      toastError("Erreur réseau");
    }
  };

  const handleRoleToggle = async () => {
    const newRole = user.role === "admin" ? "user" : "admin";
    try {
      const jwt = await getAdminJWT();
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${jwt}`, "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        success(`Rôle changé en ${newRole}`);
        setUser((prev) => ({ ...prev!, role: newRole }));
      } else {
        toastError("Erreur");
      }
    } catch {
      toastError("Erreur réseau");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Supprimer cet utilisateur et toutes ses annonces ?")) return;
    try {
      const jwt = await getAdminJWT();
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${jwt}` } });
      if (res.ok) {
        success("Utilisateur supprimé");
        router.push("/admin/users");
      } else {
        toastError("Erreur");
      }
    } catch {
      toastError("Erreur réseau");
    }
  };

  return (
    <div className="space-y-6">
      <button onClick={() => router.back()} className="text-sm text-muted hover:text-primary">&larr; Retour</button>

      <div className="rounded-2xl border border-border bg-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-primary">
              {user.full_name as string || user.email as string || "—"}
            </h1>
            <p className="mt-1 text-sm text-muted">@{user.username as string}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={handleRoleToggle} className="rounded-xl bg-accent/20 px-4 py-2 text-sm font-medium text-primary transition hover:bg-accent/30">
              {user.role === "admin" ? "Rétrograder en utilisateur" : "Promouvoir admin"}
            </button>
            <button onClick={handleSuspend} className={`rounded-xl px-4 py-2 text-sm font-medium transition ${user.suspended ? "bg-success/10 text-success hover:bg-success/20" : "bg-danger/10 text-danger hover:bg-danger/20"}`}>
              {user.suspended ? "Réactiver" : "Suspendre"}
            </button>
            <button onClick={handleDelete} className="rounded-xl border border-danger/30 px-4 py-2 text-sm font-medium text-danger transition hover:bg-danger/10">
              Supprimer
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { label: "Email", value: user.email },
            { label: "Rôle", value: user.role },
            { label: "Statut", value: user.suspended ? "Suspendu" : "Actif" },
            { label: "Commune", value: user.commune_defaut },
            { label: "Téléphone", value: user.whatsapp_number },
            { label: "Sexe", value: user.sexe },
            { label: "Date naissance", value: user.date_naissance },
            { label: "Complété", value: user.profile_complete ? "Oui" : "Non" },
          ].map((item) => (
            <div key={item.label}>
              <p className="text-xs text-muted">{item.label}</p>
              <p className="text-sm font-medium text-primary">{String(item.value || "—")}</p>
            </div>
          ))}
        </div>
      </div>

      <section>
        <h2 className="mb-3 text-lg font-bold text-primary">Annonces ({annonces.length})</h2>
        {annonces.length === 0 ? (
          <p className="text-sm text-muted">Aucune annonce</p>
        ) : (
          <div className="space-y-2">
            {annonces.map((a) => (
              <Link
                key={a.$id as string}
                href={`/admin/annonces`}
                className="flex items-center justify-between rounded-xl border border-border bg-white px-4 py-3 transition hover:border-primary/30"
              >
                <span className="truncate text-sm font-medium text-primary">
                  {(a as { titre?: string }).titre}
                </span>
                <span className="shrink-0 text-xs text-muted">
                  {(a as { status?: string }).status} · {(a as { prix?: number }).prix?.toLocaleString()}$
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
