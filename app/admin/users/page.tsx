"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getAdminJWT } from "@/lib/admin";
import { useToast } from "@/lib/contexts/ToastContext";
import DataTable from "@/components/admin/DataTable";
import type { Column } from "@/components/admin/DataTable";

interface UserRow {
  $id: string;
  full_name?: string;
  email?: string;
  username?: string;
  role?: string;
  suspended?: boolean;
  commune_defaut?: string;
  $createdAt?: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const router = useRouter();
  const { success, error: toastError } = useToast();

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const jwt = await getAdminJWT();
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (roleFilter) params.set("role", roleFilter);
      const res = await fetch(`/api/admin/users?${params}`, {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      const data = await res.json();
      setUsers(data.users || []);
      setTotal(data.total || 0);
    } catch {
      toastError("Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter, toastError]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchUsers();
  }, [fetchUsers]);

  const handleSuspend = async (userId: string, suspended: boolean) => {
    try {
      const jwt = await getAdminJWT();
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${jwt}`, "Content-Type": "application/json" },
        body: JSON.stringify({ suspended }),
      });
      if (res.ok) {
        success(suspended ? "Utilisateur suspendu" : "Utilisateur réactivé");
        fetchUsers();
      } else {
        toastError("Erreur lors de la modification");
      }
    } catch {
      toastError("Erreur réseau");
    }
  };

  const handleRoleToggle = async (userId: string, newRole: string) => {
    try {
      const jwt = await getAdminJWT();
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${jwt}`, "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        success(`Rôle changé en ${newRole}`);
        fetchUsers();
      } else {
        toastError("Erreur lors du changement de rôle");
      }
    } catch {
      toastError("Erreur réseau");
    }
  };

  const handleDelete = async (userId: string) => {
    if (!window.confirm("Supprimer cet utilisateur et toutes ses annonces ?")) return;
    try {
      const jwt = await getAdminJWT();
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${jwt}` },
      });
      if (res.ok) {
        success("Utilisateur supprimé");
        fetchUsers();
      } else {
        toastError("Erreur lors de la suppression");
      }
    } catch {
      toastError("Erreur réseau");
    }
  };

  const columns: Column<UserRow>[] = [
    { key: "full_name", header: "Nom", render: (u) => u.full_name || u.email || "—" },
    { key: "email", header: "Email", render: (u) => <span className="text-xs">{u.email}</span> },
    { key: "username", header: "Username" },
    { key: "commune_defaut", header: "Commune" },
    {
      key: "role",
      header: "Rôle",
      render: (u) => (
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${u.role === "admin" ? "bg-accent/20 text-primary" : "bg-surface text-muted"}`}>
          {u.role}
        </span>
      ),
    },
    {
      key: "suspended",
      header: "Statut",
      render: (u) =>
        u.suspended ? (
          <span className="text-xs font-medium text-danger">Suspendu</span>
        ) : (
          <span className="text-xs font-medium text-success">Actif</span>
        ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (u) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push(`/admin/users/${u.$id}`)}
            className="rounded-lg bg-surface px-2.5 py-1 text-xs font-medium text-primary transition hover:bg-primary/10"
          >
            Détail
          </button>
          <button
            onClick={() => handleRoleToggle(u.$id, u.role === "admin" ? "user" : "admin")}
            className="rounded-lg bg-surface px-2.5 py-1 text-xs font-medium text-accent transition hover:bg-accent/10"
          >
            {u.role === "admin" ? "Rétrograder" : "Promouvoir"}
          </button>
          <button
            onClick={() => handleSuspend(u.$id, !u.suspended)}
            className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
              u.suspended
                ? "bg-success/10 text-success hover:bg-success/20"
                : "bg-danger/10 text-danger hover:bg-danger/20"
            }`}
          >
            {u.suspended ? "Réactiver" : "Suspendre"}
          </button>
          <button
            onClick={() => handleDelete(u.$id)}
            className="rounded-lg px-2.5 py-1 text-xs font-medium text-danger/60 transition hover:bg-danger/10 hover:text-danger"
          >
            Suppr.
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Utilisateurs</h1>
        <p className="mt-1 text-sm text-muted">{total} utilisateur(s)</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un utilisateur..."
          className="min-w-0 flex-1 rounded-xl border border-border px-4 py-2.5 text-sm outline-none focus:border-primary"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="rounded-xl border border-border px-4 py-2.5 text-sm"
        >
          <option value="">Tous les rôles</option>
          <option value="user">Utilisateurs</option>
          <option value="admin">Admins</option>
        </select>
      </div>

      <DataTable
        columns={columns}
        data={users}
        keyExtractor={(u) => u.$id}
        loading={loading}
        emptyMessage="Aucun utilisateur trouvé"
      />
    </div>
  );
}
