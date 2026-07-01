"use client";

import Link from "next/link";
import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useMutation, useQuery } from "@apollo/client/react";
import {
  CANDIDATES_QUERY,
  CAST_VOTE_MUTATION,
  ELECTION_QUERY,
  ELECTIONS_QUERY,
  ME_QUERY,
  MY_VOTE_QUERY,
} from "@/lib/election-graphql";
import { defaultElectionId } from "@/lib/graphql-env";
import { apolloErrorMessage } from "@/lib/apollo-error";
import { isTruthyFlag } from "@/lib/election-utils";
import { landingImage } from "@/lib/landing-assets";
import type {
  CandidatesQuery,
  CastVoteMutation,
  ElectionQuery,
  ElectionsQuery,
  GqlCandidate,
  MeQuery,
  MyVoteQuery,
} from "@/types/election-apollo";
import { ElectionCountdown } from "@/components/election/ElectionCountdown";
import { ConfirmVoteModal } from "@/components/election/ConfirmVoteModal";

function inVotingWindow(e: {
  is_active: unknown;
  start_date: string;
  end_date: string;
}) {
  if (!isTruthyFlag(e.is_active)) return false;
  const now = Date.now();
  const start = new Date(e.start_date).getTime();
  const end = new Date(e.end_date).getTime();
  if (Number.isNaN(start) || Number.isNaN(end)) return false;
  return now >= start && now <= end;
}

function votingClosedHint(e: {
  is_active: unknown;
  start_date: string;
  end_date: string;
}): string {
  if (!isTruthyFlag(e.is_active)) {
    return "This election is not active yet. An organizer must turn it on in the admin tools.";
  }
  const now = Date.now();
  const start = new Date(e.start_date).getTime();
  const end = new Date(e.end_date).getTime();
  if (Number.isNaN(start) || Number.isNaN(end)) {
    return "Election dates could not be read. Check the server configuration.";
  }
  if (now < start) return "Voting has not started yet—see the countdown above.";
  if (now > end) return "The voting period has ended.";
  return "";
}

function ElectionPageInner() {
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
    const list = electionsData?.elections?.length
      ? electionsData.elections
      : (electionsAll?.elections ?? []);
    const active = list.find((x: { is_active: unknown }) =>
      isTruthyFlag(x.is_active),
    );
    return active?.id ?? list[0]?.id ?? null;
  }, [paramId, electionsData, electionsAll]);

  const { data: electionData, loading: elLoading } = useQuery<ElectionQuery>(
    ELECTION_QUERY,
    {
      variables: { id: resolvedId ?? "" },
      skip: !resolvedId,
    },
  );

  const { data: candData, loading: cLoading } =
    useQuery<CandidatesQuery>(CANDIDATES_QUERY);
  const { data: meData, loading: meLoading } = useQuery<MeQuery>(ME_QUERY, {
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
  });
  const { data: voteData, refetch: refetchMyVote } = useQuery<MyVoteQuery>(
    MY_VOTE_QUERY,
    {
      variables: { election_id: resolvedId ?? "" },
      skip: !resolvedId || !meData?.me,
    },
  );

  const [castVote, { loading: voteLoading }] =
    useMutation<CastVoteMutation>(CAST_VOTE_MUTATION);

  const [confirm, setConfirm] = useState<GqlCandidate | null>(null);
  const [banner, setBanner] = useState<{
    type: "ok" | "err";
    text: string;
  } | null>(null);

  const election = electionData?.election;
  const candidates = candData?.candidates ?? [];
  const me = meData?.me;
  const requireAdminApproval =
    process.env.NEXT_PUBLIC_KANEMA_REQUIRE_ADMIN_APPROVAL === "true";
  const canVote =
    Boolean(me?.is_verified) &&
    (!requireAdminApproval || Boolean(me?.admin_approved));
  const myVote = voteData?.myVote;
  const votingOpen = election ? inVotingWindow(election) : false;
  const closedHint = election && !votingOpen ? votingClosedHint(election) : "";

  const voteDisabledReason = meLoading
    ? "Checking your session…"
    : !me
      ? "Sign in with a verified member account to vote."
      : !me.is_verified
        ? "Your account is signed in but not verified for voting yet (complete email or phone OTP on the account you used to register)."
        : requireAdminApproval && !me.admin_approved
          ? "An administrator still needs to approve your account for this ballot."
          : null;

  async function submitVote() {
    if (!confirm || !resolvedId) {
      setBanner({
        type: "err",
        text: !resolvedId
          ? "No election is selected. Reload the page or try again in a moment."
          : "No candidate is selected. Close the dialog and choose Vote again.",
      });
      return;
    }
    setBanner(null);
    const candidateId = confirm.id;
    try {
      await castVote({
        variables: {
          input: { election_id: resolvedId, candidate_id: candidateId },
        },
      });
      setConfirm(null);
      setBanner({
        type: "ok",
        text: "Vote submitted. Thank you for participating.",
      });
      await refetchMyVote();
    } catch (e: unknown) {
      setBanner({
        type: "err",
        text: apolloErrorMessage(e, "Could not submit vote."),
      });
    }
  }

  if (!resolvedId && !elLoading) {
    return (
      <section className="hero section">
        <div className="container section-title" data-aos="fade-up">
          <h1>Canma Presidential Election 2026</h1>
          <p>
            There is no presidential ballot open on the site yet. When Canma
            starts this election, approved candidates, deadlines, and your vote
            will appear here—the same trusted space you use for community,
            showcase, and opportunities.
          </p>
          <p className="small text-muted mb-0">
            Think voting should already be live? Reach the team on the contact
            page and we will help verified members get to the ballot.
          </p>
          <div className="hero-actions justify-content-center mt-4">
            <Link href="/#contact" className="btn btn-accent">
              <i className="bi bi-envelope me-2" />
              Contact Canma
            </Link>
            <Link href="/" className="btn btn-ghost">
              <i className="bi bi-arrow-left-circle me-2" />
              Back to home
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section id="election-hero" className="hero section">
        <div className="container">
          <div className="row gy-5 align-items-center">
            <div className="col-lg-7" data-aos="fade-up" data-aos-delay="100">
              <div className="hero-heading">
                <span className="badge-label">
                  Official member ballot · Presidential election
                </span>
                <div className="d-flex flex-wrap gap-2 mt-3 mb-2">
                  <span className="featured-tag">One member, one vote</span>
                  {me?.is_verified ? (
                    <span className="featured-tag">Verified member</span>
                  ) : me ? (
                    <span className="featured-tag">Complete OTP to vote</span>
                  ) : null}
                </div>
                <h1>Canma Presidential Election 2026</h1>
                <p>
                  Ethiopia&apos;s photographers and videographers deserve
                  visibility, structured participation, and fair access to
                  leadership choices. This ballot lives inside the same Canma
                  Canma hub you use for community, showcase, and
                  opportunities—recorded transparently on the server.
                </p>
                {election?.title ? (
                  <p className="lead mb-2">{election.title}</p>
                ) : null}
                {election?.description ? (
                  <p className="small text-muted mb-0">
                    {election.description}
                  </p>
                ) : null}

                {election ? (
                  <>
                    <p className="small fw-semibold mt-4 mb-0">
                      Time until voting closes
                    </p>
                    <ElectionCountdown endIso={election.end_date} />
                  </>
                ) : null}

                {banner ? (
                  <div
                    className={`alert mt-4 mb-0 ${banner.type === "ok" ? "alert-success" : "alert-danger"}`}
                    role="status"
                  >
                    {banner.text}
                  </div>
                ) : null}

                <div className="hero-actions mt-4">
                  {!me ? (
                    <>
                      <Link href="/election/login" className="btn btn-accent">
                        <i className="bi bi-box-arrow-in-right me-2" />
                        Member login
                      </Link>
                      <Link href="/election/register" className="btn btn-ghost">
                        <i className="bi bi-person-plus me-2" />
                        Register
                      </Link>
                    </>
                  ) : null}
                  <Link href="/election/results" className="btn btn-ghost">
                    <i className="bi bi-bar-chart-line me-2" />
                    Live results
                  </Link>
                  <Link href="/" className="btn btn-ghost">
                    <i className="bi bi-house me-2" />
                    Home
                  </Link>
                </div>
              </div>
            </div>
            <div className="col-lg-5" data-aos="fade-left" data-aos-delay="200">
              <div className="showcase-image">
                <img
                  src={landingImage("illustration/illustration-15.webp")}
                  alt=""
                  className="img-fluid"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="why-us section">
        <div className="container" data-aos="fade-up">
          <div className="row justify-content-center">
            <div className="col-lg-10">
              <div className="intro-content text-center text-lg-start">
                <h3>A centralized, trustworthy vote</h3>
                <p className="lead">
                  Many talented creatives already trust Canma for portfolios and
                  gigs. Voting uses the same discipline: verified membership,
                  clear deadlines, and tallies you can follow live—no shadow
                  spreadsheets.
                </p>
                <div className="checklist">
                  <div className="check-item">
                    <i className="bi bi-arrow-right-circle-fill" />
                    <div>
                      <h5>Verified members</h5>
                      <p>
                        Complete email or phone OTP on the{" "}
                        <Link href="/election/verify">verification page</Link>{" "}
                        so we know you are a real member of the community—not a
                        throwaway account.
                      </p>
                    </div>
                  </div>
                  <div className="check-item">
                    <i className="bi bi-arrow-right-circle-fill" />
                    <div>
                      <h5>One vote, locked in</h5>
                      <p>
                        The database enforces one vote per person per election.
                        You confirm on screen; the server makes it final.
                      </p>
                    </div>
                  </div>
                  <div className="check-item">
                    <i className="bi bi-arrow-right-circle-fill" />
                    <div>
                      <h5>Live, open results</h5>
                      <p>
                        Follow counts as they move—aligned with how Canma
                        surfaces opportunities and events in the open.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {myVote ? (
        <section className="section py-0">
          <div className="container">
            <div className="alert alert-info" role="status">
              You have already cast your vote in this election for{" "}
              <strong>{myVote.candidate?.user?.full_name}</strong>. Like
              membership commitments elsewhere on the hub, this choice cannot be
              changed after submission.
            </div>
          </div>
        </section>
      ) : null}

      <section
        id="candidates"
        className="services section"
        aria-labelledby="candidatesHeading"
      >
        <div className="container section-title" data-aos="fade-up">
          <h2 id="candidatesHeading">Candidates on the ballot</h2>
          <p>
            Explore each profile the way you explore talent on the platform—read
            the manifesto, then return here to cast your vote when voting is
            open.
          </p>
          {elLoading || cLoading ? (
            <p className="small text-muted mb-0">Loading candidates…</p>
          ) : null}
          {election && !votingOpen && closedHint ? (
            <div
              className="alert alert-warning mt-3 mb-0 text-start"
              role="status"
            >
              {closedHint}
            </div>
          ) : null}
          {votingOpen &&
          candidates.some((c) => c.approved) &&
          voteDisabledReason &&
          !myVote ? (
            <div
              className="alert alert-info mt-3 mb-0 text-start"
              role="status"
            >
              <strong>Why Vote looks inactive:</strong> {voteDisabledReason}{" "}
              {!me ? (
                <>
                  <Link href="/election/login" className="alert-link">
                    Go to member login
                  </Link>
                  {" · "}
                  <Link href="/election/register" className="alert-link">
                    Register with phone
                  </Link>
                </>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="container" data-aos="fade-up" data-aos-delay="100">
          <div className="row gy-4">
            {candidates.map((c) => (
              <div className="col-lg-6" key={c.id}>
                <div className="offering-block">
                  <div className="offering-indicator" />
                  <div className="offering-icon-wrap">
                    {c.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={c.image_url}
                        alt=""
                        className="election-cand-thumb"
                      />
                    ) : (
                      <i className="bi bi-person-badge" />
                    )}
                  </div>
                  <div className="offering-body">
                    <div className="offering-header">
                      <h4>{c.user.full_name}</h4>
                      {c.approved ? (
                        <span className="featured-tag">Approved candidate</span>
                      ) : (
                        <span className="featured-tag">Pending review</span>
                      )}
                    </div>
                    <p>
                      {c.bio
                        ? `${c.bio.slice(0, 220)}${c.bio.length > 220 ? "…" : ""}`
                        : "Profile summary coming soon."}
                    </p>
                    <Link
                      href={`/election/candidates/${c.id}`}
                      className="explore-btn d-inline-flex"
                    >
                      View profile & manifesto{" "}
                      <i className="bi bi-chevron-right" />
                    </Link>
                    {!myVote && votingOpen && c.approved ? (
                      <div className="mt-3">
                        <button
                          type="button"
                          className="btn btn-accent btn-sm"
                          disabled={voteLoading || meLoading || !me || !canVote}
                          title={voteDisabledReason ?? undefined}
                          onClick={() => setConfirm(c)}
                        >
                          <i className="bi bi-check2-square me-2" />
                          Vote
                        </button>
                      </div>
                    ) : null}
                    {!votingOpen && !myVote ? (
                      <p className="small text-muted mt-3 mb-0">
                        Voting is not open for this period.
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ConfirmVoteModal
        open={Boolean(confirm)}
        candidateName={confirm?.user.full_name ?? ""}
        loading={voteLoading}
        onCancel={() => setConfirm(null)}
        onConfirm={() => void submitVote()}
      />
    </>
  );
}

export default function ElectionPage() {
  return (
    <Suspense
      fallback={
        <section className="hero section">
          <div className="container">
            <p className="text-muted small" aria-live="polite">
              Loading election…
            </p>
          </div>
        </section>
      }
    >
      <ElectionPageInner />
    </Suspense>
  );
}
