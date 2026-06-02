"use client";

import { useRouter } from "next/navigation";
import type { Category } from "@/types";

type Props = {
  categories: Category[];
  selectedIds: string[];
  q?: string;
};

export default function CatalogFilters({ categories, selectedIds, q }: Props) {
  const router = useRouter();

  function buildUrl(newSelectedIds: string[]) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (newSelectedIds.length > 0) params.set("categories", newSelectedIds.join(","));
    const query = params.toString();
    return `/catalog${query ? `?${query}` : ""}`;
  }

  function toggleCategory(id: string) {
    const next = selectedIds.includes(id)
      ? selectedIds.filter((c) => c !== id)
      : [...selectedIds, id];
    router.push(buildUrl(next));
  }

  function clearAll() {
    router.push(buildUrl([]));
  }

  return (
    <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-1">
      <button
        onClick={clearAll}
        className={`flex-shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${
          selectedIds.length === 0
            ? "border-brand-600 bg-brand-600 text-white"
            : "border-slate-200 bg-white text-slate-600 hover:border-brand-300"
        }`}
      >
        Todas
      </button>
      {categories.map((cat) => {
        const active = selectedIds.includes(cat.id);
        return (
          <button
            key={cat.id}
            onClick={() => toggleCategory(cat.id)}
            className={`flex-shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${
              active
                ? "border-transparent text-white"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
            }`}
            style={active ? { backgroundColor: cat.color, borderColor: cat.color } : undefined}
          >
            {cat.name}
          </button>
        );
      })}
    </div>
  );
}
