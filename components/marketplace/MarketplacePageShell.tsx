import type { ReactNode } from "react";

import { MarketplaceHeroActions } from "./MarketplaceHeroActions";

type MarketplacePageShellProps = {
  title?: string;
  description?: ReactNode;
  narrow?: boolean;
  children: ReactNode;
};

export function MarketplacePageShell({
  title,
  description,
  narrow = false,
  children,
}: MarketplacePageShellProps) {
  return (
    <>
      <section className="hero section">
        <div className="container">
          {title ? <h1 className="mt-2">{title}</h1> : null}
          {description ? <p className="mb-0">{description}</p> : null}
          <MarketplaceHeroActions />
        </div>
      </section>
      <section className="section">
        <div
          className="container"
          style={narrow ? { maxWidth: 720 } : undefined}
        >
          {children}
        </div>
      </section>
    </>
  );
}
