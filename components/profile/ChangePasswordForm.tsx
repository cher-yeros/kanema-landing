"use client";

import { useMutation } from "@apollo/client/react";
import { useState } from "react";

import { CHANGE_PASSWORD } from "@/lib/graphql/password";
import { setAuthSession } from "@/lib/store/auth-slice";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { selectAuthUser } from "@/lib/store/auth-selectors";

type ChangeData = {
  changePassword: {
    success: boolean;
    message?: string | null;
    token?: string | null;
    user?: { id: string; full_name: string } | null;
  };
};

export function ChangePasswordForm() {
  const dispatch = useAppDispatch();
  const authUser = useAppSelector(selectAuthUser);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [changePassword, { loading }] =
    useMutation<ChangeData>(CHANGE_PASSWORD);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirm) {
      setError("New passwords must match.");
      return;
    }
    try {
      const res = await changePassword({
        variables: {
          input: {
            current_password: currentPassword,
            new_password: newPassword,
          },
        },
      });
      const payload = res.data?.changePassword;
      if (!payload?.success) {
        setError(payload?.message ?? "Could not change password.");
        return;
      }
      if (payload.token && (payload.user || authUser)) {
        dispatch(
          setAuthSession({
            token: payload.token,
            user: {
              id: payload.user?.id ?? authUser!.id,
              full_name: payload.user?.full_name ?? authUser!.full_name,
              avatar_url: authUser?.avatar_url ?? null,
            },
          }),
        );
      }
      setSuccess(payload.message ?? "Password changed.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirm("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not change password.");
    }
  }

  return (
    <form className="php-email-form" onSubmit={(e) => void onSubmit(e)}>
      <div className="form-intro mb-3">
        <i className="bi bi-shield-lock" />
        <h3 className="h5 mb-1">Change password</h3>
        <p className="mb-0 small text-muted">
          Update the password you use to sign in to Canma.
        </p>
      </div>
      <div className="row g-3">
        <div className="col-12">
          <label htmlFor="change-current-password" className="form-label">
            Current password
          </label>
          <input
            id="change-current-password"
            type="password"
            className="form-control"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
        </div>
        <div className="col-md-6">
          <label htmlFor="change-new-password" className="form-label">
            New password
          </label>
          <input
            id="change-new-password"
            type="password"
            className="form-control"
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            minLength={8}
            required
          />
        </div>
        <div className="col-md-6">
          <label htmlFor="change-confirm-password" className="form-label">
            Confirm new password
          </label>
          <input
            id="change-confirm-password"
            type="password"
            className="form-control"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            minLength={8}
            required
          />
        </div>
      </div>
      {success ? (
        <div className="sent-message d-block mt-3">{success}</div>
      ) : null}
      {error ? <div className="error-message d-block mt-3">{error}</div> : null}
      <button type="submit" className="dispatch-btn mt-4" disabled={loading}>
        <i className="bi bi-check-circle-fill" />
        <span>{loading ? "Saving…" : "Save password"}</span>
      </button>
    </form>
  );
}
