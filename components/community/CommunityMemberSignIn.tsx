"use client";

import { useMutation } from "@apollo/client/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { LOGIN_COMMUNITY_MEMBER } from "@/lib/graphql/community-join";
import {
  formatEthiopiaPhoneForApi,
  isValidEthiopiaLocalPhone,
} from "@/lib/ethiopia-phone";
import { setAuthSession } from "@/lib/store/auth-slice";
import { useAppDispatch } from "@/lib/store/hooks";

import { EthiopiaPhoneInput } from "./EthiopiaPhoneInput";

type LoginData = {
  loginCommunityMember: {
    success: boolean;
    message?: string | null;
    token?: string | null;
    user?: {
      id: string;
      full_name: string;
    } | null;
  };
};

export function CommunityMemberSignIn({ nextUrl }: { nextUrl?: string }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [login, { loading }] = useMutation<LoginData>(LOGIN_COMMUNITY_MEMBER);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!isValidEthiopiaLocalPhone(phone)) {
      setError("Enter a valid 9-digit mobile number starting with 9 or 7.");
      return;
    }
    try {
      const res = await login({
        variables: {
          input: { phone: formatEthiopiaPhoneForApi(phone), password },
        },
      });
      const payload = res.data?.loginCommunityMember;
      if (!payload?.success || !payload.token || !payload.user) {
        setError(payload?.message ?? "Could not sign in.");
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

      if (nextUrl) {
        router.push(nextUrl);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not sign in.");
    }
  }

  return (
    <form className="php-email-form" onSubmit={(e) => void onSubmit(e)}>
      <div className="form-intro mb-3">
        <i className="bi bi-shield-lock" />
        <h3 className="h5 mb-1">Member sign in</h3>
        <p className="mb-0 small text-muted">
          Use the phone number and password from your community application.
        </p>
      </div>
      <div className="row g-3">
        <div className="col-12">
          <label htmlFor="community-signin-phone" className="form-label">
            Phone number
          </label>
          <EthiopiaPhoneInput
            id="community-signin-phone"
            value={phone}
            onChange={setPhone}
          />
        </div>
        <div className="col-12">
          <label htmlFor="community-signin-password" className="form-label">
            Password
          </label>
          <input
            id="community-signin-password"
            type="password"
            className="form-control"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
      </div>
      {error ? <div className="error-message d-block mt-3">{error}</div> : null}
      <button type="submit" className="dispatch-btn mt-4" disabled={loading}>
        <i className="bi bi-arrow-right-circle-fill" />
        <span>{loading ? "Signing in…" : "Sign in"}</span>
      </button>
    </form>
  );
}
