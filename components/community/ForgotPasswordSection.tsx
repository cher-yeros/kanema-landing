"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

import { ForgotPasswordForm } from "./ForgotPasswordForm";

function ForgotPasswordSectionInner() {
  const searchParams = useSearchParams();
  const nextRaw = searchParams.get("next");
  const nextUrl =
    nextRaw && nextRaw.startsWith("/") && !nextRaw.startsWith("//")
      ? nextRaw
      : "/profile";

  return (
    <section className="contact section">
      <div className="container section-title" data-aos="fade-up">
        <h1>Forgot password</h1>
        <p>Recover access to your Canma member account.</p>
      </div>
      <div className="container" data-aos="fade-up" data-aos-delay="100">
        <div className="row justify-content-center">
          <div className="col-lg-6">
            <div className="form-panel">
              <ForgotPasswordForm nextUrl={nextUrl} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function ForgotPasswordSection() {
  return (
    <Suspense fallback={<section className="contact section" />}>
      <ForgotPasswordSectionInner />
    </Suspense>
  );
}
