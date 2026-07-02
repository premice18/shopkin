import type { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  color?: "primary" | "accent" | "success" | "danger";
}

const colorMap: Record<string, string> = {
  primary: "bg-primary/10 text-primary",
  accent: "bg-accent/20 text-primary",
  success: "bg-success/10 text-success",
  danger: "bg-danger/10 text-danger",
};

export default function StatCard({ label, value, icon, color = "primary" }: StatCardProps) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-border bg-white p-5 shadow-sm">
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${colorMap[color]}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-sm text-muted">{label}</p>
        <p className="truncate text-2xl font-bold text-primary">{value}</p>
      </div>
    </div>
  );
}
