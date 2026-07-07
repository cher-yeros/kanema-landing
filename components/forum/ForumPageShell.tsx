import Link from "next/link";
import type { ReactNode } from "react";

type ForumPageShellProps = {
  title?: string;
  description?: ReactNode;
  backHref?: string;
  backLabel?: string;
  narrow?: boolean;
  children: ReactNode;
};

export function ForumPageShell({
  title,
  description,
  backHref,
  backLabel,
  narrow = false,
  children,
}: ForumPageShellProps) {
  return (
    <section className="contact section">
      {title || (backHref && backLabel) ? (
        <div className="container section-title" data-aos="fade-up">
          {title ? <h1>{title}</h1> : null}
          {description ? <p>{description}</p> : null}
          {backHref && backLabel ? (
            <Link href={backHref} className="link-body-emphasis">
              ← {backLabel}
            </Link>
          ) : null}
        </div>
      ) : null}
      <div className="container" data-aos="fade-up" data-aos-delay="100">
        {narrow ? (
          <div className="row justify-content-center">
            <div className="col-lg-8">{children}</div>
          </div>
        ) : (
          children
        )}
      </div>
    </section>
  );
}
