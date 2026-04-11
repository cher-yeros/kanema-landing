"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

export function SiteHeader() {
  const [mobileNavActive, setMobileNavActive] = useState(false);

  const mobileNavToggle = useCallback(() => {
    setMobileNavActive((v) => !v);
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
    (e: React.MouseEvent<HTMLAnchorElement>) => {
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
    <header
      id="header"
      className="header d-flex align-items-center fixed-top"
    >
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
              <a href="/#hero" className="active" onClick={closeMobileIfHash}>
                Home
              </a>
            </li>
            <li>
              <a href="/#about" onClick={closeMobileIfHash}>
                About
              </a>
            </li>
            <li>
              <a href="/#services" onClick={closeMobileIfHash}>
                Platform
              </a>
            </li>
            <li>
              <a href="/#showcase" onClick={closeMobileIfHash}>
                Showcase
              </a>
            </li>
            <li>
              <a href="/#why-us" onClick={closeMobileIfHash}>
                Why Kanema
              </a>
            </li>
            <li>
              <a href="/#testimonials" onClick={closeMobileIfHash}>
                Voices
              </a>
            </li>
            <li>
              <a href="/#team" onClick={closeMobileIfHash}>
                Community
              </a>
            </li>
            <li>
              <a href="/#contact" onClick={closeMobileIfHash}>
                Contact
              </a>
            </li>
            <li>
              <Link href="/election" onClick={() => setMobileNavActive(false)}>
                Election
              </Link>
            </li>
            <li>
              <Link href="/jobs" onClick={() => setMobileNavActive(false)}>
                Production jobs
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

        <a className="btn-getstarted" href="/#contact">
          Join the community
        </a>
      </div>
    </header>
  );
}
