export function formatReputationTier(tier: string): string {
  return tier
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

export function tierBadgeClass(tier: string): string {
  switch (tier) {
    case "legend":
      return "bg-warning text-dark";
    case "master":
      return "bg-danger";
    case "expert":
      return "bg-primary";
    case "professional":
      return "bg-info text-dark";
    case "contributor":
      return "bg-success";
    default:
      return "bg-secondary";
  }
}
