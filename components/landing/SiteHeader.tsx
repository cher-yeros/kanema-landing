"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, type MouseEvent } from "react";

export function SiteHeader() {
  const [mobileNavActive, setMobileNavActive] = useState(false);

  const mobileNavToggle = useCallback(() => {
    setMobileNavActive((v) => {
      const next = !v;
      return next;
    });
  }, []);

  useEffect(() => {
    if (mobileNavActive) {
      document.body.classList.add("mobile-nav-active");
    } else {
      document.body.classList.remove("mobile-nav-active");
    }
    return () => document.body.classList.remove("mobile-nav-active");
  }, [mobileNavActive]);

  const closeMobileIfHash = useCallback(
    (e: MouseEvent<HTMLAnchorElement>) => {
      const href = e.currentTarget.getAttribute("href") ?? "";
      if (
        mobileNavActive &&
        (href.startsWith("#") || href.startsWith("/#")) &&
        !href.includes("dropdown")
      ) {
        setMobileNavActive(false);
      }
    },
    [mobileNavActive],
  );

  return (
    <header id="header" className="header d-flex align-items-center fixed-top">
      <div className="header-container container-fluid container-xl position-relative d-flex align-items-center justify-content-between">
        <Link
          href="/"
          className="logo d-flex align-items-center me-auto me-xl-0"
        >
          <h1 className="sitename">ካነማ</h1>
        </Link>

        <nav id="navmenu" className="navmenu">
          <ul>
            <li>
              <Link
                href="/#hero"
                className="active"
                onClick={closeMobileIfHash}
              >
                Home
              </Link>
            </li>
            <li>
              <Link href="/#about" onClick={closeMobileIfHash}>
                About
              </Link>
            </li>
            <li>
              <Link href="/election" onClick={() => setMobileNavActive(false)}>
                Election
              </Link>
            </li>
            <li>
              <Link href="/community" onClick={() => setMobileNavActive(false)}>
                Community
              </Link>
            </li>
            <li>
              <Link href="/jobs" onClick={() => setMobileNavActive(false)}>
                Production jobs
              </Link>
            </li>
            {/* (removed) "More" dropdown — no remaining items */}
            <li>
              <Link href="/#contact" onClick={closeMobileIfHash}>
                Contact
              </Link>
            </li>
          </ul>
          <i
            className={`mobile-nav-toggle d-xl-none bi ${mobileNavActive ? "bi-x" : "bi-list"}`}
            onClick={mobileNavToggle}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                mobileNavToggle();
              }
            }}
            role="button"
            tabIndex={0}
            aria-label="Toggle navigation"
          />
        </nav>

        <Link className="btn-getstarted" href="/community#join">
          Join the community
        </Link>
      </div>
    </header>
  );
}
