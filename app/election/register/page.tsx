"use client";

import Link from "next/link";
import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { REGISTER_MUTATION } from "@/lib/election-graphql";
import type { RegisterMutation } from "@/types/election-apollo";

export default function ElectionRegisterPage() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const [register, { loading }] = useMutation<RegisterMutation>(REGISTER_MUTATION);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const res = await register({
        variables: {
          input: {
            phone: phone.trim(),
            password,
            ...(fullName.trim() ? { full_name: fullName.trim() } : {}),
            ...(email.trim() ? { email: email.trim() } : {}),
          },
        },
      });
      const payload = res.data?.register;
      if (!payload?.success) {
        setError(payload?.message ?? "Registration failed.");
        return;
      }
      setDone(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed.");
    }
  }

  return (
    <section className="contact section">
      <div className="container section-title" data-aos="fade-up">
        <h1>Create your member account</h1>
        <p>
          Your phone number is your unique identity—use international format (for
          example +251911234567). Email is optional; if you skip it, you will still
          sign in with your phone and password.
        </p>
      </div>

      <div className="container" data-aos="fade-up" data-aos-delay="100">
        <div className="row g-0 form-info-wrapper">
          <div className="col-lg-5">
            <div className="info-panel">
              <div className="panel-content">
                <h3>Three quick steps</h3>
                <ol className="ps-3 mb-0 small">
                  <li className="mb-2">Register here with phone and password.</li>
                  <li className="mb-2">
                    Sign in, then open{" "}
                    <Link href="/election/verify" className="link-light text-decoration-underline">
                      Verify with OTP
                    </Link>{" "}
                    to confirm your phone.
                  </li>
                  <li>Return to the ballot when voting is open.</li>
                </ol>
                <div className="d-flex flex-wrap gap-2 mt-4">
                  <Link href="/election/login" className="btn btn-accent">
                    <i className="bi bi-box-arrow-in-right me-2" />
                    Already a member? Sign in
                  </Link>
                  <Link href="/election" className="btn btn-ghost">
                    <i className="bi bi-arrow-left-circle me-2" />
                    Back to election
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-7">
            <div className="form-panel">
              <div className="form-intro">
                <i className="bi bi-person-plus" />
                <h3>Register</h3>
                <p>Password must be at least 8 characters.</p>
              </div>

              {done ?
                <div className="alert alert-success" role="status">
                  <strong>Account created.</strong> Next, sign in and complete phone
                  verification on the{" "}
                  <Link href="/election/verify" className="alert-link">
                    OTP page
                  </Link>
                  , then you can vote when the window is open.
                  <div className="mt-3">
                    <Link href="/election/login" className="btn btn-accent btn-sm">
                      Go to sign in
                    </Link>
                  </div>
                </div>
              : (
                <form className="php-email-form" onSubmit={(e) => void onSubmit(e)}>
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label">Mobile phone</label>
                      <input
                        type="tel"
                        className="form-control"
                        placeholder="+251911234567"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        autoComplete="tel"
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
                        autoComplete="new-password"
                        minLength={8}
                        required
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label">
                        Display name <span className="text-muted">(optional)</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="How you want your name to appear"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        autoComplete="name"
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label">
                        Email <span className="text-muted">(optional)</span>
                      </label>
                      <input
                        type="email"
                        className="form-control"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
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
                    <i className="bi bi-check2-circle" />
                    <span>{loading ? "Creating account…" : "Create account"}</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
