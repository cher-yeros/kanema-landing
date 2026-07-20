"use client";

import Link from "next/link";
import { useMutation, useQuery } from "@apollo/client/react";
import { useState } from "react";

import { PAYMENT_SETTINGS_QUERY } from "@/lib/events-graphql";
import { ME_QUERY } from "@/lib/election-graphql";
import { INITIATE_MARKETPLACE_PAYMENT_MUTATION } from "@/lib/marketplace-graphql";
import {
  MARKETPLACE_ANNUAL_BILLING_DISCOUNT_PERCENT,
  MARKETPLACE_BOOST_ADDONS,
  MARKETPLACE_PAY_PER_LISTING_PLANS,
  MARKETPLACE_STANDARD_PER_LISTING_PRICE,
  MARKETPLACE_SUBSCRIPTION_INCLUDES,
  MARKETPLACE_SUBSCRIPTION_PLANS,
  MARKETPLACE_VALUE_COMPARISON,
  activeListingsStarterBreakEven,
  formatMarketplacePrice,
} from "@/lib/marketplace-pricing-config";

type MarketplaceSellerPricingProps = {
  showPostCta?: boolean;
};

type ChapaCheckoutResponse = {
  status?: string;
  checkout_url?: string | null;
  message?: string;
};

function redirectToChapaCheckout(data: ChapaCheckoutResponse | undefined) {
  const url = data?.checkout_url?.trim();
  if (url) {
    window.location.assign(url);
    return true;
  }
  return false;
}

export function MarketplaceSellerPricing({
  showPostCta = true,
}: MarketplaceSellerPricingProps) {
  const breakEven = activeListingsStarterBreakEven();
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [payingKey, setPayingKey] = useState<string | null>(null);

  const { data: paymentData } = useQuery<{
    paymentSettings: { chapaEnabled: boolean };
  }>(PAYMENT_SETTINGS_QUERY);
  const chapaEnabled = paymentData?.paymentSettings.chapaEnabled === true;
  const { data: meData } = useQuery<{ me: { id: string } | null }>(ME_QUERY);
  const isLoggedIn = Boolean(meData?.me);
  const loginHref = `/election/login?next=${encodeURIComponent("/marketplace/pricing")}`;

  const [initiatePayment] = useMutation(INITIATE_MARKETPLACE_PAYMENT_MUTATION);

  async function startCheckout(
    key: string,
    input: {
      product_type: "STANDARD_LISTING" | "SUBSCRIPTION" | "BOOST";
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
          | { initiateMarketplacePayment?: ChapaCheckoutResponse }
          | undefined
      )?.initiateMarketplacePayment;

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

      <section
        className="services section"
        aria-labelledby="payPerListingHeading"
      >
        <div className="container section-title" data-aos="fade-up">
          <h2 id="payPerListingHeading">Pay per listing</h2>
          <p>
            Start free with up to two active listings, then pay only when you
            need extra slots—ideal for occasional sellers.
          </p>
        </div>

        <div className="container" data-aos="fade-up" data-aos-delay="100">
          <div className="row gy-4 justify-content-center">
            {MARKETPLACE_PAY_PER_LISTING_PLANS.map((plan) => (
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
                    <p className="mb-3">{plan.features}</p>
                    {plan.id === "standard" && chapaEnabled ? (
                      <button
                        type="button"
                        className="btn btn-accent btn-sm"
                        disabled={payingKey === "standard-listing"}
                        onClick={() =>
                          void startCheckout("standard-listing", {
                            product_type: "STANDARD_LISTING",
                            product_id: "standard",
                            billing_period: "ONE_TIME",
                          })
                        }
                      >
                        {payingKey === "standard-listing"
                          ? "Starting checkout…"
                          : "Pay with Chapa"}
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        className="services section light-background"
        aria-labelledby="subscriptionHeading"
      >
        <div className="container section-title" data-aos="fade-up">
          <h2 id="subscriptionHeading">Seller subscription plans</h2>
          <p>
            Save {MARKETPLACE_ANNUAL_BILLING_DISCOUNT_PERCENT}% with annual
            billing. Power sellers get more active listings for less than
            pay-per-listing.
          </p>
        </div>

        <div className="container" data-aos="fade-up" data-aos-delay="100">
          <div className="row gy-4">
            {MARKETPLACE_SUBSCRIPTION_PLANS.map((plan) => (
              <div className="col-lg-4" key={plan.id}>
                <div
                  className={`offering-block h-100${plan.highlighted ? " border border-primary" : ""}`}
                >
                  <div className="offering-indicator" />
                  <div className="offering-icon-wrap">
                    <i className="bi bi-shop" />
                  </div>
                  <div className="offering-body">
                    <div className="offering-header">
                      <h4>{plan.name}</h4>
                      {plan.highlighted ? (
                        <span className="featured-tag">Popular</span>
                      ) : null}
                    </div>
                    <p className="mb-1">
                      <strong>
                        {formatMarketplacePrice(plan.monthlyPrice)}
                      </strong>
                      <span className="text-muted"> / month</span>
                    </p>
                    <p className="small text-muted mb-2">
                      {formatMarketplacePrice(plan.yearlyPrice, {
                        suffix: "/ year",
                      })}{" "}
                      ({MARKETPLACE_ANNUAL_BILLING_DISCOUNT_PERCENT}% off)
                    </p>
                    <p className="mb-3">{plan.activeListings}</p>
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
              {MARKETPLACE_SUBSCRIPTION_INCLUDES.map((item) => (
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
          <h2 id="boostsHeading">Optional listing boosts</h2>
          <p>
            Add visibility when you want more eyes on a listing—stack boosts on
            any paid or subscription listing.
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
                  {chapaEnabled ? (
                    <th scope="col" className="text-end">
                      Action
                    </th>
                  ) : null}
                </tr>
              </thead>
              <tbody>
                {MARKETPLACE_BOOST_ADDONS.map((addon) => (
                  <tr key={addon.id}>
                    <td>{addon.name}</td>
                    <td className="text-end text-nowrap">
                      {formatMarketplacePrice(addon.price)}
                    </td>
                    {chapaEnabled ? (
                      <td className="text-end">
                        <button
                          type="button"
                          className="btn btn-accent btn-sm"
                          disabled={payingKey === `boost-${addon.id}`}
                          onClick={() =>
                            void startCheckout(`boost-${addon.id}`, {
                              product_type: "BOOST",
                              product_id: addon.id,
                              billing_period: "ONE_TIME",
                            })
                          }
                        >
                          {payingKey === `boost-${addon.id}`
                            ? "Starting…"
                            : "Buy boost"}
                        </button>
                      </td>
                    ) : null}
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
            At {formatMarketplacePrice(MARKETPLACE_STANDARD_PER_LISTING_PRICE)}{" "}
            per listing beyond the free tier, anyone with more than {breakEven}{" "}
            active listings already saves with Starter Seller—subscriptions stay
            attractive as your catalog grows.
          </p>
        </div>

        <div className="container" data-aos="fade-up" data-aos-delay="100">
          <div className="table-responsive">
            <table className="table table-bordered align-middle mb-0">
              <thead>
                <tr>
                  <th scope="col">Usage</th>
                  <th scope="col">Pay per listing</th>
                  <th scope="col">Best plan</th>
                </tr>
              </thead>
              <tbody>
                {MARKETPLACE_VALUE_COMPARISON.map((row) => (
                  <tr key={row.usage}>
                    <td>{row.usage}</td>
                    <td>{row.payPerListingCost}</td>
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
                      <h3>Ready to list your gear?</h3>
                      <p>
                        Approved members can publish listings today.
                        {chapaEnabled
                          ? " Pay for extra slots, subscriptions, and boosts securely with Chapa."
                          : " Paid tiers and boosts follow the rate card above when billing is enabled."}
                      </p>
                    </div>
                    <div className="col-lg-4 text-lg-end text-center">
                      <Link href="/marketplace/new" className="action-btn">
                        Create listing
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
