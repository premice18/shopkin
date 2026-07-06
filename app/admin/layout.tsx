"use client";

import { useState, type ReactNode } from "react";
import { Menu } from "lucide-react";
import AdminGuard from "@/components/admin/AdminGuard";
import Sidebar from "@/components/admin/Sidebar";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <AdminGuard>
      <div className="flex min-h-screen bg-surface">
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={() => setSidebarOpen(false)}
            role="presentation"
          />
        )}

        {/* Sidebar */}
        <div
          className={`fixed inset-y-0 left-0 z-50 w-60 -translate-x-full transition-transform md:relative md:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : ""
          }`}
        >
          <Sidebar onClose={() => setSidebarOpen(false)} />
        </div>

        {/* Main */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Mobile header */}
          <header className="flex items-center gap-3 border-b border-border bg-white px-4 py-3 md:hidden">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-muted hover:text-primary"
              aria-label="Menu"
            >
              <Menu className="h-6 w-6" aria-hidden="true" />
            </button>
            <span className="font-bold text-primary">Administration</span>
          </header>

          <main className="flex-1 p-4 md:p-8">
            {children}
          </main>
        </div>
      </div>
    </AdminGuard>
  );
}
