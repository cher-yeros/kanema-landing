"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "@apollo/client/react";
import { LOGIN_MUTATION } from "@/lib/election-graphql";
import type { LoginMutation } from "@/types/election-apollo";
import { useAppDispatch } from "@/lib/store/hooks";
import { setAuthSession } from "@/lib/store/auth-slice";

function safeRedirectPath(raw: string | null): string {
  if (!raw?.startsWith("/") || raw.startsWith("//")) return "/election";
  return raw;
}

function ElectionLoginInner() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextParam = searchParams.get("next");

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [login, { loading }] = useMutation<LoginMutation>(LOGIN_MUTATION);

  const registerHref =
    nextParam && nextParam.startsWith("/") && !nextParam.startsWith("//")
      ? `/election/register?next=${encodeURIComponent(nextParam)}`
      : "/election/register";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const res = await login({
        variables: { input: { identifier, password } },
      });
      const payload = res.data?.login;
      if (!payload?.success || !payload.token || !payload.user) {
        setError(payload?.message ?? "Login failed.");
        return;
      }
      dispatch(
        setAuthSession({
          token: payload.token,
          user: {
            id: payload.user.id,
            full_name: payload.user.full_name,
            avatar_url: null,
          },
        }),
      );
      router.push(safeRedirectPath(nextParam));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed.");
    }
  }

  return (
    <section className="contact section">
      <div className="container section-title" data-aos="fade-up">
        <h1>Member login</h1>
        <p>
          Sign in with the phone or email on your Canma account. New members can{" "}
          <Link href={registerHref} className="link-body-emphasis">
            register with phone only
          </Link>
          , then complete{" "}
          <Link href="/election/verify" className="link-body-emphasis">
            OTP verification
          </Link>
          . The same account works for votes, production job applications, and
          postings.
        </p>
      </div>

      <div className="container" data-aos="fade-up" data-aos-delay="100">
        <div className="row g-0 form-info-wrapper">
          <div className="col-lg-5">
            <div className="info-panel">
              <div className="panel-content">
                <h3>Trust, then participate</h3>
                <p>
                  Whether you are joining as a creative, hiring talent, or
                  taking part in community decisions, we route access carefully.
                </p>
                <div
                  className="panel-stats"
                  data-aos="zoom-in"
                  data-aos-delay="200"
                >
                  <div className="row g-3">
                    <div className="col-4">
                      <div className="single-stat">
                        <strong>1</strong>
                        <span>Vote / election</span>
                      </div>
                    </div>
                    <div className="col-4">
                      <div className="single-stat">
                        <strong>OTP</strong>
                        <span>Verify</span>
                      </div>
                    </div>
                    <div className="col-4">
                      <div className="single-stat">
                        <strong>Open</strong>
                        <span>Jobs</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="d-flex flex-wrap gap-2 mt-4">
                  <Link href="/election" className="btn btn-accent">
                    <i className="bi bi-arrow-left-circle me-2" />
                    Back to ballot
                  </Link>
                  <Link href="/jobs" className="btn btn-ghost">
                    Job center
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-7">
            <div className="form-panel">
              <div className="form-intro">
                <i className="bi bi-shield-lock" />
                <h3>Sign in</h3>
                <p>Use your Canma member credentials.</p>
              </div>

              <form
                className="php-email-form"
                onSubmit={(e) => void onSubmit(e)}
              >
                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label">Email or phone</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="+251… or you@example.com"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      autoComplete="username"
                      required
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label">Password</label>
                    <input
                      type="password"
                      className="form-control"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      required
                    />
                  </div>
                </div>

                {error ? (
                  <div className="error-message d-block mt-3">{error}</div>
                ) : null}

                <button
                  type="submit"
                  className="dispatch-btn mt-4"
                  disabled={loading}
                >
                  <i className="bi bi-arrow-right-circle-fill" />
                  <span>{loading ? "Signing in…" : "Sign in"}</span>
                </button>
                <p className="small text-muted mt-3 mb-0">
                  No account yet?{" "}
                  <Link href={registerHref}>Create one with your phone</Link>.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function ElectionLoginPage() {
  return (
    <Suspense
      fallback={
        <section className="contact section py-5 text-center">
          <p className="text-muted">Loading sign-in…</p>
        </section>
      }
    >
      <ElectionLoginInner />
    </Suspense>
  );
}
