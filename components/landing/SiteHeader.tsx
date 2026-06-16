"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
  type MouseEvent,
} from "react";

type NavKey =
  | "home"
  | "about"
  | "election"
  | "community"
  | "jobs"
  | "learn"
  | "events"
  | "contact";

export function SiteHeader() {
  const pathname = usePathname();
  const [hash, setHash] = useState("");
  const [mobileNavActive, setMobileNavActive] = useState(false);

  useLayoutEffect(() => {
    setHash(typeof window !== "undefined" ? window.location.hash : "");
  }, [pathname]);

  useEffect(() => {
    const onHashOrPop = () =>
      setHash(typeof window !== "undefined" ? window.location.hash : "");
    window.addEventListener("hashchange", onHashOrPop);
    window.addEventListener("popstate", onHashOrPop);
    return () => {
      window.removeEventListener("hashchange", onHashOrPop);
      window.removeEventListener("popstate", onHashOrPop);
    };
  }, []);

  const activeNav = useMemo((): NavKey | null => {
    if (pathname.startsWith("/election")) return "election";
    if (pathname.startsWith("/community")) return "community";
    if (pathname.startsWith("/jobs")) return "jobs";
    if (pathname.startsWith("/learn")) return "learn";
    if (pathname.startsWith("/events")) return "events";
    if (pathname === "/") {
      if (hash === "#about") return "about";
      if (hash === "#contact") return "contact";
      return "home";
    }
    return null;
  }, [pathname, hash]);

  const syncHashFromLocation = useCallback(() => {
    queueMicrotask(() => {
      setHash(typeof window !== "undefined" ? window.location.hash : "");
    });
  }, []);

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
      syncHashFromLocation();
    },
    [mobileNavActive, syncHashFromLocation],
  );

  const closeMobileForPage = useCallback(() => {
    setMobileNavActive(false);
    syncHashFromLocation();
  }, [syncHashFromLocation]);

  const navClass = (key: NavKey) => (activeNav === key ? "active" : undefined);

  return (
    <header id="header" className="header d-flex align-items-center fixed-top">
      <div className="header-container container-fluid container-xl position-relative d-flex align-items-center justify-content-between">
        <Link
          href="/"
          className="logo d-flex align-items-center me-auto me-xl-0"
        >
          <h1 className="sitename">ካንማ</h1>
        </Link>

        <nav id="navmenu" className="navmenu">
          <ul>
            <li>
              <Link
                href="/#hero"
                className={navClass("home")}
                aria-current={activeNav === "home" ? "page" : undefined}
                onClick={closeMobileIfHash}
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                href="/#about"
                className={navClass("about")}
                aria-current={activeNav === "about" ? "page" : undefined}
                onClick={closeMobileIfHash}
              >
                About
              </Link>
            </li>
            <li>
              <Link
                href="/election"
                className={navClass("election")}
                aria-current={activeNav === "election" ? "page" : undefined}
                onClick={closeMobileForPage}
              >
                Election
              </Link>
            </li>
            <li>
              <Link
                href="/community"
                className={navClass("community")}
                aria-current={activeNav === "community" ? "page" : undefined}
                onClick={closeMobileForPage}
              >
                Community
              </Link>
            </li>
            <li>
              <Link
                href="/jobs"
                className={navClass("jobs")}
                aria-current={activeNav === "jobs" ? "page" : undefined}
                onClick={closeMobileForPage}
              >
                Production jobs
              </Link>
            </li>
            <li>
              <Link
                href="/learn"
                className={navClass("learn")}
                aria-current={activeNav === "learn" ? "page" : undefined}
                onClick={closeMobileForPage}
              >
                Learn
              </Link>
            </li>
            <li>
              <Link
                href="/events"
                className={navClass("events")}
                aria-current={activeNav === "events" ? "page" : undefined}
                onClick={closeMobileForPage}
              >
                Events
              </Link>
            </li>
            {/* (removed) "More" dropdown — no remaining items */}
            <li>
              <Link
                href="/#contact"
                className={navClass("contact")}
                aria-current={activeNav === "contact" ? "page" : undefined}
                onClick={closeMobileIfHash}
              >
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
