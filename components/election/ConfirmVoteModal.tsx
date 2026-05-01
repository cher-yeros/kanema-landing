"use client";

import { createPortal } from "react-dom";

export function ConfirmVoteModal({
  open,
  candidateName,
  loading,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  candidateName: string;
  loading: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;
  if (typeof document === "undefined") return null;

  return createPortal(
    <>
      <div
        className="modal-backdrop fade show"
        onClick={onCancel}
        aria-hidden
      />
      <div
        className="modal fade show d-block confirm-vote-dialog"
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirmVoteTitle"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content shadow">
            <div className="modal-header border-0 pb-0">
              <h2 className="modal-title h5" id="confirmVoteTitle">
                Confirm your vote
              </h2>
              <button
                type="button"
                className="btn-close"
                aria-label="Close"
                onClick={onCancel}
                disabled={loading}
              />
            </div>
            <div className="modal-body pt-2">
              <p className="mb-0">
                Are you sure you want to vote for{" "}
                <strong style={{ color: "var(--accent-color)" }}>
                  {candidateName}
                </strong>
                ?
              </p>
              <p className="small text-muted mt-3 mb-0">
                One verified member, one vote for this election—recorded securely on
                the server. Like joining the community hub, this decision is
                intentional: after you submit, the ballot cannot be changed.
              </p>
            </div>
            <div className="modal-footer border-0 pt-0 gap-2">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={onCancel}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-accent"
                onClick={onConfirm}
                disabled={loading}
              >
                {loading ? "Submitting…" : "Submit vote"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}
