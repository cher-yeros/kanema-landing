"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { selectIsAuthenticated } from "@/lib/store/auth-selectors";
import { useAppSelector } from "@/lib/store/hooks";

import { CommunityMemberSignIn } from "./CommunityMemberSignIn";
import { JoinCommunityForm } from "./JoinCommunityForm";

function CommunityJoinSectionInner() {
  const searchParams = useSearchParams();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const nextRaw = searchParams.get("next");
  const nextUrl =
    nextRaw && nextRaw.startsWith("/") && !nextRaw.startsWith("//")
      ? nextRaw
      : undefined;

  if (isAuthenticated) {
    return null;
  }

  return (
    <section id="join" className="contact section">
      <div className="container section-title" data-aos="fade-up">
        <h2>Join the community</h2>
        <p>
          Become part of Canma&apos;s network—connect with creators, find
          opportunities, and collaborate on productions.
        </p>
      </div>

      {nextUrl ? (
        <p className="small text-muted text-center mb-4">
          After joining or signing in, you&apos;ll return to continue where you
          left off.
        </p>
      ) : null}
      <div className="row g-4 justify-content-center mb-4">
        <div className="col-lg-5">
          <div className="form-panel h-100">
            <CommunityMemberSignIn nextUrl={nextUrl} />
          </div>
        </div>
      </div>
      <JoinCommunityForm nextUrl={nextUrl} />
    </section>
  );
}

export function CommunityJoinSection() {
  return (
    <Suspense fallback={null}>
      <CommunityJoinSectionInner />
    </Suspense>
  );
}
