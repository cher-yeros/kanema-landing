import type { ReactNode } from "react";

import { LegalDocNav } from "@/components/legal/LegalDocNav";

type LegalPageShellProps = {
  currentPath: string;
  title: string;
  intro: string;
  lastUpdated: string;
  children: ReactNode;
};

export function LegalPageShell({
  currentPath,
  title,
  intro,
  lastUpdated,
  children,
}: LegalPageShellProps) {
  return (
    <section className="section privacy legal-doc">
      <div className="container">
        <header className="privacy-header">
          <div className="header-content">
            <p className="last-updated">Last updated: {lastUpdated}</p>
            <h1>{title}</h1>
            <p className="intro-text">{intro}</p>
          </div>
        </header>

        <LegalDocNav current={currentPath} />

        <div className="privacy-content">{children}</div>
      </div>
    </section>
  );
}
