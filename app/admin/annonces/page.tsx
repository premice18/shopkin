"use client";

import { useState, useEffect, useCallback } from "react";
import { getAdminJWT } from "@/lib/admin";
import { useToast } from "@/lib/contexts/ToastContext";
import DataTable from "@/components/admin/DataTable";
import type { Column } from "@/components/admin/DataTable";

interface AnnonceRow {
  $id: string;
  titre?: string;
  categorie?: string;
  prix?: number;
  devise?: string;
  commune?: string;
  super_repere?: string;
  status?: string;
  views_count?: number;
  vendeur_id?: string;
  $createdAt?: string;
}

export default function AdminAnnoncesPage() {
  const [annonces, setAnnonces] = useState<AnnonceRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categorieFilter, setCategorieFilter] = useState("");
  const { success, error: toastError } = useToast();

  const fetchAnnonces = useCallback(async () => {
    setLoading(true);
    try {
      const jwt = await getAdminJWT();
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);
      if (categorieFilter) params.set("categorie", categorieFilter);
      const res = await fetch(`/api/admin/annonces?${params}`, {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      const data = await res.json();
      setAnnonces(data.annonces || []);
      setTotal(data.total || 0);
    } catch {
      toastError("Erreur de chargement");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, categorieFilter, toastError]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAnnonces();
  }, [fetchAnnonces]);

  const handleDelete = async (annonceId: string) => {
    if (!window.confirm("Supprimer cette annonce ?")) return;
    try {
      const jwt = await getAdminJWT();
      const res = await fetch(`/api/admin/annonces/${annonceId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${jwt}` },
      });
      if (res.ok) {
        success("Annonce supprimée");
        fetchAnnonces();
      } else {
        toastError("Erreur lors de la suppression");
      }
    } catch {
      toastError("Erreur réseau");
    }
  };

  const columns: Column<AnnonceRow>[] = [
    { key: "titre", header: "Titre", render: (a) => (
      <span className="max-w-[200px] truncate block font-medium text-primary">{a.titre || "—"}</span>
    )},
    { key: "categorie", header: "Catégorie" },
    { key: "prix", header: "Prix", render: (a) => `${(a.prix ?? 0).toLocaleString()} ${a.devise || "$"}` },
    { key: "commune", header: "Commune" },
    {
      key: "status",
      header: "Statut",
      render: (a) => {
        const colors: Record<string, string> = {
          disponible: "bg-success/10 text-success",
          "réservé": "bg-accent/20 text-primary",
          vendu: "bg-danger/10 text-danger",
        };
        return (
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${colors[a.status || ""] || "bg-surface text-muted"}`}>
            {a.status}
          </span>
        );
      },
    },
    { key: "views_count", header: "Vues" },
    {
      key: "actions",
      header: "",
      render: (a) => (
        <button
          onClick={() => handleDelete(a.$id)}
          className="rounded-lg px-2.5 py-1 text-xs font-medium text-danger/60 transition hover:bg-danger/10 hover:text-danger"
        >
          Supprimer
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Annonces</h1>
        <p className="mt-1 text-sm text-muted">{total} annonce(s)</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher par titre..."
          className="min-w-0 flex-1 rounded-xl border border-border px-4 py-2.5 text-sm outline-none focus:border-primary"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-border px-4 py-2.5 text-sm"
        >
          <option value="">Tous les statuts</option>
          <option value="disponible">Disponible</option>
          <option value="réservé">Réservé</option>
          <option value="vendu">Vendu</option>
        </select>
        <select
          value={categorieFilter}
          onChange={(e) => setCategorieFilter(e.target.value)}
          className="rounded-xl border border-border px-4 py-2.5 text-sm"
        >
          <option value="">Toutes catégories</option>
          <option value="Téléphones">Téléphones</option>
          <option value="Électroménager">Électroménager</option>
          <option value="Mode">Mode</option>
          <option value="Véhicules">Véhicules</option>
          <option value="Maison">Maison</option>
          <option value="Enfants">Enfants</option>
          <option value="Autres">Autres</option>
        </select>
      </div>

      <DataTable
        columns={columns}
        data={annonces}
        keyExtractor={(a) => a.$id}
        loading={loading}
        emptyMessage="Aucune annonce trouvée"
      />
    </div>
  );
}
