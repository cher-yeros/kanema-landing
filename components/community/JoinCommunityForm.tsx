"use client";

import { useMutation } from "@apollo/client/react";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import { SUBMIT_COMMUNITY_JOIN } from "@/lib/graphql/community-join";

import {
  COMMUNITY_JOIN_INTEREST_OPTIONS,
  JOIN_COMMUNITY_HONEYPOT_FIELD,
  joinCommunityFormDefaultValues,
  joinCommunityFormSchema,
  type JoinCommunityFormValues,
} from "./join-community-form-schema";

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
  };
};

export function JoinCommunityForm() {
  const [banner, setBanner] = useState<"idle" | "sent">("idle");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [createCommunityRequest] = useMutation(SUBMIT_COMMUNITY_JOIN);

  const {
    register,
    handleSubmit,
    reset,
    clearErrors,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<JoinCommunityFormValues>({
    resolver: yupResolver(joinCommunityFormSchema),
    defaultValues: joinCommunityFormDefaultValues,
  });

  const buttonLabel = useMemo(() => {
    if (isSubmitting) return "Submitting…";
    if (banner === "sent") return "Submitted";
    return "Join Kanema";
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
            city: values.city?.trim(),
            role: mapCommunityJoinRole(values.role),
            interests: values.interests,
            portfolio_url: values.portfolioUrl?.trim(),
            message: values.message?.trim(),
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

      reset(joinCommunityFormDefaultValues);
      setSuccessMessage(
        payload.message?.trim() ||
          "Thanks! Your request was submitted.",
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
          <div className="info-panel">
            <div className="panel-content">
              <h3>Join the Kanema community</h3>
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
                <span>Follow Kanema</span>
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
                    Phone (optional)
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
                  <span className="form-label d-block">Interests</span>
                  <div className="row g-2">
                    {COMMUNITY_JOIN_INTEREST_OPTIONS.map((opt) => (
                      <div className="col-sm-6" key={opt.id}>
                        <label className="d-flex align-items-center gap-2 mb-0">
                          <input
                            type="checkbox"
                            value={opt.id}
                            {...register("interests")}
                          />
                          <span>{opt.label}</span>
                        </label>
                      </div>
                    ))}
                  </div>
                  {errors.interests?.message ? (
                    <div className="invalid-feedback d-block mt-2">
                      {errors.interests.message}
                    </div>
                  ) : null}
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
