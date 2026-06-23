"use client";

import Link from "next/link";
import { useQuery } from "@apollo/client/react";
import { useCallback, useEffect, useState } from "react";

import { MY_EVENT_REGISTRATION_BY_TX_REF_QUERY } from "@/lib/events-graphql";

type VerifyResponse = {
  status: "success" | "error";
  message?: string;
  payment_status?: "FREE" | "PENDING" | "CONFIRMED";
  event?: { slug: string; title: string } | null;
};

type PageState = "loading" | "success" | "pending" | "error";

export function PaymentSuccessClient({ txRef }: { txRef: string }) {
  const [pageState, setPageState] = useState<PageState>("loading");
  const [verifyData, setVerifyData] = useState<VerifyResponse | null>(null);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  const { data: regData, refetch } = useQuery<{
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
        void refetch();
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
      void refetch();
    }

    void confirm();

    return () => {
      cancelled = true;
    };
  }, [runVerify, refetch]);

  const registration = regData?.myEventRegistrationByTxRef;
  const event = verifyData?.event ?? registration?.event ?? null;
  const confirmed =
    pageState === "success" ||
    verifyData?.payment_status === "CONFIRMED" ||
    registration?.payment_status === "CONFIRMED";
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
                  <p>
                    {event
                      ? `Thank you — you are confirmed for ${event.title}. We will be in touch with any event updates.`
                      : "Thank you for your payment. Your event registration is confirmed."}
                  </p>
                  {event ? (
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
                  <p>
                    {verifyError ||
                      "If you completed payment on Chapa, wait a moment and refresh. Otherwise return to the event and try again."}
                  </p>
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
                {pending || failed ? (
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => {
                      setPageState("loading");
                      void runVerify().then((r) => {
                        if (r?.payment_status === "CONFIRMED") {
                          setPageState("success");
                          void refetch();
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
                <Link href="/events" className="btn btn-outline-secondary">
                  All events
                </Link>
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
