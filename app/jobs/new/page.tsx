"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@apollo/client/react";
import { useEffect, useState } from "react";

import { ME_QUERY } from "@/lib/election-graphql";
import type { MeQuery } from "@/types/election-apollo";
import { CREATE_PRODUCTION_JOB_MUTATION } from "@/lib/jobs-graphql";

type CreateJobData = {
  createProductionJob: { id: string };
};

export default function NewProductionJobPage() {
  const router = useRouter();
  const { data: meData, loading: meLoading } = useQuery<MeQuery>(ME_QUERY);
  const me = meData?.me;
  const [createJob, { loading }] =
    useMutation<CreateJobData>(CREATE_PRODUCTION_JOB_MUTATION);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [modality, setModality] = useState("");
  const [location, setLocation] = useState("");
  const [roleTag, setRoleTag] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!meLoading && !me) {
      router.replace(
        `/election/login?next=${encodeURIComponent("/jobs/new")}`
      );
    }
  }, [me, meLoading, router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const res = await createJob({
        variables: {
          input: {
            title: title.trim(),
            description: description.trim(),
            modality: modality.trim() || null,
            location: location.trim() || null,
            role_tag: roleTag.trim() || null,
          },
        },
      });
      const id = res.data?.createProductionJob?.id;
      if (id) router.push(`/jobs/${id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not create posting.");
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

  return (
    <section className="contact section">
      <div className="container section-title" data-aos="fade-up">
        <h1>Post a production role</h1>
        <p>
          Signed in as <strong>{me.full_name}</strong>. Listings go live as{" "}
          <strong>open</strong> roles—close them from your dashboard or applicant view
          when you are done hiring.
        </p>
        <Link href="/jobs" className="link-body-emphasis">
          ← Back to job center
        </Link>
      </div>

      <div className="container" data-aos="fade-up" data-aos-delay="100">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="form-panel">
              <form className="php-email-form" onSubmit={(e) => void onSubmit(e)}>
                <div className="mb-3">
                  <label className="form-label" htmlFor="title">
                    Title
                  </label>
                  <input
                    id="title"
                    className="form-control"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. 1st AC — commercial (4-week block)"
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
                    placeholder="Scope, kit expectations, call times, rate band, and how you want to be contacted…"
                    required
                  />
                </div>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label" htmlFor="tag">
                      Lane tag
                    </label>
                    <input
                      id="tag"
                      className="form-control"
                      value={roleTag}
                      onChange={(e) => setRoleTag(e.target.value)}
                      placeholder="On set · Post · Hybrid"
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label" htmlFor="modality">
                      Modality
                    </label>
                    <input
                      id="modality"
                      className="form-control"
                      value={modality}
                      onChange={(e) => setModality(e.target.value)}
                      placeholder="Remote-first, hybrid…"
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label" htmlFor="loc">
                      Location
                    </label>
                    <input
                      id="loc"
                      className="form-control"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Addis Ababa, etc."
                    />
                  </div>
                </div>
                {error ?
                  <div className="error-message d-block mt-3">{error}</div>
                : null}
                <button type="submit" className="dispatch-btn mt-4" disabled={loading}>
                  <i className="bi bi-check2-circle" />
                  <span>{loading ? "Publishing…" : "Publish open role"}</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
