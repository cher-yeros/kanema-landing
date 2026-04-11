"use client";

import { useEffect, useState } from "react";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function ElectionCountdown({ endIso }: { endIso: string }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const end = new Date(endIso).getTime();
  const diff = Math.max(0, end - now);
  const s = Math.floor(diff / 1000);
  const days = Math.floor(s / 86400);
  const hours = Math.floor((s % 86400) / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const seconds = s % 60;

  if (diff <= 0) {
    return (
      <div className="hero-showcase">
        <div className="stats-overlay election-countdown-stand">
          <div className="row g-0">
            <div className="col-12">
              <div className="stat-card py-4">
                <span className="stat-text">
                  Voting for this period has closed. Results stay available on the
                  results page.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const cells = [
    { num: pad(days), label: "Days" },
    { num: pad(hours), label: "Hours" },
    { num: pad(minutes), label: "Minutes" },
    { num: pad(seconds), label: "Seconds" },
  ];

  return (
    <div className="hero-showcase">
      <div className="stats-overlay election-countdown-stand" aria-live="polite">
        <div className="row g-0">
          {cells.map((c, i) => (
            <div key={c.label} className="col-6 col-md-3">
              <div className={`stat-card${i < 3 ? "" : ""}`}>
                <span className="stat-value">{c.num}</span>
                <span className="stat-text">{c.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
