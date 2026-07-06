"use client";

import { useState, useEffect } from "react";
import { Users, Package, CheckCircle, DollarSign } from "lucide-react";
import { getAdminJWT } from "@/lib/admin";
import StatCard from "@/components/admin/StatCard";
import Link from "next/link";

interface Stats {
  totalUsers: number;
  activeAnnonces: number;
  soldAnnonces: number;
  volumeTotal: number;
}

function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentAnnonces, setRecentAnnonces] = useState<Record<string, unknown>[]>([]);
  const [recentUsers, setRecentUsers] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getAdminJWT()
      .then((jwt) =>
        fetch("/api/admin/stats", {
          headers: { Authorization: `Bearer ${jwt}` },
        })
      )
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) {
          setStats(data.stats);
          setRecentAnnonces(data.recentAnnonces || []);
          setRecentUsers(data.recentUsers || []);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-primary">Tableau de bord</h1>
        <p className="mt-1 text-sm text-muted">Vue d&apos;ensemble de la plateforme</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Utilisateurs"
          value={stats?.totalUsers ?? 0}
          color="primary"
          icon={<Users className="h-5 w-5" aria-hidden="true" />}
        />
        <StatCard
          label="Annonces actives"
          value={stats?.activeAnnonces ?? 0}
          color="accent"
          icon={<Package className="h-5 w-5" aria-hidden="true" />}
        />
        <StatCard
          label="Annonces vendues"
          value={stats?.soldAnnonces ?? 0}
          color="success"
          icon={<CheckCircle className="h-5 w-5" aria-hidden="true" />}
        />
        <StatCard
          label="Volume estimé"
          value={`${(stats?.volumeTotal ?? 0).toLocaleString()} $`}
          color="danger"
          icon={<DollarSign className="h-5 w-5" aria-hidden="true" />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-border bg-white p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold text-primary">Dernières annonces</h2>
            <Link href="/admin/annonces" className="text-sm text-accent hover:underline">
              Voir tout
            </Link>
          </div>
          {recentAnnonces.length === 0 ? (
            <p className="text-sm text-muted">Aucune annonce</p>
          ) : (
            <div className="space-y-2">
              {recentAnnonces.map((a) => (
                <div key={a.$id as string} className="flex items-center justify-between rounded-lg bg-surface px-3 py-2">
                  <span className="truncate text-sm font-medium text-primary">
                    {(a as { titre?: string }).titre || "Sans titre"}
                  </span>
                  <span className="shrink-0 text-xs text-muted">
                    {(a as { status?: string }).status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-border bg-white p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold text-primary">Derniers inscrits</h2>
            <Link href="/admin/users" className="text-sm text-accent hover:underline">
              Voir tout
            </Link>
          </div>
          {recentUsers.length === 0 ? (
            <p className="text-sm text-muted">Aucun utilisateur</p>
          ) : (
            <div className="space-y-2">
              {recentUsers.map((u) => (
                <div key={u.$id as string} className="flex items-center justify-between rounded-lg bg-surface px-3 py-2">
                  <span className="truncate text-sm font-medium text-primary">
                    {(u as { full_name?: string; email?: string }).full_name || (u as { email?: string }).email || "—"}
                  </span>
                  <span className="shrink-0 text-xs text-muted">
                    {(u as { role?: string }).role}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default function AdminPage() {
  return <AdminDashboard />;
}