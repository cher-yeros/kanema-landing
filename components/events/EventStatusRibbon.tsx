export function EventStatusRibbon({
  isPast,
  className = "",
}: {
  isPast: boolean;
  className?: string;
}) {
  const label = isPast ? "Past" : "Upcoming";

  return (
    <span
      className={`event-status-ribbon event-status-ribbon--${isPast ? "past" : "upcoming"} ${className}`.trim()}
      aria-label={`${label} event`}
    >
      {label}
    </span>
  );
}
