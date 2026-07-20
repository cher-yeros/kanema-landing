"use client";

import Link from "next/link";
import { useQuery } from "@apollo/client/react";
import { ME_QUERY } from "@/lib/election-graphql";
import type { MeQuery } from "@/types/election-apollo";

export function JobsMemberStrip() {
  const { data, loading } = useQuery<MeQuery>(ME_QUERY);
  const me = data?.me;

  if (loading) {
    return (
      <section
        className="section py-4"
        style={{ background: "rgba(0,0,0,.02)" }}
      >
        <div className="container">
          <p className="small text-muted mb-0 text-center">
            Checking your session…
          </p>
        </div>
      </section>
    );
  }

  if (!me) {
    return (
      <section
        className="section py-4"
        style={{ background: "rgba(0,0,0,.02)" }}
      >
        <div className="container d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
          <div>
            <strong>Member access</strong>
            <span className="text-muted ms-2">
              Sign in with your Canma account to apply or post roles.
            </span>
          </div>
          <div className="d-flex flex-wrap gap-2">
            <Link
              className="btn btn-sm btn-accent"
              href={`/community/join?mode=signin&next=${encodeURIComponent("/jobs")}`}
            >
              Sign in
            </Link>
            <Link className="btn btn-sm btn-ghost" href="/community/join">
              Join community
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section py-4" style={{ background: "rgba(0,0,0,.02)" }}>
      <div className="container d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
        <div>
          <strong>Signed in as {me.full_name}</strong>
          <span className="text-muted ms-2">
            {me.role === "admin" ? (
              <>
                Admin workspace—post roles from your personal member account
                views below.
              </>
            ) : (
              <>Browse open roles above or jump to your dashboard.</>
            )}
          </span>
        </div>
        <div className="d-flex flex-wrap gap-2">
          <Link className="btn btn-sm btn-accent" href="/jobs/mine">
            My postings & applications
          </Link>
          <Link className="btn btn-sm btn-ghost" href="/jobs/new">
            Post a role
          </Link>
        </div>
      </div>
    </section>
  );
}
