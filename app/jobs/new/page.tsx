"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@apollo/client/react";
import { useEffect, useState } from "react";

import { JobSkillsInput } from "@/components/jobs/JobSkillsInput";
import { ME_QUERY } from "@/lib/election-graphql";
import { apolloErrorMessage } from "@/lib/apollo-error";
import { CREATE_PRODUCTION_JOB_MUTATION } from "@/lib/jobs-graphql";
import {
  JOB_EMPLOYMENT_CATEGORY_LABELS,
  JOB_POSTING_TYPES,
  JOB_PRODUCTION_KIND_LABELS,
  JOB_WORK_TYPE_LABELS,
  type JobPostingTypeId,
} from "@/lib/jobs-filter-config";
import type { MeQuery } from "@/types/election-apollo";

const JOB_SKILL_SUGGESTIONS = [
  ...JOB_WORK_TYPE_LABELS.slice(0, 8),
  "DaVinci Resolve",
  "Premiere Pro",
  "After Effects",
  "Lighting",
  "Sound",
  "Drone",
];

type CreateJobData = {
  createProductionJob: {
    status: string;
    message: string;
    checkout_url?: string | null;
    tx_ref?: string | null;
    job: { id: string; posting_payment_status: string };
  };
};

export default function NewProductionJobPage() {
  const router = useRouter();
  const { data: meData, loading: meLoading } = useQuery<MeQuery>(ME_QUERY);
  const me = meData?.me;
  const [createJob, { loading }] = useMutation<CreateJobData>(
    CREATE_PRODUCTION_JOB_MUTATION,
  );
  const [postingType, setPostingType] = useState<JobPostingTypeId>("ROLE");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [modality, setModality] = useState("");
  const [location, setLocation] = useState("");
  const [roleTag, setRoleTag] = useState("");
  const [productionKind, setProductionKind] = useState("");
  const [startsOn, setStartsOn] = useState("");
  const [endsOn, setEndsOn] = useState("");
  const [budgetType, setBudgetType] = useState("");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [openPositions, setOpenPositions] = useState("1");
  const [error, setError] = useState<string | null>(null);

  const isShootCall = postingType === "SHOOT_CALL";
  const isQuickGig = postingType === "QUICK_GIG";

  useEffect(() => {
    if (!meLoading && !me) {
      router.replace(
        `/community/join?mode=signin&next=${encodeURIComponent("/jobs/new")}`,
      );
    }
  }, [me, meLoading, router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const positions = Number.parseInt(openPositions.trim(), 10);
      if (!Number.isInteger(positions) || positions < 1) {
        throw new Error("Open positions must be a whole number of at least 1.");
      }
      if (isShootCall && !productionKind.trim()) {
        throw new Error("Choose a production kind for this shoot call.");
      }
      if (isQuickGig && !startsOn.trim()) {
        throw new Error("Start date is required for quick gigs.");
      }
      if (isQuickGig && !location.trim()) {
        throw new Error("Location is required for quick gigs.");
      }

      const res = await createJob({
        variables: {
          input: {
            title: title.trim(),
            description: description.trim(),
            posting_type: postingType,
            production_kind: productionKind.trim() || null,
            starts_on: startsOn.trim() || null,
            ends_on: endsOn.trim() || null,
            modality: modality.trim() || null,
            location: location.trim() || null,
            role_tag: roleTag.trim() || null,
            open_positions: positions,
            skills: skills.length > 0 ? skills : null,
            budget_type: budgetType.trim() || null,
            budget_min: budgetMin.trim() || null,
            budget_max: budgetMax.trim() || null,
            budget_currency: "ETB",
          },
        },
      });
      const payload = res.data?.createProductionJob;
      if (!payload || payload.status !== "success") {
        throw new Error(payload?.message || "Could not create posting.");
      }

      router.push(
        `/jobs/mine?submitted=1&msg=${encodeURIComponent(payload.message)}`,
      );
    } catch (err: unknown) {
      setError(apolloErrorMessage(err, "Could not create posting."));
    }
  }

  if (meLoading || !me) {
    return (
      <section className="contact section">
        <div className="container text-center py-5">
          <p className="text-muted mb-0">Loading…</p>
        </div>
      </section>
    );
  }

  const titlePlaceholder = isQuickGig
    ? "e.g. Camera operator — Bole, Saturday"
    : isShootCall
      ? "e.g. Gaffer needed — commercial shoot"
      : "e.g. 1st AC — commercial (4-week block)";

  const descriptionPlaceholder = isQuickGig
    ? "What you need, call time, kit, day rate, and how to confirm…"
    : isShootCall
      ? "Production overview, shoot days, call times, kit, and how creatives should apply…"
      : "Scope, kit expectations, call times, rate band, and how you want to be contacted…";

  return (
    <section className="contact section">
      <div className="container section-title" data-aos="fade-up">
        <h1>Post on Creative Jobs</h1>
        <p>
          Signed in as <strong>{me.full_name}</strong>. Submissions go to admin
          review first. After approval, choose your posting package and optional
          boosts at checkout.
        </p>
        <p className="jobs-page-links">
          <Link href="/jobs/pricing">Employer pricing</Link>
          <span className="jobs-page-links__sep" aria-hidden>
            ·
          </span>
          <Link href="/jobs">Back to job center</Link>
        </p>
      </div>

      <div className="container" data-aos="fade-up" data-aos-delay="100">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="form-panel">
              <form
                className="php-email-form"
                onSubmit={(e) => void onSubmit(e)}
              >
                <fieldset className="jobs-posting-type mb-4">
                  <legend className="form-label mb-2">
                    What are you posting?
                  </legend>
                  <div className="jobs-posting-type__grid" role="radiogroup">
                    {JOB_POSTING_TYPES.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        role="radio"
                        aria-checked={postingType === item.id}
                        className={`jobs-posting-type__card${postingType === item.id ? " is-active" : ""}`}
                        onClick={() => setPostingType(item.id)}
                      >
                        <strong>{item.label}</strong>
                        <span>{item.description}</span>
                      </button>
                    ))}
                  </div>
                </fieldset>

                <div className="mb-3">
                  <label className="form-label" htmlFor="title">
                    Title
                  </label>
                  <input
                    id="title"
                    className="form-control"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={titlePlaceholder}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label" htmlFor="desc">
                    Description
                  </label>
                  <textarea
                    id="desc"
                    className="form-control"
                    rows={8}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={descriptionPlaceholder}
                    required
                  />
                </div>
                <div className="row g-3">
                  {isShootCall ? (
                    <div className="col-md-6">
                      <label className="form-label" htmlFor="production-kind">
                        Production kind
                      </label>
                      <select
                        id="production-kind"
                        className="form-select"
                        value={productionKind}
                        onChange={(e) => setProductionKind(e.target.value)}
                        required
                      >
                        <option value="">Select…</option>
                        {JOB_PRODUCTION_KIND_LABELS.map((label) => (
                          <option key={label} value={label}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : null}

                  {!isQuickGig ? (
                    <div className="col-md-6">
                      <label className="form-label" htmlFor="category">
                        Category
                      </label>
                      <select
                        id="category"
                        className="form-select"
                        value={modality}
                        onChange={(e) => setModality(e.target.value)}
                      >
                        <option value="">Select employment type…</option>
                        {JOB_EMPLOYMENT_CATEGORY_LABELS.map((label) => (
                          <option key={label} value={label}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : null}

                  <div className="col-md-6">
                    <label className="form-label" htmlFor="work-type">
                      {isQuickGig || isShootCall ? "Craft / role" : "Work type"}
                    </label>
                    <select
                      id="work-type"
                      className="form-select"
                      value={roleTag}
                      onChange={(e) => setRoleTag(e.target.value)}
                    >
                      <option value="">Select creative role…</option>
                      {JOB_WORK_TYPE_LABELS.map((label) => (
                        <option key={label} value={label}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label" htmlFor="open-positions">
                      Open positions
                    </label>
                    <input
                      id="open-positions"
                      type="number"
                      min={1}
                      max={999}
                      step={1}
                      className="form-control"
                      value={openPositions}
                      onChange={(e) => setOpenPositions(e.target.value)}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label" htmlFor="starts-on">
                      {isQuickGig ? "Date needed" : "Start date"}
                      {isQuickGig ? (
                        <span className="text-danger"> *</span>
                      ) : (
                        <span className="text-muted"> (optional)</span>
                      )}
                    </label>
                    <input
                      id="starts-on"
                      type="date"
                      className="form-control"
                      value={startsOn}
                      onChange={(e) => setStartsOn(e.target.value)}
                      required={isQuickGig}
                    />
                  </div>
                  {(isShootCall || isQuickGig) && (
                    <div className="col-md-6">
                      <label className="form-label" htmlFor="ends-on">
                        End date
                        <span className="text-muted"> (optional)</span>
                      </label>
                      <input
                        id="ends-on"
                        type="date"
                        className="form-control"
                        value={endsOn}
                        onChange={(e) => setEndsOn(e.target.value)}
                      />
                    </div>
                  )}

                  <div className="col-12">
                    <label className="form-label" htmlFor="loc">
                      Location
                      {isQuickGig ? (
                        <span className="text-danger"> *</span>
                      ) : null}
                    </label>
                    <input
                      id="loc"
                      className="form-control"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder={
                        isQuickGig
                          ? "Neighborhood or area (e.g. Bole, Addis Ababa)"
                          : "Addis Ababa, etc."
                      }
                      required={isQuickGig}
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label" htmlFor="budget-type">
                      Budget type
                    </label>
                    <select
                      id="budget-type"
                      className="form-select"
                      value={budgetType}
                      onChange={(e) => setBudgetType(e.target.value)}
                    >
                      <option value="">Select budget type…</option>
                      <option value="Fixed">Fixed price</option>
                      <option value="Hourly">Hourly</option>
                      <option value="Day rate">Day rate</option>
                      <option value="Negotiable">Negotiable</option>
                    </select>
                  </div>
                  {budgetType && budgetType !== "Negotiable" ? (
                    <div className="col-md-6">
                      <label className="form-label" htmlFor="budget-min">
                        {budgetType === "Hourly"
                          ? "Rate min (ETB/hr)"
                          : budgetType === "Day rate"
                            ? "Day rate min (ETB)"
                            : "Budget min (ETB)"}
                      </label>
                      <input
                        id="budget-min"
                        type="number"
                        min="0"
                        step="0.01"
                        className="form-control"
                        value={budgetMin}
                        onChange={(e) => setBudgetMin(e.target.value)}
                        placeholder="0"
                      />
                    </div>
                  ) : null}
                  {budgetType === "Fixed" ? (
                    <div className="col-md-6">
                      <label className="form-label" htmlFor="budget-max">
                        Budget max (ETB)
                      </label>
                      <input
                        id="budget-max"
                        type="number"
                        min="0"
                        step="0.01"
                        className="form-control"
                        value={budgetMax}
                        onChange={(e) => setBudgetMax(e.target.value)}
                        placeholder="Optional"
                      />
                    </div>
                  ) : null}
                  <div className="col-12">
                    <JobSkillsInput
                      value={skills}
                      onChange={setSkills}
                      suggestions={JOB_SKILL_SUGGESTIONS}
                    />
                  </div>
                </div>

                <div className="info-box mt-4 mb-0">
                  <p className="mb-0 small">
                    Posting package and optional boosts are chosen at checkout
                    after admin approval. See{" "}
                    <Link href="/jobs/pricing" className="link-body-emphasis">
                      employer pricing
                    </Link>{" "}
                    for plan details.
                  </p>
                </div>

                {error ? (
                  <div className="error-message d-block mt-3">{error}</div>
                ) : null}
                <button
                  type="submit"
                  className="dispatch-btn mt-4"
                  disabled={loading}
                >
                  <i className="bi bi-check2-circle" />
                  <span>{loading ? "Submitting…" : "Submit for review"}</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
