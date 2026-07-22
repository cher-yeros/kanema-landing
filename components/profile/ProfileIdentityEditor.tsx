"use client";

import { useMutation } from "@apollo/client/react";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useMemo, useState } from "react";
import { Control, Controller, useForm, type Resolver } from "react-hook-form";
import type { JoinCommunityFormValues } from "@/components/community/join-community-form-schema";

import { CommunityInterestsField } from "@/components/community/CommunityInterestsField";
import { EthiopiaPhoneInput } from "@/components/community/EthiopiaPhoneInput";
import { ProfilePictureUpload } from "@/components/community/ProfilePictureUpload";
import {
  COMMUNITY_JOIN_ROLE_FROM_GRAPHQL,
  mapCommunityJoinRole,
  profileIdentityEditorSchema,
  type ProfileIdentityEditorValues,
} from "@/components/profile/profile-identity-editor-schema";
import { HEADER_USER_QUERY } from "@/lib/graphql/community-join";
import { MY_PROFILE_QUERY, UPDATE_MY_IDENTITY } from "@/lib/graphql/profile";
import {
  formatEthiopiaPhoneForApi,
  parseEthiopiaPhoneFromApi,
} from "@/lib/ethiopia-phone";
import { setAuthUser } from "@/lib/store/auth-slice";
import { useAppDispatch } from "@/lib/store/hooks";

type ProfileUser = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
};

type CommunityJoinProfile = {
  full_name: string;
  phone: string | null;
  city: string | null;
  role: string;
  interests: string[];
  portfolio_url: string | null;
  message: string | null;
  avatar_url: string | null;
};

type ProfileIdentityEditorProps = {
  me: ProfileUser;
  communityJoin: CommunityJoinProfile | null;
  onSaved?: () => void;
};

type UpdateMyIdentityMutation = {
  updateMyIdentity: {
    me: ProfileUser;
    communityJoin: CommunityJoinProfile | null;
  };
};

function buildDefaultValues(
  me: ProfileUser,
  communityJoin: CommunityJoinProfile | null,
): ProfileIdentityEditorValues {
  const phone = parseEthiopiaPhoneFromApi(communityJoin?.phone ?? me.phone);
  const roleKey: ProfileIdentityEditorValues["role"] = communityJoin?.role
    ? (COMMUNITY_JOIN_ROLE_FROM_GRAPHQL[communityJoin.role] ?? "creative")
    : "creative";

  return {
    fullName: communityJoin?.full_name ?? me.full_name,
    phone,
    city: communityJoin?.city ?? "",
    role: roleKey,
    interests: communityJoin?.interests ?? [],
    portfolioUrl: communityJoin?.portfolio_url ?? "",
    message: communityJoin?.message ?? "",
    avatarUrl: communityJoin?.avatar_url ?? "",
  } satisfies ProfileIdentityEditorValues;
}

export function ProfileIdentityEditor({
  me,
  communityJoin,
  onSaved,
}: ProfileIdentityEditorProps) {
  const dispatch = useAppDispatch();
  const [saved, setSaved] = useState(false);
  const [updateIdentity, { loading }] = useMutation<UpdateMyIdentityMutation>(
    UPDATE_MY_IDENTITY,
    {
      refetchQueries: [
        { query: MY_PROFILE_QUERY },
        { query: HEADER_USER_QUERY },
      ],
    },
  );

  const defaultValues = useMemo(
    () => buildDefaultValues(me, communityJoin),
    [me, communityJoin],
  );

  const hasCommunityProfile = Boolean(communityJoin);

  const {
    register,
    handleSubmit,
    reset,
    control,
    setError,
    formState: { errors, isDirty },
  } = useForm<ProfileIdentityEditorValues>({
    resolver: yupResolver(
      profileIdentityEditorSchema,
    ) as Resolver<ProfileIdentityEditorValues>,
    defaultValues,
  });

  useEffect(() => {
    reset(buildDefaultValues(me, communityJoin));
  }, [me, communityJoin, reset]);

  async function onSubmit(values: ProfileIdentityEditorValues) {
    setSaved(false);

    if (communityJoin && !values.avatarUrl?.trim()) {
      setError("avatarUrl", {
        type: "manual",
        message: "Please upload a profile picture.",
      });
      return;
    }

    const result = await updateIdentity({
      variables: {
        input: {
          full_name: values.fullName.trim(),
          phone: formatEthiopiaPhoneForApi(values.phone),
          ...(communityJoin
            ? {
                city: values.city?.trim() || null,
                role: mapCommunityJoinRole(values.role),
                interests: values.interests,
                portfolio_url: values.portfolioUrl?.trim() || null,
                message: values.message?.trim() || null,
                avatar_url: values.avatarUrl?.trim() || null,
              }
            : values.avatarUrl?.trim()
              ? { avatar_url: values.avatarUrl.trim() }
              : {}),
        },
      },
    });

    const payload = result.data?.updateMyIdentity;
    if (!payload) return;

    dispatch(
      setAuthUser({
        id: payload.me.id,
        full_name: payload.me.full_name,
        avatar_url: payload.communityJoin?.avatar_url ?? null,
      }),
    );

    setSaved(true);
    onSaved?.();
  }

  return (
    <div className="profile-card profile-card--editor">
      <div className="profile-card__head">
        <i className="bi bi-person-badge" aria-hidden />
        <div>
          <h3 className="profile-card__title">Edit identity</h3>
          <p className="profile-card__subtitle">
            Update your name, photo, and community details shown across Canma.
          </p>
        </div>
      </div>

      <div className="contact">
        <div className="form-panel form-panel--embedded">
          <form
            noValidate
            onSubmit={handleSubmit(onSubmit)}
            className="php-email-form"
          >
            <div className="row g-3">
              <div className="col-12">
                <Controller
                  name="avatarUrl"
                  control={control}
                  render={({ field }) => (
                    <ProfilePictureUpload
                      value={field.value || null}
                      onChange={(url) => field.onChange(url ?? "")}
                      disabled={loading}
                      error={errors.avatarUrl?.message ?? null}
                    />
                  )}
                />
              </div>

              <div className="col-md-6">
                <label
                  htmlFor="profile-identity-fullName"
                  className="form-label"
                >
                  Full name
                </label>
                <input
                  id="profile-identity-fullName"
                  type="text"
                  autoComplete="name"
                  className={`form-control${errors.fullName ? " is-invalid" : ""}`}
                  placeholder="Your full name"
                  {...register("fullName")}
                />
                {errors.fullName?.message ? (
                  <div className="invalid-feedback d-block">
                    {errors.fullName.message}
                  </div>
                ) : null}
              </div>

              <div className="col-md-6">
                <label htmlFor="profile-identity-email" className="form-label">
                  Email
                </label>
                <input
                  id="profile-identity-email"
                  type="email"
                  className="form-control"
                  value={me.email}
                  readOnly
                  disabled
                />
                <p className="small text-secondary mb-0 mt-1">
                  Contact support to change your email address.
                </p>
              </div>

              <div className="col-md-6">
                <label htmlFor="profile-identity-phone" className="form-label">
                  Phone
                </label>
                <Controller
                  name="phone"
                  control={control}
                  render={({ field }) => (
                    <EthiopiaPhoneInput
                      id="profile-identity-phone"
                      value={field.value}
                      onChange={field.onChange}
                      invalid={Boolean(errors.phone)}
                      disabled={loading}
                    />
                  )}
                />
                {errors.phone?.message ? (
                  <div className="invalid-feedback d-block">
                    {errors.phone.message}
                  </div>
                ) : null}
              </div>

              {hasCommunityProfile ? (
                <>
                  <div className="col-md-6">
                    <label
                      htmlFor="profile-identity-city"
                      className="form-label"
                    >
                      City
                    </label>
                    <input
                      id="profile-identity-city"
                      type="text"
                      autoComplete="address-level2"
                      className={`form-control${errors.city ? " is-invalid" : ""}`}
                      placeholder="Addis Ababa"
                      {...register("city")}
                    />
                    {errors.city?.message ? (
                      <div className="invalid-feedback d-block">
                        {errors.city.message}
                      </div>
                    ) : null}
                  </div>

                  <div className="col-12">
                    <label
                      htmlFor="profile-identity-role"
                      className="form-label"
                    >
                      Community role
                    </label>
                    <select
                      id="profile-identity-role"
                      className={`form-select${errors.role ? " is-invalid" : ""}`}
                      {...register("role")}
                    >
                      <option value="creative">Creative</option>
                      <option value="producer">Producer / crew</option>
                      <option value="business">Business / partner</option>
                      <option value="student">Student</option>
                      <option value="volunteer">Volunteer</option>
                      <option value="other">Other</option>
                    </select>
                    {errors.role?.message ? (
                      <div className="invalid-feedback d-block">
                        {errors.role.message}
                      </div>
                    ) : null}
                  </div>

                  <div className="col-12">
                    <CommunityInterestsField
                      control={
                        control as unknown as Control<JoinCommunityFormValues>
                      }
                      error={errors.interests}
                    />
                  </div>

                  <div className="col-12">
                    <label
                      htmlFor="profile-identity-portfolioUrl"
                      className="form-label"
                    >
                      Portfolio / social link
                    </label>
                    <input
                      id="profile-identity-portfolioUrl"
                      type="url"
                      inputMode="url"
                      autoComplete="url"
                      className={`form-control${errors.portfolioUrl ? " is-invalid" : ""}`}
                      placeholder="https://…"
                      {...register("portfolioUrl")}
                    />
                    {errors.portfolioUrl?.message ? (
                      <div className="invalid-feedback d-block">
                        {errors.portfolioUrl.message}
                      </div>
                    ) : null}
                  </div>

                  <div className="col-12">
                    <label
                      htmlFor="profile-identity-message"
                      className="form-label"
                    >
                      About you
                    </label>
                    <textarea
                      id="profile-identity-message"
                      className={`form-control${errors.message ? " is-invalid" : ""}`}
                      rows={4}
                      placeholder="A short introduction for your community profile…"
                      {...register("message")}
                    />
                    {errors.message?.message ? (
                      <div className="invalid-feedback d-block">
                        {errors.message.message}
                      </div>
                    ) : null}
                  </div>
                </>
              ) : (
                <div className="col-12">
                  <p className="small text-secondary mb-0">
                    Join the community to add city, role, interests, and a
                    public showcase profile.
                  </p>
                </div>
              )}
            </div>

            {saved && !isDirty ? (
              <p className="profile-save-notice" role="status">
                <i className="bi bi-check-circle-fill" aria-hidden />
                Profile updated successfully.
              </p>
            ) : null}

            <button
              type="submit"
              className="dispatch-btn"
              disabled={loading || !isDirty}
            >
              <i className="bi bi-arrow-right-circle-fill" aria-hidden />
              <span>{loading ? "Saving…" : "Save identity"}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
