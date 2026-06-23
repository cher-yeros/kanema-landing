"use client";

import { useMutation } from "@apollo/client/react";
import { useApolloClient } from "@apollo/client/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { LOGIN_COMMUNITY_MEMBER } from "@/lib/graphql/community-join";
import { setStoredToken } from "@/lib/store/imperative-auth";

type LoginData = {
  loginCommunityMember: {
    success: boolean;
    message?: string | null;
    token?: string | null;
  };
};

export function CommunityMemberSignIn({ nextUrl }: { nextUrl?: string }) {
  const router = useRouter();
  const client = useApolloClient();
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [login, { loading }] = useMutation<LoginData>(LOGIN_COMMUNITY_MEMBER);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const res = await login({
        variables: { input: { phone: phone.trim() } },
      });
      const payload = res.data?.loginCommunityMember;
      if (!payload?.success || !payload.token) {
        setError(payload?.message ?? "Could not sign in.");
        return;
      }
      setStoredToken(payload.token);
      await client.resetStore();
      if (nextUrl) {
        router.push(nextUrl);
        router.refresh();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not sign in.");
    }
  }

  return (
    <form className="php-email-form" onSubmit={(e) => void onSubmit(e)}>
      <div className="form-intro mb-3">
        <i className="bi bi-phone" />
        <h3 className="h5 mb-1">Already registered?</h3>
        <p className="mb-0 small text-muted">
          Enter the phone number you used when joining the community.
        </p>
      </div>
      <div className="row g-3">
        <div className="col-12">
          <label htmlFor="community-signin-phone" className="form-label">
            Phone number
          </label>
          <input
            id="community-signin-phone"
            type="tel"
            className="form-control"
            placeholder="+251911234567"
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>
      </div>
      {error ? <div className="error-message d-block mt-3">{error}</div> : null}
      <button type="submit" className="dispatch-btn mt-4" disabled={loading}>
        <i className="bi bi-arrow-right-circle-fill" />
        <span>{loading ? "Signing in…" : "Continue with phone"}</span>
      </button>
    </form>
  );
}
