"use client";

import Link from "next/link";
import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery, useSubscription } from "@apollo/client/react";
import {
  ELECTION_RESULTS_QUERY,
  ELECTION_RESULTS_SUB,
  ELECTIONS_QUERY,
} from "@/lib/election-graphql";
import { defaultElectionId } from "@/lib/graphql-env";
import { isTruthyFlag } from "@/lib/election-utils";
import type {
  ElectionResultsQuery,
  ElectionResultsSub,
  ElectionsQuery,
} from "@/types/election-apollo";
import { ResultsBars } from "@/components/election/ResultsBars";

function ResultsInner() {
  const searchParams = useSearchParams();
  const paramId = searchParams.get("id")?.trim();

  const { data: electionsData } = useQuery<ElectionsQuery>(ELECTIONS_QUERY, {
    variables: { activeOnly: true },
  });
  const { data: electionsAll } = useQuery<ElectionsQuery>(ELECTIONS_QUERY, {
    variables: { activeOnly: false },
    skip: Boolean(electionsData?.elections?.length),
  });

  const resolvedId = useMemo(() => {
    const envId = defaultElectionId();
    if (envId) return envId;
    if (paramId) return paramId;
    const list =
      electionsData?.elections?.length ?
        electionsData.elections
      : electionsAll?.elections ?? [];
    const active = list.find((x: { is_active: unknown }) =>
      isTruthyFlag(x.is_active)
    );
    return active?.id ?? list[0]?.id ?? null;
  }, [paramId, electionsData, electionsAll]);

  const { data: initial } = useQuery<ElectionResultsQuery>(
    ELECTION_RESULTS_QUERY,
    {
      variables: { election_id: resolvedId ?? "" },
      skip: !resolvedId,
      pollInterval: 30_000,
    }
  );

  const { data: live } = useSubscription<ElectionResultsSub>(
    ELECTION_RESULTS_SUB,
    {
      variables: { election_id: resolvedId ?? "" },
      skip: !resolvedId,
    }
  );

  const results = live?.electionResultsUpdated ?? initial?.electionResults;

  if (!resolvedId) {
    return (
      <section className="hero section">
        <div className="container section-title" data-aos="fade-up">
          <h1>Live results</h1>
          <p>
            There is no election to show totals for yet. Once an election is live,
            counts update here in real time for everyone following the ballot.
          </p>
          <p className="small text-muted mb-0">
            If you opened a shared results link, check that the address is
            complete. Otherwise, ask your organizer or contact Kanema.
          </p>
          <div className="hero-actions justify-content-center mt-4">
            <Link href="/election" className="btn btn-accent">
              Back to ballot
            </Link>
            <Link href="/#contact" className="btn btn-ghost">
              Contact
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="services section">
      <div className="container section-title" data-aos="fade-up">
        <h1>Live results</h1>
        <p>
          Fair view of totals for the presidential ballot—updated in real time for
          the community, alongside the transparency you expect from Kanema.
        </p>
        {results?.updatedAt ?
          <p className="small text-muted mb-0">
            Last update: {new Date(results.updatedAt).toLocaleString()}
          </p>
        : (
          <p className="small text-muted mb-0">
            Waiting for the first vote or tally…
          </p>
        )}
      </div>

      <div className="container" data-aos="fade-up" data-aos-delay="100">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            <div className="offering-block">
              <div className="offering-indicator" />
              <div className="offering-icon-wrap">
                <i className="bi bi-bar-chart-steps" />
              </div>
              <div className="offering-body">
                <div className="offering-header">
                  <h4>Vote share by candidate</h4>
                  <span className="featured-tag">Live GraphQL</span>
                </div>
                <p className="small text-muted">
                  Percentages reflect all cast votes for this election. Totals refresh
                  when members submit ballots.
                </p>
                <ResultsBars
                  tallies={results?.tallies ?? []}
                  totalVotes={results?.total_votes ?? 0}
                />
                <Link href="/election" className="explore-btn mt-4 d-inline-flex">
                  Return to ballot <i className="bi bi-chevron-right" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function ElectionResultsPage() {
  return (
    <Suspense
      fallback={
        <section className="hero section">
          <div className="container">
            <p className="text-muted small">Loading results…</p>
          </div>
        </section>
      }
    >
      <ResultsInner />
    </Suspense>
  );
}
