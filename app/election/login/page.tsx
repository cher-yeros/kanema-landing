"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApolloClient, useMutation } from "@apollo/client/react";
import { LOGIN_MUTATION } from "@/lib/election-graphql";
import type { LoginMutation } from "@/types/election-apollo";
import { setStoredToken } from "@/components/election/ElectionApolloProvider";

export default function ElectionLoginPage() {
  const client = useApolloClient();
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [login, { loading }] = useMutation<LoginMutation>(LOGIN_MUTATION);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const res = await login({
        variables: { input: { identifier, password } },
      });
      const payload = res.data?.login;
      if (!payload?.success || !payload.token) {
        setError(payload?.message ?? "Login failed.");
        return;
      }
      setStoredToken(payload.token);
      await client.resetStore();
      router.push("/election");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed.");
    }
  }

  return (
    <section className="contact section">
      <div className="container section-title" data-aos="fade-up">
        <h1>Member login</h1>
        <p>
          Sign in with the phone or email on your Kanema account. New members can{" "}
          <Link href="/election/register" className="link-body-emphasis">
            register with phone only
          </Link>
          , then complete{" "}
          <Link href="/election/verify" className="link-body-emphasis">
            OTP verification
          </Link>
          . Voting is enforced on the server: only verified members can submit a
          ballot.
        </p>
      </div>

      <div className="container" data-aos="fade-up" data-aos-delay="100">
        <div className="row g-0 form-info-wrapper">
          <div className="col-lg-5">
            <div className="info-panel">
              <div className="panel-content">
                <h3>Trust, then vote</h3>
                <p>
                  Whether you are joining as a creative, hiring talent, or taking
                  part in community decisions, we route access carefully. After
                  login, complete OTP verification if you have not already—then open
                  the ballot from the election page.
                </p>
                <div className="panel-stats" data-aos="zoom-in" data-aos-delay="200">
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
                        <strong>Live</strong>
                        <span>Results</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="d-flex flex-wrap gap-2 mt-4">
                  <Link href="/election" className="btn btn-accent">
                    <i className="bi bi-arrow-left-circle me-2" />
                    Back to ballot
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-7">
            <div className="form-panel">
              <div className="form-intro">
                <i className="bi bi-shield-lock" />
                <h3>Sign in to vote</h3>
                <p>
                  Use your Kanema credentials. If you need access, reach the team the
                  same way you would for membership or partnerships.
                </p>
              </div>

              <form className="php-email-form" onSubmit={(e) => void onSubmit(e)}>
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

                {error ?
                  <div className="error-message d-block mt-3">{error}</div>
                : null}

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
                  <Link href="/election/register">Create one with your phone</Link>.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
