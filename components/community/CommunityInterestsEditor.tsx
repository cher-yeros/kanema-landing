"use client";

import { useMutation } from "@apollo/client/react";
import { useEffect, useState } from "react";

import {
  MY_PROFILE_QUERY,
  UPDATE_MY_IDENTITY_MUTATION,
} from "@/lib/graphql/profile";

import { CommunityInterestsPicker } from "./CommunityInterestsField";

import "./community-shadcn.css";

type CommunityInterestsEditorProps = {
  initialInterests: string[];
};

export function CommunityInterestsEditor({
  initialInterests,
}: CommunityInterestsEditorProps) {
  const [interests, setInterests] = useState(initialInterests);
  const [saved, setSaved] = useState(false);

  const [updateIdentity, { loading, error }] = useMutation(
    UPDATE_MY_IDENTITY_MUTATION,
    {
      refetchQueries: [{ query: MY_PROFILE_QUERY }],
    },
  );

  useEffect(() => {
    setInterests(initialInterests);
  }, [initialInterests]);

  const hasChanges =
    interests.length !== initialInterests.length ||
    interests.some((id) => !initialInterests.includes(id));

  async function saveInterests(e: React.FormEvent) {
    e.preventDefault();
    setSaved(false);
    await updateIdentity({
      variables: {
        input: { interests },
      },
    });
    setSaved(true);
  }

  return (
    <div className="profile-card profile-card--editor">
      <div className="profile-card__head">
        <i className="bi bi-heart" aria-hidden />
        <div>
          <h3 className="profile-card__title">Your interests</h3>
          <p className="profile-card__subtitle">
            Choose what you care about — shown on your community profile.
          </p>
        </div>
      </div>

      <div className="contact">
        <div className="form-panel form-panel--embedded">
          <form onSubmit={saveInterests} className="php-email-form">
            <CommunityInterestsPicker
              value={interests}
              onChange={setInterests}
              idPrefix="profile-interest"
            />
            {error ? (
              <p className="text-danger small mt-3 mb-0">
                Could not save interests. Please try again.
              </p>
            ) : null}
            {saved && !hasChanges && !loading ? (
              <p className="text-success small mt-3 mb-0">Interests saved.</p>
            ) : null}
            <button
              type="submit"
              className="dispatch-btn"
              disabled={loading || !hasChanges}
            >
              <i className="bi bi-arrow-right-circle-fill" aria-hidden />
              <span>{loading ? "Saving…" : "Save interests"}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
