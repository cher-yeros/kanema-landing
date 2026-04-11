"use client";

type Tally = {
  votes: number;
  percentage: number;
  candidate: {
    id: string;
    user: { full_name: string };
  };
};

export function ResultsBars({
  tallies,
  totalVotes,
}: {
  tallies: Tally[];
  totalVotes: number;
}) {
  if (!tallies.length) {
    return (
      <p className="text-muted small mb-0">
        No approved candidates on the ballot yet.
      </p>
    );
  }

  const sorted = [...tallies].sort((a, b) => b.votes - a.votes);

  return (
    <div className="election-results d-flex flex-column gap-3">
      <p className="small text-muted mb-0">
        Total votes cast: <strong>{totalVotes}</strong>
      </p>
      {sorted.map((row) => (
        <div key={row.candidate.id}>
          <div className="d-flex justify-content-between align-items-baseline mb-1">
            <span className="fw-medium">
              {row.candidate.user.full_name}
            </span>
            <span className="small text-muted">
              {row.votes} ({row.percentage.toFixed(1)}%)
            </span>
          </div>
          <div className="result-bar" role="img" aria-label={`${row.percentage}%`}>
            <span style={{ width: `${Math.min(100, row.percentage)}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}
