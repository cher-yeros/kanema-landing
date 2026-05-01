"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery } from "@apollo/client/react";
import { useEffect, useState } from "react";

import { ME_QUERY } from "@/lib/election-graphql";
import type { MeQuery } from "@/types/election-apollo";
import {
  JOB_APPLICANTS_QUERY,
  PRODUCTION_JOB_QUERY,
  UPDATE_MY_PRODUCTION_JOB_MUTATION,
} from "@/lib/jobs-graphql";

type JobApplicantsRows = {
  jobApplicants: {
    id: string;
    job_id: string;
    applicant_user_id: string;
    cover_message: string | null;
    portfolio_links: string | null;
    createdAt: string;
    applicant: {
      id: string;
      full_name: string;
      email: string;
      phone: string;
      role: string;
      is_verified: boolean;
    };
  }[];
};

type ProdJobQr = {
  productionJob: {
    id: string;
    title: string;
    status: string;
    poster: { id: string; full_name: string };
  } | null;
};

export default function JobApplicantsPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";
  const router = useRouter();
  const { data: meData, loading: meLoading } = useQuery<MeQuery>(ME_QUERY);
  const me = meData?.me;
  const { data: jobData, loading: jobLoading } = useQuery<ProdJobQr>(PRODUCTION_JOB_QUERY, {
    variables: { id },
    skip: !id,
  });
  const job = jobData?.productionJob;
  const { data, loading, error, refetch } = useQuery<JobApplicantsRows>(JOB_APPLICANTS_QUERY, {
    variables: { job_id: id },
    skip: !id || !me,
  });
  const [updateJob, { loading: closing }] = useMutation(
    UPDATE_MY_PRODUCTION_JOB_MUTATION
  );
  const [closeMsg, setCloseMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!meLoading && !me) {
      router.replace(
        `/election/login?next=${encodeURIComponent(`/jobs/${id}/applicants`)}`
      );
    }
  }, [me, meLoading, router, id]);

  const isEmployer = Boolean(me && job && me.id === job.poster.id);

  async function closeListing() {
    setCloseMsg(null);
    try {
      await updateJob({
        variables: { input: { id, status: "CLOSED" } },
      });
      setCloseMsg("Role closed to new applicants.");
      void refetch();
    } catch (e: unknown) {
      setCloseMsg(e instanceof Error ? e.message : "Could not update role.");
    }
  }

  if (meLoading || !me || jobLoading) {
    return (
      <section className="section py-5 text-center">
        <p className="text-muted">Loading…</p>
      </section>
    );
  }

  if (!job) {
    return (
      <section className="services section py-5">
        <div className="container">
          <p className="text-muted">This listing could not be loaded.</p>
          <Link href="/jobs">← Job center</Link>
        </div>
      </section>
    );
  }

  const rows = data?.jobApplicants ?? [];
  const errText = error?.message;

  return (
    <section className="services section">
      <div className="container">
        <Link href={`/jobs/${id}`} className="explore-btn d-inline-flex mb-4">
          <i className="bi bi-arrow-left-short" />
          Back to role
        </Link>

        <h1 className="h3 mb-2">Applicants</h1>
        {job ?
          <p className="text-muted mb-4">{job.title}</p>
        : null}

        {!isEmployer ?
          <div className="alert alert-warning">
            {errText ||
              "Only the member who posted this role (or an administrator) can view applicants."}
          </div>
        : null}

        {isEmployer ?
          <div className="d-flex flex-wrap gap-2 mb-4">
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              disabled={closing || job?.status !== "OPEN"}
              onClick={() => void closeListing()}
            >
              {closing ? "Updating…" : "Close to new applications"}
            </button>
            {closeMsg ?
              <span className="small text-muted align-self-center">{closeMsg}</span>
            : null}
          </div>
        : null}

        {isEmployer && !loading && rows.length === 0 ?
          <p className="text-muted">No applications yet.</p>
        : null}

        {isEmployer && rows.length > 0 ?
          <div className="table-responsive">
            <table className="table table-bordered table-sm align-middle">
              <thead>
                <tr>
                  <th>Applicant</th>
                  <th>Contact</th>
                  <th>Message</th>
                  <th>Portfolio</th>
                  <th>Applied</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <strong>{r.applicant.full_name}</strong>
                      <div className="small text-muted">
                        {r.applicant.is_verified ? "Verified" : "Unverified"}
                      </div>
                    </td>
                    <td className="small">
                      <div>{r.applicant.email}</div>
                      <div>{r.applicant.phone}</div>
                    </td>
                    <td className="small" style={{ maxWidth: 240 }}>
                      {r.cover_message || "—"}
                    </td>
                    <td className="small" style={{ maxWidth: 200 }}>
                      {r.portfolio_links || "—"}
                    </td>
                    <td className="small text-nowrap">
                      {new Date(r.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        : null}
      </div>
    </section>
  );
}
