"use client";

import { useMutation } from "@apollo/client/react";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { SUBMIT_COMMUNITY_JOIN } from "@/lib/graphql/community-join";
import { setAuthSession } from "@/lib/store/auth-slice";
import { useAppDispatch } from "@/lib/store/hooks";

import { CommunityInterestsField } from "./CommunityInterestsField";
import { ProfilePictureUpload } from "./ProfilePictureUpload";
import {
  JOIN_COMMUNITY_HONEYPOT_FIELD,
  joinCommunityFormDefaultValues,
  joinCommunityFormSchema,
  type JoinCommunityFormValues,
} from "./join-community-form-schema";

import "./community-shadcn.css";

const HOME_FEATURE_IMAGE = "/img/about/about-us.png";

const COMMUNITY_JOIN_ROLE_GRAPHQL: Record<string, string> = {
  creative: "CREATIVE",
  producer: "PRODUCER",
  business: "BUSINESS",
  student: "STUDENT",
  volunteer: "VOLUNTEER",
  other: "OTHER",
};

function mapCommunityJoinRole(role: string): string {
  const key = role.trim().toLowerCase();
  return COMMUNITY_JOIN_ROLE_GRAPHQL[key] ?? "OTHER";
}

type SubmitCommunityJoinMutationData = {
  submitCommunityJoin: {
    success: boolean;
    message?: string | null;
    token?: string | null;
    user?: {
      id: string;
      full_name: string;
    } | null;
  };
};

export function JoinCommunityForm({ nextUrl }: { nextUrl?: string }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [banner, setBanner] = useState<"idle" | "sent">("idle");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [createCommunityRequest] = useMutation(SUBMIT_COMMUNITY_JOIN);

  const {
    register,
    handleSubmit,
    reset,
    clearErrors,
    setError,
    control,
    formState: { errors, isSubmitting },
  } = useForm<JoinCommunityFormValues>({
    resolver: yupResolver(joinCommunityFormSchema),
    defaultValues: joinCommunityFormDefaultValues,
  });

  const buttonLabel = useMemo(() => {
    if (isSubmitting) return "Submitting…";
    if (banner === "sent") return "Submitted";
    return "Join Canma";
  }, [isSubmitting, banner]);

  async function onSubmit(values: JoinCommunityFormValues) {
    clearErrors("root");

    try {
      const result = await createCommunityRequest({
        variables: {
          input: {
            full_name: values.fullName.trim(),
            email: values.email.trim(),
            phone: values.phone?.trim(),
            password: values.password,
            city: values.city?.trim(),
            role: mapCommunityJoinRole(values.role),
            interests: values.interests,
            portfolio_url: values.portfolioUrl?.trim(),
            message: values.message?.trim(),
            avatar_url: values.avatarUrl?.trim() || null,
          },
        },
      });

      const payload = (
        result.data as SubmitCommunityJoinMutationData | undefined
      )?.submitCommunityJoin;

      if (!payload?.success) {
        setError("root", {
          type: "server",
          message:
            payload?.message?.trim() ||
            "We couldn’t submit your request. Please try again.",
        });
        return;
      }

      if (payload.token && payload.user) {
        dispatch(
          setAuthSession({
            token: payload.token,
            user: {
              id: payload.user.id,
              full_name: payload.user.full_name,
              avatar_url: values.avatarUrl?.trim() || null,
            },
          }),
        );
        if (nextUrl) {
          router.push(nextUrl);
          return;
        }
      }

      reset(joinCommunityFormDefaultValues);
      setSuccessMessage(
        payload.message?.trim() ||
          "Thanks! Your request was submitted and is pending admin approval.",
      );
      setBanner("sent");
    } catch (err) {
      setError("root", {
        type: "server",
        message:
          err instanceof Error
            ? err.message
            : "Something went wrong. Please try again.",
      });
    }
  }

  return (
    <div className="container" data-aos="fade-up" data-aos-delay="100">
      <div className="row g-0 form-info-wrapper" data-aos="fade-up">
        <div className="col-lg-5">
          <div className="info-panel info-panel--image-blend">
            <img
              src={HOME_FEATURE_IMAGE}
              alt=""
              aria-hidden="true"
              className="panel-bg-image"
            />
            <div className="panel-bg-overlay" aria-hidden="true" />
            <div className="panel-content">
              <h3>Join the Canma community</h3>
              <p>
                Tell us what you do and what you want to collaborate on. We’ll
                reach out with next steps and ways to get involved.
              </p>

              <div
                className="panel-stats"
                data-aos="zoom-in"
                data-aos-delay="200"
              >
                <div className="row g-3">
                  <div className="col-4">
                    <div className="single-stat">
                      <strong>Network</strong>
                      <span>Creators</span>
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="single-stat">
                      <strong>Work</strong>
                      <span>Opportunities</span>
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="single-stat">
                      <strong>Learn</strong>
                      <span>Workshops</span>
                    </div>
                  </div>
                </div>
              </div>

              <div
                className="panel-social"
                data-aos="fade-up"
                data-aos-delay="250"
              >
                <span>Follow Canma</span>
                <div className="social-icons">
                  <a href="#" aria-label="Instagram">
                    <i className="bi bi-instagram" />
                  </a>
                  <a href="#" aria-label="Facebook">
                    <i className="bi bi-facebook" />
                  </a>
                  <a href="#" aria-label="Telegram">
                    <i className="bi bi-telegram" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-7">
          <div className="form-panel">
            <div className="form-intro">
              <i className="bi bi-people" />
              <h3>Community membership form</h3>
              <p>
                Share your details and interests. (We won’t publish this info—it
                is only for coordination.)
              </p>
            </div>

            <form
              className="php-email-form"
              noValidate
              onSubmit={handleSubmit(onSubmit)}
            >
              {/* Honeypot (spam protection) */}
              <input
                type="text"
                tabIndex={-1}
                autoComplete="off"
                data-lpignore="true"
                data-1p-ignore
                data-form-type="other"
                style={{
                  position: "absolute",
                  left: "-10000px",
                  top: "auto",
                  width: 1,
                  height: 1,
                  overflow: "hidden",
                }}
                aria-hidden="true"
                {...register(JOIN_COMMUNITY_HONEYPOT_FIELD)}
              />

              <div className="row g-3">
                <div className="col-sm-6">
                  <label
                    htmlFor="join-community-fullName"
                    className="form-label"
                  >
                    Full Name
                  </label>
                  <input
                    id="join-community-fullName"
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
                <div className="col-sm-6">
                  <label htmlFor="join-community-email" className="form-label">
                    Email Address
                  </label>
                  <input
                    id="join-community-email"
                    type="email"
                    autoComplete="email"
                    className={`form-control${errors.email ? " is-invalid" : ""}`}
                    placeholder="you@example.com"
                    {...register("email")}
                  />
                  {errors.email?.message ? (
                    <div className="invalid-feedback d-block">
                      {errors.email.message}
                    </div>
                  ) : null}
                </div>

                <div className="col-sm-6">
                  <label htmlFor="join-community-phone" className="form-label">
                    Phone
                  </label>
                  <input
                    id="join-community-phone"
                    type="tel"
                    autoComplete="tel"
                    className={`form-control${errors.phone ? " is-invalid" : ""}`}
                    placeholder="+251…"
                    {...register("phone")}
                  />
                  {errors.phone?.message ? (
                    <div className="invalid-feedback d-block">
                      {errors.phone.message}
                    </div>
                  ) : null}
                </div>
                <div className="col-sm-6">
                  <label htmlFor="join-community-city" className="form-label">
                    City (optional)
                  </label>
                  <input
                    id="join-community-city"
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

                <div className="col-sm-6">
                  <label
                    htmlFor="join-community-password"
                    className="form-label"
                  >
                    Password
                  </label>
                  <input
                    id="join-community-password"
                    type="password"
                    autoComplete="new-password"
                    className={`form-control${errors.password ? " is-invalid" : ""}`}
                    placeholder="At least 8 characters"
                    {...register("password")}
                  />
                  {errors.password?.message ? (
                    <div className="invalid-feedback d-block">
                      {errors.password.message}
                    </div>
                  ) : null}
                </div>
                <div className="col-sm-6">
                  <label
                    htmlFor="join-community-confirmPassword"
                    className="form-label"
                  >
                    Confirm password
                  </label>
                  <input
                    id="join-community-confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    className={`form-control${errors.confirmPassword ? " is-invalid" : ""}`}
                    placeholder="Repeat password"
                    {...register("confirmPassword")}
                  />
                  {errors.confirmPassword?.message ? (
                    <div className="invalid-feedback d-block">
                      {errors.confirmPassword.message}
                    </div>
                  ) : null}
                </div>

                <div className="col-12">
                  <Controller
                    name="avatarUrl"
                    control={control}
                    render={({ field }) => (
                      <ProfilePictureUpload
                        value={field.value || null}
                        onChange={(url) => field.onChange(url ?? "")}
                        disabled={isSubmitting || banner === "sent"}
                      />
                    )}
                  />
                </div>

                <div className="col-12">
                  <label htmlFor="join-community-role" className="form-label">
                    You are joining as
                  </label>
                  <select
                    id="join-community-role"
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
                    control={control}
                    error={errors.interests}
                  />
                </div>

                <div className="col-12">
                  <label
                    htmlFor="join-community-portfolioUrl"
                    className="form-label"
                  >
                    Portfolio / social link (optional)
                  </label>
                  <input
                    id="join-community-portfolioUrl"
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
                    htmlFor="join-community-message"
                    className="form-label"
                  >
                    Message (optional)
                  </label>
                  <textarea
                    id="join-community-message"
                    rows={4}
                    className={`form-control${errors.message ? " is-invalid" : ""}`}
                    placeholder="Tell us what you want to collaborate on…"
                    {...register("message")}
                  />
                  {errors.message?.message ? (
                    <div className="invalid-feedback d-block">
                      {errors.message.message}
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="my-3">
                <div
                  className="loading"
                  style={{ display: isSubmitting ? "block" : "none" }}
                >
                  Loading
                </div>
                <div
                  className="error-message"
                  style={{ display: errors.root?.message ? "block" : "none" }}
                >
                  {errors.root?.message}
                </div>
                <div
                  className="sent-message"
                  style={{ display: banner === "sent" ? "block" : "none" }}
                >
                  {successMessage ?? "Thanks! Your request was submitted."}
                </div>
              </div>

              <button
                type="submit"
                className="dispatch-btn"
                disabled={isSubmitting || banner === "sent"}
              >
                <i className="bi bi-arrow-right-circle-fill" />
                <span>{buttonLabel}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
