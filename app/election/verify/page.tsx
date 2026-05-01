"use client";

import Link from "next/link";
import { useState } from "react";
import { useApolloClient, useMutation } from "@apollo/client/react";
import {
  REQUEST_VERIFICATION_OTP_MUTATION,
  VERIFY_OTP_MUTATION,
} from "@/lib/election-graphql";
import type {
  RequestVerificationOtpMutation,
  VerifyOtpMutation,
} from "@/types/election-apollo";
import { getStoredToken } from "@/lib/store/imperative-auth";
import { useAppSelector } from "@/lib/store/hooks";

type Channel = "PHONE" | "EMAIL";

export default function ElectionVerifyPage() {
  const sessionToken = useAppSelector((s) => s.auth.token);
  const client = useApolloClient();
  const [channel, setChannel] = useState<Channel>("PHONE");
  const [identifier, setIdentifier] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [devCode, setDevCode] = useState<string | null>(null);
  const [verified, setVerified] = useState(false);

  const [requestOtp, { loading: reqLoading }] =
    useMutation<RequestVerificationOtpMutation>(REQUEST_VERIFICATION_OTP_MUTATION);
  const [verifyOtp, { loading: verLoading }] =
    useMutation<VerifyOtpMutation>(VERIFY_OTP_MUTATION);

  async function onRequest(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setDevCode(null);
    try {
      const res = await requestOtp({
        variables: {
          input: { identifier: identifier.trim(), channel },
        },
      });
      const p = res.data?.requestVerificationOtp;
      setInfo(p?.message ?? null);
      if (p?.dev_code) setDevCode(p.dev_code);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not send code.");
    }
  }

  async function onVerify(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    try {
      const res = await verifyOtp({
        variables: {
          input: {
            identifier: identifier.trim(),
            channel,
            code: code.trim(),
          },
        },
      });
      const p = res.data?.verifyOtp;
      if (!p?.success) {
        setError(p?.message ?? "Verification failed.");
        return;
      }
      setVerified(true);
      if (getStoredToken()) {
        await client.resetStore();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Verification failed.");
    }
  }

  return (
    <section className="contact section">
      <div className="container section-title" data-aos="fade-up">
        <h1>Verify with OTP</h1>
        <p>
          Request a one-time code on the channel you used when you registered. For
          phone-only accounts, choose <strong>Phone</strong> and enter the same number
          (any common format is accepted).
        </p>
      </div>

      <div className="container" data-aos="fade-up" data-aos-delay="100">
        <div className="row g-0 form-info-wrapper">
          <div className="col-lg-5">
            <div className="info-panel">
              <div className="panel-content">
                <h3>Why this step?</h3>
                <p className="small mb-0">
                  Voting is limited to verified members. After you confirm, refresh the
                  election page if you are already signed in so your status updates.
                </p>
                <div className="d-flex flex-wrap gap-2 mt-4">
                  <Link href="/election" className="btn btn-accent">
                    <i className="bi bi-check2-square me-2" />
                    Back to ballot
                  </Link>
                  <Link href="/election/login" className="btn btn-ghost">
                    Sign in
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-7">
            <div className="form-panel">
              <div className="form-intro">
                <i className="bi bi-shield-check" />
                <h3>Phone or email code</h3>
                <p>
                  Not registered yet?{" "}
                  <Link href="/election/register">Create an account</Link> first.
                </p>
              </div>

              {verified ?
                <div className="alert alert-success" role="status">
                  <strong>Verified.</strong> You can vote when the election is open and
                  your account meets the other checks on the ballot page.
                  <div className="mt-3 d-flex flex-wrap gap-2">
                    <Link href="/election" className="btn btn-accent btn-sm">
                      Open election
                    </Link>
                    {!sessionToken ?
                      <Link href="/election/login" className="btn btn-ghost btn-sm">
                        Sign in to continue
                      </Link>
                    : null}
                  </div>
                </div>
              : (
                <>
                  <form className="php-email-form mb-4" onSubmit={(e) => void onRequest(e)}>
                    <div className="row g-3">
                      <div className="col-12">
                        <label className="form-label">Channel</label>
                        <select
                          className="form-select"
                          value={channel}
                          onChange={(e) => setChannel(e.target.value as Channel)}
                        >
                          <option value="PHONE">Phone (SMS / voice in production)</option>
                          <option value="EMAIL">Email</option>
                        </select>
                      </div>
                      <div className="col-12">
                        <label className="form-label">
                          {channel === "PHONE" ? "Phone number" : "Email address"}
                        </label>
                        <input
                          type={channel === "PHONE" ? "tel" : "email"}
                          className="form-control"
                          placeholder={
                            channel === "PHONE" ? "+251… or local format" : "you@example.com"
                          }
                          value={identifier}
                          onChange={(e) => setIdentifier(e.target.value)}
                          autoComplete={channel === "PHONE" ? "tel" : "email"}
                          required
                        />
                      </div>
                    </div>
                    {error ?
                      <div className="error-message d-block mt-3">{error}</div>
                    : null}
                    {info ?
                      <div className="alert alert-info mt-3 mb-0 py-2 small" role="status">
                        {info}
                      </div>
                    : null}
                    {devCode ?
                      <div className="alert alert-secondary mt-2 mb-0 py-2 small font-monospace">
                        Dev code: <strong>{devCode}</strong>
                      </div>
                    : null}
                    <button
                      type="submit"
                      className="dispatch-btn mt-4"
                      disabled={reqLoading}
                    >
                      <i className="bi bi-send" />
                      <span>{reqLoading ? "Sending…" : "Send code"}</span>
                    </button>
                  </form>

                  <form className="php-email-form" onSubmit={(e) => void onVerify(e)}>
                    <div className="form-intro border-0 pt-0 pb-2">
                      <h4 className="h6 mb-0">Enter the code</h4>
                    </div>
                    <div className="row g-3">
                      <div className="col-12">
                        <label className="form-label">6-digit code</label>
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          className="form-control"
                          placeholder="000000"
                          value={code}
                          onChange={(e) => setCode(e.target.value)}
                          autoComplete="one-time-code"
                          maxLength={8}
                          required
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="dispatch-btn mt-4"
                      disabled={verLoading}
                    >
                      <i className="bi bi-check2-circle" />
                      <span>{verLoading ? "Verifying…" : "Confirm"}</span>
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
