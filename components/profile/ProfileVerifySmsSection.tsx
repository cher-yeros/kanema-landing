"use client";

import { useApolloClient, useMutation } from "@apollo/client/react";
import { useState } from "react";

import {
  REQUEST_VERIFICATION_OTP_MUTATION,
  VERIFY_OTP_MUTATION,
} from "@/lib/election-graphql";
import type {
  RequestVerificationOtpMutation,
  VerifyOtpMutation,
} from "@/types/election-apollo";
import { MY_PROFILE_QUERY } from "@/lib/graphql/profile";

type ProfileVerifySmsSectionProps = {
  phone: string;
  isVerified: boolean;
};

export function ProfileVerifySmsSection({
  phone,
  isVerified,
}: ProfileVerifySmsSectionProps) {
  const client = useApolloClient();
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [devCode, setDevCode] = useState<string | null>(null);
  const [justVerified, setJustVerified] = useState(false);

  const [requestOtp, { loading: requesting }] =
    useMutation<RequestVerificationOtpMutation>(REQUEST_VERIFICATION_OTP_MUTATION);
  const [verifyOtp, { loading: verifying }] =
    useMutation<VerifyOtpMutation>(VERIFY_OTP_MUTATION);

  if (isVerified || justVerified) {
    return (
      <div className="profile-card">
        <div className="profile-card__head">
          <i className="bi bi-shield-check" aria-hidden />
          <h3 className="profile-card__title">Account verification</h3>
        </div>
        <p className="text-muted mb-0 small">
          Your account is verified by SMS. You can vote and use member features
          that require verification.
        </p>
      </div>
    );
  }

  if (!phone?.trim()) {
    return (
      <div className="profile-card">
        <div className="profile-card__head">
          <i className="bi bi-shield-exclamation" aria-hidden />
          <h3 className="profile-card__title">Verify your account</h3>
        </div>
        <p className="text-muted mb-0 small">
          Add a phone number to your account before you can verify via SMS.
        </p>
      </div>
    );
  }

  async function onSendCode() {
    setError(null);
    setInfo(null);
    setDevCode(null);
    try {
      const res = await requestOtp({
        variables: {
          input: { identifier: phone.trim(), channel: "PHONE" },
        },
      });
      const payload = res.data?.requestVerificationOtp;
      setInfo(
        payload?.message ??
          "If an account exists, a verification code has been sent by SMS.",
      );
      if (payload?.dev_code) {
        setDevCode(payload.dev_code);
        setCode(payload.dev_code);
      }
      setCodeSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not send SMS code.");
    }
  }

  async function onConfirm(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    if (code.trim().length < 4) {
      setError("Enter the SMS code you received.");
      return;
    }
    try {
      const res = await verifyOtp({
        variables: {
          input: {
            identifier: phone.trim(),
            channel: "PHONE",
            code: code.trim(),
          },
        },
      });
      const payload = res.data?.verifyOtp;
      if (!payload?.success) {
        setError(payload?.message ?? "Verification failed.");
        return;
      }
      setJustVerified(true);
      setInfo(payload.message ?? "Your account is verified.");
      await client.refetchQueries({ include: [MY_PROFILE_QUERY] });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Verification failed.");
    }
  }

  return (
    <div className="profile-card">
      <div className="profile-card__head">
        <i className="bi bi-shield-exclamation" aria-hidden />
        <h3 className="profile-card__title">Verify your account</h3>
      </div>
      <p className="text-muted small mb-3">
        We’ll send a one-time SMS code to{" "}
        <strong className="text-body">{phone}</strong>. Verification unlocks
        voting and other member features.
      </p>

      {!codeSent ? (
        <button
          type="button"
          className="btn btn-accent btn-sm"
          disabled={requesting}
          onClick={() => void onSendCode()}
        >
          <i className="bi bi-phone me-1" aria-hidden />
          {requesting ? "Sending…" : "Send SMS code"}
        </button>
      ) : (
        <form className="php-email-form" onSubmit={(e) => void onConfirm(e)}>
          <div className="mb-3">
            <label htmlFor="profile-verify-code" className="form-label">
              SMS code
            </label>
            <input
              id="profile-verify-code"
              className="form-control"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="000000"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              maxLength={8}
              required
            />
          </div>
          <div className="d-flex flex-wrap gap-2">
            <button
              type="submit"
              className="btn btn-accent btn-sm"
              disabled={verifying}
            >
              {verifying ? "Verifying…" : "Confirm code"}
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              disabled={requesting}
              onClick={() => void onSendCode()}
            >
              {requesting ? "Sending…" : "Resend SMS"}
            </button>
          </div>
        </form>
      )}

      {info ? (
        <div className="alert alert-info mt-3 mb-0 py-2 small" role="status">
          {info}
        </div>
      ) : null}
      {devCode ? (
        <div className="alert alert-secondary mt-2 mb-0 py-2 small font-monospace">
          Dev code: <strong>{devCode}</strong>
        </div>
      ) : null}
      {error ? <div className="error-message d-block mt-3">{error}</div> : null}
    </div>
  );
}
