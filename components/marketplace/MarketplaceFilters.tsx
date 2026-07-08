"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import type { PublicMarketplaceCategory } from "@/lib/marketplace-public";

type Props = {
  categories: PublicMarketplaceCategory[];
  basePath: string;
  initialSearch?: string;
  initialCategory?: string;
  initialSort?: string;
};

export function MarketplaceFilters({
  categories,
  basePath,
  initialSearch,
  initialCategory,
  initialSort,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(initialSearch ?? "");

  const apply = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([k, v]) => {
        if (v) params.set(k, v);
        else params.delete(k);
      });
      router.push(`${basePath}?${params.toString()}`);
    },
    [basePath, router, searchParams],
  );

  return (
    <form
      className="row g-3 align-items-end php-email-form"
      onSubmit={(e) => {
        e.preventDefault();
        apply({ q: q.trim() || undefined });
      }}
    >
      <div className="col-md-4">
        <label className="form-label small">Search</label>
        <input
          type="search"
          className="form-control"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Title, brand…"
        />
      </div>
      <div className="col-md-3">
        <label className="form-label small">Category</label>
        <select
          className="form-select"
          defaultValue={initialCategory ?? ""}
          onChange={(e) => apply({ category: e.target.value || undefined })}
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.icon ? `${c.icon} ` : ""}
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <div className="col-md-3">
        <label className="form-label small">Sort</label>
        <select
          className="form-select"
          defaultValue={initialSort ?? "newest"}
          onChange={(e) => apply({ sort: e.target.value })}
        >
          <option value="newest">Newest</option>
          <option value="popular">Popular</option>
          <option value="price_asc">Price: low to high</option>
          <option value="price_desc">Price: high to low</option>
        </select>
      </div>
      <div className="col-md-2">
        <button type="submit" className="btn btn-accent w-100">
          Filter
        </button>
      </div>
    </form>
  );
}
