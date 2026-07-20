"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@apollo/client/react";
import { useEffect } from "react";

import { ME_QUERY } from "@/lib/election-graphql";
import { PAYMENT_SETTINGS_QUERY } from "@/lib/events-graphql";
import {
  INITIATE_JOB_POSTING_PAYMENT_MUTATION,
  MY_JOB_APPLICATIONS_QUERY,
  MY_POSTED_JOBS_QUERY,
  redirectToChapaCheckout,
} from "@/lib/jobs-graphql";
import { formatJobsPrice } from "@/lib/jobs-pricing-config";
import type { MeQuery } from "@/types/election-apollo";

type PostedJob = {
  id: string;
  title: string;
  status: string;
  application_count: number;
  posting_payment_status: "FREE" | "PENDING" | "CONFIRMED";
  posting_fee_amount: string;
  posting_fee_currency: string;
};

type PostedData = {
  myPostedJobs: PostedJob[];
};

type AppsMineData = {
  myJobApplications: {
    id: string;
    createdAt: string;
    job: { id: string; title: string };
  }[];
};

export default function JobsMinePage() {
  const router = useRouter();
  const { data: meData, loading: meLoading } = useQuery<MeQuery>(ME_QUERY);
  const me = meData?.me;
  const { data: paymentData } = useQuery<{
    paymentSettings: { chapaEnabled: boolean };
  }>(PAYMENT_SETTINGS_QUERY);
  const chapaEnabled = paymentData?.paymentSettings.chapaEnabled === true;
  const {
    data: posted,
    loading: pLoading,
    refetch,
  } = useQuery<PostedData>(MY_POSTED_JOBS_QUERY, { skip: !me });
  const { data: apps, loading: aLoading } = useQuery<AppsMineData>(
    MY_JOB_APPLICATIONS_QUERY,
    { skip: !me },
  );
  const [initiatePayment, { loading: paying }] = useMutation<{
    initiateJobPostingPayment: {
      status: string;
      message: string;
      checkout_url?: string | null;
    };
  }>(INITIATE_JOB_POSTING_PAYMENT_MUTATION);

  useEffect(() => {
    if (!meLoading && !me) {
      router.replace(
        `/election/login?next=${encodeURIComponent("/jobs/mine")}`,
      );
    }
  }, [me, meLoading, router]);

  async function payForJob(jobId: string) {
    try {
      const { data } = await initiatePayment({ variables: { job_id: jobId } });
      const payload = data?.initiateJobPostingPayment;
      if (!redirectToChapaCheckout(payload)) {
        throw new Error(payload?.message || "Could not start checkout.");
      }
    } catch (err: unknown) {
      window.alert(
        err instanceof Error ? err.message : "Could not start payment.",
      );
    }
  }

  if (meLoading || !me) {
    return (
      <section className="section py-5 text-center">
        <p className="text-muted">Loading dashboard…</p>
      </section>
    );
  }

  const myJobs = posted?.myPostedJobs ?? [];
  const myApps = apps?.myJobApplications ?? [];

  return (
    <section className="services section">
      <div className="container section-title">
        <h1>Production jobs dashboard</h1>
        <p className="mb-4">
          <strong>{me.full_name}</strong> · Postings you manage · Applications
          you have sent
        </p>
        <div className="d-flex flex-wrap gap-2">
          <Link className="btn btn-accent btn-sm" href="/jobs/new">
            New posting
          </Link>
          <Link className="btn btn-outline-secondary btn-sm" href="/jobs">
            Browse board
          </Link>
        </div>
      </div>

      <div className="container pb-5">
        <div className="row gy-5">
          <div className="col-lg-6">
            <h2 className="h4 mb-3">My postings</h2>
            {!pLoading && myJobs.length === 0 ? (
              <p className="text-muted">You do not have any postings yet.</p>
            ) : null}
            <ul className="list-unstyled d-flex flex-column gap-3">
              {myJobs.map((j) => {
                const pendingPayment = j.posting_payment_status === "PENDING";
                const fee = Number.parseFloat(j.posting_fee_amount);
                const feeLabel = Number.isFinite(fee)
                  ? formatJobsPrice(fee)
                  : `${j.posting_fee_amount} ${j.posting_fee_currency}`;

                return (
                  <li key={j.id} className="offering-block p-4">
                    <div className="d-flex justify-content-between flex-wrap gap-2 mb-2">
                      <strong>{j.title}</strong>
                      <span className="small text-muted text-uppercase">
                        {j.status}
                      </span>
                    </div>
                    {pendingPayment ? (
                      <p className="small mb-2">
                        <span className="badge text-bg-warning">
                          Awaiting payment
                        </span>
                        <span className="text-muted ms-2">
                          {feeLabel} to publish on the board
                        </span>
                      </p>
                    ) : (
                      <p className="small mb-3">
                        {j.application_count} applicant
                        {j.application_count === 1 ? "" : "s"}
                      </p>
                    )}
                    <div className="d-flex flex-wrap gap-2">
                      {pendingPayment && chapaEnabled ? (
                        <button
                          type="button"
                          className="btn btn-sm btn-accent"
                          disabled={paying}
                          onClick={() => void payForJob(j.id)}
                        >
                          {paying ? "Starting…" : "Pay with Chapa"}
                        </button>
                      ) : null}
                      {!pendingPayment ? (
                        <>
                          <Link
                            className="btn btn-sm btn-accent"
                            href={`/jobs/${j.id}`}
                          >
                            View
                          </Link>
                          <Link
                            className="btn btn-sm btn-outline-primary"
                            href={`/jobs/${j.id}/applicants`}
                          >
                            Applicants
                          </Link>
                        </>
                      ) : (
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => void refetch()}
                        >
                          Refresh status
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="col-lg-6">
            <h2 className="h4 mb-3">Applications I submitted</h2>
            {!aLoading && myApps.length === 0 ? (
              <p className="text-muted">
                You have not applied to any open roles yet.
              </p>
            ) : null}
            <ul className="list-unstyled d-flex flex-column gap-3">
              {myApps.map((a) => (
                <li key={a.id} className="offering-block p-4">
                  <strong>{a.job.title}</strong>
                  <p className="small text-muted mb-2">
                    Submitted {new Date(a.createdAt).toLocaleString()}
                  </p>
                  <Link
                    className="btn btn-sm btn-outline-secondary"
                    href={`/jobs/${a.job.id}`}
                  >
                    Open role
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
