"use client";

import { useMutation } from "@apollo/client/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  formatEthiopiaPhoneForApi,
  isValidEthiopiaLocalPhone,
} from "@/lib/ethiopia-phone";
import { REQUEST_PASSWORD_RESET, RESET_PASSWORD } from "@/lib/graphql/password";
import { setAuthSession } from "@/lib/store/auth-slice";
import { useAppDispatch } from "@/lib/store/hooks";

import { EthiopiaPhoneInput } from "./EthiopiaPhoneInput";

type Channel = "PHONE" | "EMAIL";

type RequestData = {
  requestPasswordReset: {
    success: boolean;
    message?: string | null;
    dev_code?: string | null;
  };
};

type ResetData = {
  resetPassword: {
    success: boolean;
    message?: string | null;
    token?: string | null;
    user?: { id: string; full_name: string } | null;
  };
};

export function ForgotPasswordForm({
  nextUrl = "/profile",
}: {
  nextUrl?: string;
}) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [channel, setChannel] = useState<Channel>("PHONE");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [step, setStep] = useState<"request" | "reset">("request");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [devCode, setDevCode] = useState<string | null>(null);

  const [requestReset, { loading: requesting }] = useMutation<RequestData>(
    REQUEST_PASSWORD_RESET,
  );
  const [resetPassword, { loading: resetting }] =
    useMutation<ResetData>(RESET_PASSWORD);

  function identifierForApi(): string | null {
    if (channel === "PHONE") {
      if (!isValidEthiopiaLocalPhone(phone)) return null;
      return formatEthiopiaPhoneForApi(phone);
    }
    const trimmed = email.trim().toLowerCase();
    return trimmed.includes("@") ? trimmed : null;
  }

  async function onRequest(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setDevCode(null);
    const identifier = identifierForApi();
    if (!identifier) {
      setError(
        channel === "PHONE"
          ? "Enter a valid 9-digit mobile number starting with 9 or 7."
          : "Enter a valid email address.",
      );
      return;
    }
    try {
      const res = await requestReset({
        variables: { input: { identifier, channel } },
      });
      const payload = res.data?.requestPasswordReset;
      setInfo(
        payload?.message ??
          "If an account exists, a reset code has been sent by SMS.",
      );
      if (payload?.dev_code) {
        setDevCode(payload.dev_code);
        setCode(payload.dev_code);
      }
      setStep("reset");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not send SMS code.");
    }
  }

  async function onReset(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    const identifier = identifierForApi();
    if (!identifier) {
      setError("Invalid account identifier.");
      return;
    }
    if (code.trim().length < 4) {
      setError("Enter the SMS code you received.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords must match.");
      return;
    }
    try {
      const res = await resetPassword({
        variables: {
          input: {
            identifier,
            channel,
            code: code.trim(),
            new_password: password,
          },
        },
      });
      const payload = res.data?.resetPassword;
      if (!payload?.success || !payload.token || !payload.user) {
        setError(payload?.message ?? "Could not reset password.");
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
      router.push(nextUrl);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Could not reset password.",
      );
    }
  }

  return (
    <form
      className="php-email-form"
      onSubmit={(e) => void (step === "request" ? onRequest(e) : onReset(e))}
    >
      <div className="form-intro mb-3">
        <i className="bi bi-key" />
        <h3 className="h5 mb-1">Reset password</h3>
        <p className="mb-0 small text-muted">
          {step === "request"
            ? channel === "PHONE"
              ? "Enter the phone number on your Canma account. We’ll send a one-time code by SMS."
              : "Enter the email on your Canma account. We’ll still send the reset code by SMS to your registered phone."
            : "Enter the SMS code and choose a new password."}
        </p>
      </div>

      <div className="row g-3">
        <div className="col-12">
          <label className="form-label">Account</label>
          <div className="d-flex gap-2">
            <button
              type="button"
              className={`btn btn-sm ${channel === "PHONE" ? "btn-accent" : "btn-ghost"}`}
              onClick={() => setChannel("PHONE")}
              disabled={step === "reset"}
            >
              Phone (SMS)
            </button>
            <button
              type="button"
              className={`btn btn-sm ${channel === "EMAIL" ? "btn-accent" : "btn-ghost"}`}
              onClick={() => setChannel("EMAIL")}
              disabled={step === "reset"}
            >
              Email
            </button>
          </div>
        </div>

        {channel === "PHONE" ? (
          <div className="col-12">
            <label htmlFor="forgot-phone" className="form-label">
              Phone number
            </label>
            <EthiopiaPhoneInput
              id="forgot-phone"
              value={phone}
              onChange={setPhone}
              disabled={step === "reset"}
            />
          </div>
        ) : (
          <div className="col-12">
            <label htmlFor="forgot-email" className="form-label">
              Email
            </label>
            <input
              id="forgot-email"
              type="email"
              className="form-control"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={step === "reset"}
              required
            />
          </div>
        )}

        {step === "reset" ? (
          <>
            <div className="col-12">
              <label htmlFor="forgot-code" className="form-label">
                SMS code
              </label>
              <input
                id="forgot-code"
                className="form-control"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
              />
            </div>
            <div className="col-12">
              <label htmlFor="forgot-password" className="form-label">
                New password
              </label>
              <input
                id="forgot-password"
                type="password"
                className="form-control"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
                required
              />
            </div>
            <div className="col-12">
              <label htmlFor="forgot-confirm" className="form-label">
                Confirm password
              </label>
              <input
                id="forgot-confirm"
                type="password"
                className="form-control"
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                minLength={8}
                required
              />
            </div>
          </>
        ) : null}
      </div>

      {info ? <div className="sent-message d-block mt-3">{info}</div> : null}
      {devCode ? (
        <div className="small text-muted mt-2">
          Dev code: <code>{devCode}</code>
        </div>
      ) : null}
      {error ? <div className="error-message d-block mt-3">{error}</div> : null}

      <button
        type="submit"
        className="dispatch-btn mt-4"
        disabled={requesting || resetting}
      >
        <i className="bi bi-arrow-right-circle-fill" />
        <span>
          {step === "request"
            ? requesting
              ? "Sending…"
              : "Send SMS code"
            : resetting
              ? "Updating…"
              : "Update password"}
        </span>
      </button>

      <div className="d-flex flex-wrap gap-3 mt-3 small">
        {step === "reset" ? (
          <button
            type="button"
            className="btn btn-link p-0"
            onClick={() => {
              setStep("request");
              setCode("");
              setPassword("");
              setConfirm("");
              setError(null);
              setInfo(null);
              setDevCode(null);
            }}
          >
            Request a new SMS code
          </button>
        ) : null}
        <Link href="/community/join?mode=signin">Back to sign in</Link>
      </div>
    </form>
  );
}
