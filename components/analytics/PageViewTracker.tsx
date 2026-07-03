"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

function sessionKey(path: string) {
  return `kanema_visit:${path}`;
}

async function recordVisit(path: string) {
  try {
    await fetch("/api/analytics/visit", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ path }),
      keepalive: true,
    });
  } catch {
    // Analytics should never block navigation.
  }
}

/** Records one landing page view per route per browser session. */
export function PageViewTracker() {
  const pathname = usePathname();
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname || pathname === lastPath.current) return;
    lastPath.current = pathname;

    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(sessionKey(pathname))) return;

    sessionStorage.setItem(sessionKey(pathname), "1");
    void recordVisit(pathname);
  }, [pathname]);

  return null;
}
