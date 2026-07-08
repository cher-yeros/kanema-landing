"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@apollo/client/react";
import { useEffect, useState } from "react";

import { MarketplacePageShell } from "@/components/marketplace/MarketplacePageShell";
import { ME_QUERY } from "@/lib/election-graphql";
import type { MeQuery } from "@/types/election-apollo";
import {
  MY_MARKETPLACE_STORE_QUERY,
  UPSERT_MARKETPLACE_STORE_MUTATION,
} from "@/lib/marketplace-graphql";

export default function NewStorePage() {
  const router = useRouter();
  const { data: meData, loading: meLoading } = useQuery<MeQuery>(ME_QUERY);
  const me = meData?.me;

  const { data: storeData } = useQuery<{
    myMarketplaceStore: {
      name: string;
      description: string | null;
      about_md: string | null;
      policies_md: string | null;
      slug: string;
    } | null;
  }>(MY_MARKETPLACE_STORE_QUERY, { skip: !me });

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [about, setAbout] = useState("");
  const [policies, setPolicies] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [upsertStore, { loading }] = useMutation(
    UPSERT_MARKETPLACE_STORE_MUTATION,
  );

  useEffect(() => {
    if (!meLoading && !me) {
      router.replace(
        `/election/login?next=${encodeURIComponent("/marketplace/stores/new")}`,
      );
    }
  }, [me, meLoading, router]);

  useEffect(() => {
    const s = storeData?.myMarketplaceStore;
    if (s) {
      setName(s.name);
      setDescription(s.description ?? "");
      setAbout(s.about_md ?? "");
      setPolicies(s.policies_md ?? "");
    }
  }, [storeData]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const res = await upsertStore({
        variables: {
          input: {
            name: name.trim(),
            description: description.trim() || null,
            about_md: about.trim() || null,
            policies_md: policies.trim() || null,
          },
        },
      });
      const slug = (res.data as { upsertMarketplaceStore: { slug: string } })
        ?.upsertMarketplaceStore?.slug;
      if (slug) router.push(`/marketplace/stores/${slug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save store");
    }
  }

  if (meLoading) {
    return (
      <MarketplacePageShell title="Storefront">
        <p className="py-3">Loading…</p>
      </MarketplacePageShell>
    );
  }
  if (!me) return null;

  const storeTitle = storeData?.myMarketplaceStore
    ? "Edit store"
    : "Create storefront";

  return (
    <MarketplacePageShell
      title={storeTitle}
      description="Set up your seller profile and policies for the marketplace."
      narrow
    >
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="form-panel">
        <form onSubmit={onSubmit} className="php-email-form">
          <div className="mb-3">
            <label className="form-label">Store name</label>
            <input
              className="form-control"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Short description</label>
            <textarea
              className="form-control"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">About</label>
            <textarea
              className="form-control"
              rows={4}
              value={about}
              onChange={(e) => setAbout(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Policies</label>
            <textarea
              className="form-control"
              rows={3}
              value={policies}
              onChange={(e) => setPolicies(e.target.value)}
            />
          </div>
          <div className="d-flex gap-2">
            <button type="submit" className="btn btn-accent" disabled={loading}>
              {loading ? "Saving…" : "Save store"}
            </button>
            <Link href="/marketplace/mine" className="btn btn-ghost">
              Back
            </Link>
          </div>
        </form>
      </div>
    </MarketplacePageShell>
  );
}
