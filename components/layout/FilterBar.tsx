"use client";

import { categories, communes, superReperes } from "@/lib/constants";

interface FilterBarProps {
  categorie: string;
  commune: string;
  superRepere: string;
  onCategorieChange: (v: string) => void;
  onCommuneChange: (v: string) => void;
  onSuperRepereChange: (v: string) => void;
}

export default function FilterBar({
  categorie,
  commune,
  superRepere,
  onCategorieChange,
  onCommuneChange,
  onSuperRepereChange,
}: FilterBarProps) {
  return (
    <section className="border-b border-border bg-white">
      <div className="mx-auto max-w-7xl px-4 py-3">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => onCategorieChange("")}
            className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
              categorie === ""
                ? "border-accent bg-accent text-primary"
                : "border-border bg-white text-muted hover:border-accent hover:text-primary"
            }`}
          >
            Toutes
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => onCategorieChange(cat)}
              className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
                categorie === cat
                  ? "border-accent bg-accent text-primary"
                  : "border-border bg-white text-muted hover:border-accent hover:text-primary"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="mt-3 flex gap-2">
          <select
            value={commune}
            onChange={(e) => onCommuneChange(e.target.value)}
            className="flex-1 appearance-none rounded-xl border border-border bg-white px-4 py-2.5 text-sm text-muted transition-colors"
          >
            <option value="">Commune</option>
            {communes.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select
            value={superRepere}
            onChange={(e) => onSuperRepereChange(e.target.value)}
            className="flex-1 appearance-none rounded-xl border border-border bg-white px-4 py-2.5 text-sm text-muted transition-colors"
          >
            <option value="">Super-repère</option>
            {superReperes.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
      </div>
    </section>
  );
}
