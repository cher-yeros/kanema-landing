"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { selectIsAuthenticated } from "@/lib/store/auth-selectors";
import { useAppSelector } from "@/lib/store/hooks";

import { CommunityMemberSignIn } from "./CommunityMemberSignIn";
import { JoinCommunityForm } from "./JoinCommunityForm";

type JoinMode = "signin" | "join";

function parseJoinMode(value: string | null): JoinMode {
  return value === "signin" ? "signin" : "join";
}

function CommunityJoinSectionInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const nextRaw = searchParams.get("next");
  const nextUrl =
    nextRaw && nextRaw.startsWith("/") && !nextRaw.startsWith("//")
      ? nextRaw
      : undefined;
  const [mode, setMode] = useState<JoinMode>(() =>
    parseJoinMode(searchParams.get("mode")),
  );

  useEffect(() => {
    setMode(parseJoinMode(searchParams.get("mode")));
  }, [searchParams]);

  useEffect(() => {
    if (!isAuthenticated) return;
    router.replace(nextUrl ?? "/community");
  }, [isAuthenticated, nextUrl, router]);

  if (isAuthenticated) {
    return null;
  }

  const isSignIn = mode === "signin";

  return (
    <section id="join" className="contact section">
      <div className="container section-title" data-aos="fade-up">
        <h2>{isSignIn ? "Sign in" : "Join the community"}</h2>
        <p>
          {isSignIn
            ? "Welcome back—sign in with the phone and password you used when joining."
            : "Become part of Canma's network—connect with creators, find opportunities, and collaborate on productions."}
        </p>
      </div>

      {nextUrl ? (
        <p className="small text-muted text-center mb-4">
          After {isSignIn ? "signing in" : "joining"}, you&apos;ll return to
          continue where you left off.
        </p>
      ) : null}

      <div className="container mb-4" data-aos="fade-up" data-aos-delay="50">
        <div className="row justify-content-center">
          <div className="col-lg-6">
            <div
              className="community-join-mode-switch d-flex rounded-pill p-1"
              role="tablist"
              aria-label="Community access"
            >
              <button
                type="button"
                role="tab"
                aria-selected={!isSignIn}
                className={`community-join-mode-tab btn flex-fill rounded-pill border-0 ${
                  !isSignIn
                    ? "community-join-mode-tab--active"
                    : "community-join-mode-tab--inactive"
                }`}
                onClick={() => setMode("join")}
              >
                Join now
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={isSignIn}
                className={`community-join-mode-tab btn flex-fill rounded-pill border-0 ${
                  isSignIn
                    ? "community-join-mode-tab--active"
                    : "community-join-mode-tab--inactive"
                }`}
                onClick={() => setMode("signin")}
              >
                Already joined
              </button>
            </div>
          </div>
        </div>
      </div>

      {isSignIn ? (
        <div className="container" data-aos="fade-up" data-aos-delay="100">
          <div className="row justify-content-center">
            <div className="col-lg-6">
              <div className="form-panel">
                <CommunityMemberSignIn nextUrl={nextUrl} />
                <p className="small text-muted text-center mt-4 mb-0">
                  Not a member yet?{" "}
                  <button
                    type="button"
                    className="community-join-mode-link btn btn-link p-0 align-baseline"
                    onClick={() => setMode("join")}
                  >
                    Join the community
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <JoinCommunityForm nextUrl={nextUrl} />
          <p className="small text-muted text-center mt-3 mb-0">
            Already joined?{" "}
            <button
              type="button"
              className="community-join-mode-link btn btn-link p-0 align-baseline"
              onClick={() => setMode("signin")}
            >
              Sign in
            </button>
          </p>
        </>
      )}
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
