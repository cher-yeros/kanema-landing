"use client";

import Link from "next/link";
import { useMutation, useQuery } from "@apollo/client/react";
import { useState } from "react";

import { PAYMENT_SETTINGS_QUERY } from "@/lib/events-graphql";
import { ME_QUERY } from "@/lib/election-graphql";
import {
  INITIATE_EMPLOYER_JOB_PAYMENT_MUTATION,
  redirectToChapaCheckout,
} from "@/lib/jobs-graphql";
import {
  JOBS_ANNUAL_BILLING_DISCOUNT_PERCENT,
  JOBS_BOOST_ADDONS,
  JOBS_PAY_PER_JOB_PLANS,
  JOBS_STANDARD_PER_JOB_PRICE,
  JOBS_SUBSCRIPTION_INCLUDES,
  JOBS_SUBSCRIPTION_PLANS,
  JOBS_VALUE_COMPARISON,
  formatJobsPrice,
  jobsPerMonthStarterBreakEven,
} from "@/lib/jobs-pricing-config";

type JobEmployerPricingProps = {
  showPostCta?: boolean;
};

export function JobEmployerPricing({
  showPostCta = true,
}: JobEmployerPricingProps) {
  const breakEven = jobsPerMonthStarterBreakEven();
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [payingKey, setPayingKey] = useState<string | null>(null);

  const { data: paymentData } = useQuery<{
    paymentSettings: { chapaEnabled: boolean };
  }>(PAYMENT_SETTINGS_QUERY);
  const chapaEnabled = paymentData?.paymentSettings.chapaEnabled === true;
  const { data: meData } = useQuery<{ me: { id: string } | null }>(ME_QUERY);
  const isLoggedIn = Boolean(meData?.me);
  const loginHref = `/election/login?next=${encodeURIComponent("/jobs/pricing")}`;

  const [initiatePayment] = useMutation(INITIATE_EMPLOYER_JOB_PAYMENT_MUTATION);

  async function startCheckout(
    key: string,
    input: {
      product_type: "STANDARD_JOB" | "SUBSCRIPTION" | "BOOST";
      product_id: string;
      billing_period?: "ONE_TIME" | "MONTHLY" | "YEARLY";
    },
  ) {
    if (!isLoggedIn) {
      window.location.assign(loginHref);
      return;
    }

    if (!chapaEnabled) {
      setPaymentError("Online payments are not enabled yet.");
      return;
    }

    setPaymentError(null);
    setPayingKey(key);
    try {
      const { data } = await initiatePayment({
        variables: {
          input: {
            product_type: input.product_type,
            product_id: input.product_id,
            billing_period: input.billing_period ?? "ONE_TIME",
          },
        },
      });
      const payload = (
        data as
          | {
              initiateEmployerJobPayment?: {
                checkout_url?: string | null;
                message?: string;
              };
            }
          | undefined
      )?.initiateEmployerJobPayment;

      if (!redirectToChapaCheckout(payload)) {
        throw new Error(payload?.message || "Could not start checkout.");
      }
    } catch (err: unknown) {
      setPaymentError(
        err instanceof Error ? err.message : "Could not start payment.",
      );
      setPayingKey(null);
    }
  }

  return (
    <>
      {paymentError ? (
        <div className="container mt-4">
          <div className="alert alert-danger mb-0" role="alert">
            {paymentError}
          </div>
        </div>
      ) : null}

      <section className="services section" aria-labelledby="payPerJobHeading">
        <div className="container section-title" data-aos="fade-up">
          <h2 id="payPerJobHeading">Pay per job</h2>
          <p>
            Start free, then pay only when you need extra postings—ideal for
            one-off hires or occasional crew calls.
          </p>
        </div>

        <div className="container" data-aos="fade-up" data-aos-delay="100">
          <div className="row gy-4 justify-content-center">
            {JOBS_PAY_PER_JOB_PLANS.map((plan) => (
              <div className="col-md-6 col-lg-5" key={plan.id}>
                <div className="offering-block h-100">
                  <div className="offering-indicator" />
                  <div className="offering-icon-wrap">
                    <i
                      className={
                        plan.id === "free" ? "bi bi-gift" : "bi bi-receipt"
                      }
                    />
                  </div>
                  <div className="offering-body">
                    <div className="offering-header">
                      <h4>{plan.name}</h4>
                      <span className="featured-tag">{plan.priceLabel}</span>
                    </div>
                    <p className="mb-0">{plan.features}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="small text-muted mt-3 mb-0 text-center">
            Without a subscription, posts beyond the free tier are{" "}
            {formatJobsPrice(JOBS_STANDARD_PER_JOB_PRICE)} each at checkout when
            you publish a role.
          </p>
        </div>
      </section>

      <section
        className="services section light-background"
        aria-labelledby="subscriptionHeading"
      >
        <div className="container section-title" data-aos="fade-up">
          <h2 id="subscriptionHeading">Employer subscription plans</h2>
          <p>
            Save {JOBS_ANNUAL_BILLING_DISCOUNT_PERCENT}% with annual billing.
            Frequent hirers get included postings each month—no per-job fee
            until quota is used.
          </p>
        </div>

        <div className="container" data-aos="fade-up" data-aos-delay="100">
          <div className="row gy-4">
            {JOBS_SUBSCRIPTION_PLANS.map((plan) => (
              <div className="col-lg-4" key={plan.id}>
                <div
                  className={`offering-block h-100${plan.highlighted ? " border border-primary" : ""}`}
                >
                  <div className="offering-indicator" />
                  <div className="offering-icon-wrap">
                    <i className="bi bi-building" />
                  </div>
                  <div className="offering-body">
                    <div className="offering-header">
                      <h4>{plan.name}</h4>
                      {plan.highlighted ? (
                        <span className="featured-tag">Popular</span>
                      ) : null}
                    </div>
                    <p className="mb-1">
                      <strong>{formatJobsPrice(plan.monthlyPrice)}</strong>
                      <span className="text-muted"> / month</span>
                    </p>
                    <p className="small text-muted mb-2">
                      {formatJobsPrice(plan.yearlyPrice, { suffix: "/ year" })}{" "}
                      ({JOBS_ANNUAL_BILLING_DISCOUNT_PERCENT}% off)
                    </p>
                    <p className="mb-3">{plan.jobsIncluded}</p>
                    {chapaEnabled ? (
                      <div className="d-flex flex-column gap-2">
                        <button
                          type="button"
                          className="btn btn-accent btn-sm"
                          disabled={payingKey === `${plan.id}-monthly`}
                          onClick={() =>
                            void startCheckout(`${plan.id}-monthly`, {
                              product_type: "SUBSCRIPTION",
                              product_id: plan.id,
                              billing_period: "MONTHLY",
                            })
                          }
                        >
                          {payingKey === `${plan.id}-monthly`
                            ? "Starting checkout…"
                            : "Subscribe monthly"}
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline-secondary btn-sm"
                          disabled={payingKey === `${plan.id}-yearly`}
                          onClick={() =>
                            void startCheckout(`${plan.id}-yearly`, {
                              product_type: "SUBSCRIPTION",
                              product_id: plan.id,
                              billing_period: "YEARLY",
                            })
                          }
                        >
                          {payingKey === `${plan.id}-yearly`
                            ? "Starting checkout…"
                            : "Subscribe yearly"}
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="info-box mt-5">
            <h3 className="h5 mb-3">Included in every subscription</h3>
            <ul className="mb-0 row gy-2">
              {JOBS_SUBSCRIPTION_INCLUDES.map((item) => (
                <li key={item} className="col-md-6 d-flex gap-2">
                  <i className="bi bi-check2-circle text-success" aria-hidden />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="services section" aria-labelledby="boostsHeading">
        <div className="container section-title" data-aos="fade-up">
          <h2 id="boostsHeading">Optional job boosts</h2>
          <p>
            Add visibility when you need to fill a role fast—select boosts at
            checkout after your posting is approved; they are charged on top of
            any base posting fee.
          </p>
        </div>

        <div className="container" data-aos="fade-up" data-aos-delay="100">
          <div className="table-responsive">
            <table className="table table-bordered align-middle mb-0">
              <thead>
                <tr>
                  <th scope="col">Add-on</th>
                  <th scope="col" className="text-end">
                    Price
                  </th>
                </tr>
              </thead>
              <tbody>
                {JOBS_BOOST_ADDONS.map((addon) => (
                  <tr key={addon.id}>
                    <td>{addon.name}</td>
                    <td className="text-end text-nowrap">
                      {formatJobsPrice(addon.price)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section
        className="services section light-background"
        aria-labelledby="valueComparisonHeading"
      >
        <div className="container section-title" data-aos="fade-up">
          <h2 id="valueComparisonHeading">Value comparison</h2>
          <p>
            At {formatJobsPrice(JOBS_STANDARD_PER_JOB_PRICE)} per individual
            job, anyone posting more than {breakEven} jobs per month already
            saves with Starter—subscriptions stay attractive as volume grows.
          </p>
        </div>

        <div className="container" data-aos="fade-up" data-aos-delay="100">
          <div className="table-responsive">
            <table className="table table-bordered align-middle mb-0">
              <thead>
                <tr>
                  <th scope="col">Usage</th>
                  <th scope="col">Pay per job</th>
                  <th scope="col">Best plan</th>
                </tr>
              </thead>
              <tbody>
                {JOBS_VALUE_COMPARISON.map((row) => (
                  <tr key={row.usage}>
                    <td>{row.usage}</td>
                    <td>{row.payPerJobCost}</td>
                    <td>
                      <strong>{row.bestPlan}</strong>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {showPostCta ? (
            <div className="row mt-5">
              <div className="col-12">
                <div className="action-banner">
                  <div className="row align-items-center">
                    <div className="col-lg-8">
                      <h3>Ready to post your next role?</h3>
                      <p>
                        Subscribe above for monthly included postings, or post
                        from your dashboard—free tier and pay-per-job checkout
                        apply automatically at publish time.
                      </p>
                    </div>
                    <div className="col-lg-4 text-lg-end text-center">
                      <Link href="/jobs/new" className="action-btn">
                        Post a role
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </>
  );
}
