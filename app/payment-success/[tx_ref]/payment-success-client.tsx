"use client";

import Link from "next/link";
import { useQuery } from "@apollo/client/react";
import { useCallback, useEffect, useState } from "react";

import { MY_EVENT_REGISTRATION_BY_TX_REF_QUERY } from "@/lib/events-graphql";
import {
  MY_EMPLOYER_JOB_PAYMENT_BY_TX_REF_QUERY,
  MY_PRODUCTION_JOB_BY_TX_REF_QUERY,
} from "@/lib/jobs-graphql";
import { MY_MARKETPLACE_PAYMENT_BY_TX_REF_QUERY } from "@/lib/marketplace-graphql";

type VerifyResponse = {
  status: "success" | "error";
  message?: string;
  payment_status?: "FREE" | "PENDING" | "CONFIRMED";
  payment_kind?: "event" | "job" | "marketplace" | "employer_job";
  event?: { slug: string; title: string } | null;
  job?: { id: string; title: string } | null;
  marketplace?: {
    label: string;
    amount: string;
    currency: string;
    product_type: string;
  } | null;
  employer_job?: {
    label: string;
    amount: string;
    currency: string;
    product_type: string;
    product_id: string;
  } | null;
};

type PageState = "loading" | "success" | "pending" | "error";

export function PaymentSuccessClient({ txRef }: { txRef: string }) {
  const [pageState, setPageState] = useState<PageState>("loading");
  const [verifyData, setVerifyData] = useState<VerifyResponse | null>(null);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  const { data: regData, refetch: refetchEvent } = useQuery<{
    myEventRegistrationByTxRef: {
      ticket_code: string;
      payment_status: "FREE" | "PENDING" | "CONFIRMED";
      event: { slug: string; title: string } | null;
    } | null;
  }>(MY_EVENT_REGISTRATION_BY_TX_REF_QUERY, {
    variables: { tx_ref: txRef },
    fetchPolicy: "network-only",
    skip: !txRef,
  });

  const { data: jobData, refetch: refetchJob } = useQuery<{
    myProductionJobByTxRef: {
      id: string;
      title: string;
      posting_payment_status: "FREE" | "PENDING" | "CONFIRMED";
    } | null;
  }>(MY_PRODUCTION_JOB_BY_TX_REF_QUERY, {
    variables: { tx_ref: txRef },
    fetchPolicy: "network-only",
    skip: !txRef,
  });

  const { data: marketplaceData, refetch: refetchMarketplace } = useQuery<{
    myMarketplacePaymentByTxRef: {
      product_label: string;
      amount: string;
      currency: string;
      payment_status: "PENDING" | "CONFIRMED";
      product_type: string;
    } | null;
  }>(MY_MARKETPLACE_PAYMENT_BY_TX_REF_QUERY, {
    variables: { tx_ref: txRef },
    fetchPolicy: "network-only",
    skip: !txRef,
  });

  const { data: employerJobData, refetch: refetchEmployerJob } = useQuery<{
    myEmployerJobPaymentByTxRef: {
      product_label: string;
      product_type: string;
      product_id: string;
      amount: string;
      currency: string;
      payment_status: "PENDING" | "CONFIRMED";
    } | null;
  }>(MY_EMPLOYER_JOB_PAYMENT_BY_TX_REF_QUERY, {
    variables: { tx_ref: txRef },
    fetchPolicy: "network-only",
    skip: !txRef,
  });

  const runVerify = useCallback(async () => {
    if (!txRef) return null;
    try {
      const res = await fetch(
        `/api/payment/verify/${encodeURIComponent(txRef)}`,
        { method: "GET", cache: "no-store" },
      );
      const json = (await res.json()) as VerifyResponse;
      if (res.ok && json.status === "success") {
        setVerifyData(json);
        setVerifyError(null);
        return json;
      }
      setVerifyError(json.message || "Payment could not be verified yet.");
      return null;
    } catch {
      setVerifyError("Could not reach the payment server. Try again shortly.");
      return null;
    }
  }, [txRef]);

  useEffect(() => {
    let cancelled = false;
    let attempts = 0;
    const maxAttempts = 8;

    async function confirm() {
      const result = await runVerify();
      if (cancelled) return;

      if (result?.payment_status === "CONFIRMED") {
        setPageState("success");
        void refetchEvent();
        void refetchJob();
        void refetchMarketplace();
        void refetchEmployerJob();
        return;
      }

      if (result?.payment_status === "PENDING" || !result) {
        setPageState("pending");
        if (attempts < maxAttempts) {
          attempts += 1;
          window.setTimeout(() => void confirm(), 3000);
        } else if (!result) {
          setPageState("error");
        }
        return;
      }

      setPageState("success");
      void refetchEvent();
      void refetchJob();
      void refetchMarketplace();
      void refetchEmployerJob();
    }

    void confirm();

    return () => {
      cancelled = true;
    };
  }, [runVerify, refetchEvent, refetchJob, refetchMarketplace, refetchEmployerJob]);

  const registration = regData?.myEventRegistrationByTxRef;
  const jobPosting = jobData?.myProductionJobByTxRef;
  const marketplacePayment = marketplaceData?.myMarketplacePaymentByTxRef;
  const employerJobPayment = employerJobData?.myEmployerJobPaymentByTxRef;
  const paymentKind =
    verifyData?.payment_kind ??
    (employerJobPayment
      ? "employer_job"
      : marketplacePayment
        ? "marketplace"
        : jobPosting
          ? "job"
          : registration
            ? "event"
            : null);
  const event = verifyData?.event ?? registration?.event ?? null;
  const job =
    verifyData?.job ??
    (jobPosting ? { id: jobPosting.id, title: jobPosting.title } : null);
  const marketplace =
    verifyData?.marketplace ??
    (marketplacePayment
      ? {
          label: marketplacePayment.product_label,
          amount: marketplacePayment.amount,
          currency: marketplacePayment.currency,
          product_type: marketplacePayment.product_type,
        }
      : null);
  const employerJob =
    verifyData?.employer_job ??
    (employerJobPayment
      ? {
          label: employerJobPayment.product_label,
          amount: employerJobPayment.amount,
          currency: employerJobPayment.currency,
          product_type: employerJobPayment.product_type,
          product_id: employerJobPayment.product_id,
        }
      : null);
  const confirmed =
    pageState === "success" ||
    verifyData?.payment_status === "CONFIRMED" ||
    registration?.payment_status === "CONFIRMED" ||
    jobPosting?.posting_payment_status === "CONFIRMED" ||
    marketplacePayment?.payment_status === "CONFIRMED" ||
    employerJobPayment?.payment_status === "CONFIRMED";
  const pending = pageState === "pending" && !confirmed;
  const failed = pageState === "error";

  const cardClass = confirmed
    ? "payment-status-card--success"
    : pending
      ? "payment-status-card--pending"
      : failed
        ? "payment-status-card--error"
        : "payment-status-card--pending";

  const iconClass = confirmed
    ? "payment-status-card__icon--success"
    : pending
      ? "payment-status-card__icon--pending"
      : "payment-status-card__icon--error";

  const successMessage =
    paymentKind === "employer_job" && employerJob
      ? employerJob.product_type === "SUBSCRIPTION"
        ? `Thank you — your ${employerJob.label} is active. Included job posts apply automatically when you publish roles.`
        : `Thank you — payment for ${employerJob.label} is confirmed.`
      : paymentKind === "marketplace" && marketplace
      ? `Thank you — payment for ${marketplace.label} is confirmed. You can start using your marketplace benefits right away.`
      : paymentKind === "job" && job
        ? `Thank you — payment for "${job.title}" is confirmed. Your role is now live on the job board.`
        : event
          ? `Thank you — you are confirmed for ${event.title}. We will be in touch with any event updates.`
          : "Thank you for your payment. Your transaction is confirmed.";

  const errorMessage =
    paymentKind === "employer_job"
      ? "If you completed payment on Chapa, wait a moment and refresh. Otherwise return to employer pricing and try again."
      : paymentKind === "marketplace"
      ? "If you completed payment on Chapa, wait a moment and refresh. Otherwise return to seller pricing and try again."
      : paymentKind === "job"
        ? "If you completed payment on Chapa, wait a moment and refresh. Otherwise return to your job dashboard and try again."
        : "If you completed payment on Chapa, wait a moment and refresh. Otherwise return to the event and try again.";

  return (
    <section className="services section payment-success-screen">
      <div className="container" data-aos="fade-up">
        <div className="row justify-content-center">
          <div className="col-lg-6 col-md-8">
            <div className={`payment-status-card ${cardClass}`}>
              {pageState === "loading" && !verifyData ? (
                <>
                  <i
                    className={`bi bi-arrow-repeat payment-status-card__icon payment-status-card__icon--loading`}
                    aria-hidden
                  />
                  <h1>Confirming your payment</h1>
                  <p>
                    Please wait while we verify your transaction with Chapa.
                  </p>
                </>
              ) : confirmed ? (
                <>
                  <i
                    className={`bi bi-check-circle-fill payment-status-card__icon ${iconClass}`}
                    aria-hidden
                  />
                  <h1>Your payment was successful</h1>
                  <p>{successMessage}</p>
                  {paymentKind === "event" && event ? (
                    <p className="mt-3 mb-0">
                      {registration?.ticket_code ? (
                        <span className="d-block small text-muted mb-2">
                          Ticket code:{" "}
                          <strong className="font-monospace">
                            {registration.ticket_code}
                          </strong>
                        </span>
                      ) : null}
                      <Link
                        href={`/events/${event.slug}/ticket`}
                        className="btn btn-accent"
                      >
                        View ticket
                      </Link>
                    </p>
                  ) : null}
                  {paymentKind === "job" && job ? (
                    <p className="mt-3 mb-0">
                      <Link href={`/jobs/${job.id}`} className="btn btn-accent">
                        View posting
                      </Link>
                    </p>
                  ) : null}
                  {paymentKind === "employer_job" ? (
                    <p className="mt-3 mb-0">
                      <Link href="/jobs/new" className="btn btn-accent me-2 mb-2">
                        Post a role
                      </Link>
                      <Link
                        href="/jobs/pricing"
                        className="btn btn-outline-secondary mb-2"
                      >
                        Employer pricing
                      </Link>
                    </p>
                  ) : null}
                  {paymentKind === "marketplace" ? (
                    <p className="mt-3 mb-0">
                      <Link
                        href="/marketplace/new"
                        className="btn btn-accent me-2 mb-2"
                      >
                        Create listing
                      </Link>
                      <Link
                        href="/marketplace/mine"
                        className="btn btn-outline-secondary mb-2"
                      >
                        My listings
                      </Link>
                    </p>
                  ) : null}
                </>
              ) : pending ? (
                <>
                  <i
                    className={`bi bi-hourglass-split payment-status-card__icon ${iconClass}`}
                    aria-hidden
                  />
                  <h1>Payment processing</h1>
                  <p>
                    We received your return from Chapa. Confirmation usually
                    takes a few seconds — this page will update automatically.
                  </p>
                </>
              ) : (
                <>
                  <i
                    className={`bi bi-exclamation-circle-fill payment-status-card__icon ${iconClass}`}
                    aria-hidden
                  />
                  <h1>We could not confirm payment</h1>
                  <p>{verifyError || errorMessage}</p>
                </>
              )}

              <p className="payment-ref">Reference: {txRef}</p>

              <div className="payment-status-actions d-flex flex-column flex-sm-row gap-2 justify-content-center">
                {confirmed && event ? (
                  <Link
                    href={`/events/${event.slug}`}
                    className="btn btn-outline-secondary"
                  >
                    Event details
                  </Link>
                ) : null}
                {confirmed && job ? (
                  <Link
                    href={`/jobs/${job.id}`}
                    className="btn btn-outline-secondary"
                  >
                    Job posting
                  </Link>
                ) : null}
                {pending || failed ? (
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => {
                      setPageState("loading");
                      void runVerify().then((r) => {
                        if (r?.payment_status === "CONFIRMED") {
                          setPageState("success");
                          void refetchEvent();
                          void refetchJob();
                          void refetchMarketplace();
                          void refetchEmployerJob();
                        } else if (r) {
                          setPageState("pending");
                        } else {
                          setPageState("error");
                        }
                      });
                    }}
                  >
                    Check again
                  </button>
                ) : null}
                {paymentKind === "job" ? (
                  <Link href="/jobs/mine" className="btn btn-outline-secondary">
                    Job dashboard
                  </Link>
                ) : paymentKind === "employer_job" ? (
                  <Link href="/jobs/pricing" className="btn btn-outline-secondary">
                    Employer pricing
                  </Link>
                ) : paymentKind === "marketplace" ? (
                  <Link
                    href="/marketplace/pricing"
                    className="btn btn-outline-secondary"
                  >
                    Seller pricing
                  </Link>
                ) : (
                  <Link href="/events" className="btn btn-outline-secondary">
                    All events
                  </Link>
                )}
                <Link href="/" className="btn btn-outline-secondary">
                  Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
