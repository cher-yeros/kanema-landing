"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  androidIntentUrl,
  appStoreUrl,
  customSchemeUrl,
  playStoreUrl,
} from "@/lib/app-links";

type Props = {
  path: string;
  webUrl: string;
};

function isAndroid(): boolean {
  if (typeof navigator === "undefined") return false;
  return /android/i.test(navigator.userAgent);
}

function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

export function OpenAppClient({ path, webUrl }: Props) {
  const [tried, setTried] = useState(false);
  const play = playStoreUrl();
  const appStore = appStoreUrl();

  const storeUrl = useMemo(() => {
    if (isAndroid() && play) return play;
    if (isIOS() && appStore) return appStore;
    return play || appStore || "";
  }, [play, appStore]);

  useEffect(() => {
    setTried(true);

    if (isAndroid()) {
      // Intent URL opens the app if installed; otherwise browser_fallback_url.
      window.location.href = androidIntentUrl(path, storeUrl || webUrl);
      return;
    }

    if (isIOS()) {
      const scheme = customSchemeUrl(path);
      const started = Date.now();
      window.location.href = scheme;

      const timer = window.setTimeout(() => {
        // If still visible after ~1.5s, app likely not installed.
        if (Date.now() - started < 2000) {
          window.location.href = storeUrl || webUrl;
        }
      }, 1500);

      const onHide = () => window.clearTimeout(timer);
      document.addEventListener("visibilitychange", onHide);
      return () => {
        window.clearTimeout(timer);
        document.removeEventListener("visibilitychange", onHide);
      };
    }

    // Desktop / unknown: go straight to the web content.
    window.location.replace(webUrl);
  }, [path, storeUrl, webUrl]);

  return (
    <div className="text-center">
      <h1 className="h3 mb-3">Opening Canma…</h1>
      <p className="text-muted mb-4">
        {tried
          ? "If the app did not open, install Canma or continue on the web."
          : "Trying to open this in the Canma app."}
      </p>
      <div className="d-grid gap-2">
        {storeUrl ? (
          <a className="btn btn-accent" href={storeUrl}>
            Download the app
          </a>
        ) : null}
        <Link className="btn btn-outline-secondary" href={path}>
          Continue on the website
        </Link>
      </div>
    </div>
  );
}
