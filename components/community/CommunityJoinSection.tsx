"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { CommunityMemberSignIn } from "./CommunityMemberSignIn";
import { JoinCommunityForm } from "./JoinCommunityForm";

function CommunityJoinSectionInner() {
  const searchParams = useSearchParams();
  const nextRaw = searchParams.get("next");
  const nextUrl =
    nextRaw && nextRaw.startsWith("/") && !nextRaw.startsWith("//")
      ? nextRaw
      : undefined;

  return (
    <>
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
    </>
  );
}

export function CommunityJoinSection() {
  return (
    <Suspense fallback={null}>
      <CommunityJoinSectionInner />
    </Suspense>
  );
}
