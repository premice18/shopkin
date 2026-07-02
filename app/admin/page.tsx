"use client";

import { useState, useEffect } from "react";
import { getAdminJWT } from "@/lib/admin";
import StatCard from "@/components/admin/StatCard";
import Link from "next/link";

interface Stats {
  totalUsers: number;
  activeAnnonces: number;
  soldAnnonces: number;
  volumeTotal: number;
}

export default function AdminDashboard() {
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
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          }
        />
        <StatCard
          label="Annonces actives"
          value={stats?.activeAnnonces ?? 0}
          color="accent"
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          }
        />
        <StatCard
          label="Annonces vendues"
          value={stats?.soldAnnonces ?? 0}
          color="success"
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          }
        />
        <StatCard
          label="Volume estimé"
          value={`${(stats?.volumeTotal ?? 0).toLocaleString()} $`}
          color="danger"
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          }
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent annonces */}
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

        {/* Recent users */}
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
