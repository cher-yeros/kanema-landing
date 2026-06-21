const COMMUNITY_ROLE_LABELS: Record<string, string> = {
  CREATIVE: "Creative",
  PRODUCER: "Producer / crew",
  BUSINESS: "Business / partner",
  STUDENT: "Student",
  VOLUNTEER: "Volunteer",
  OTHER: "Community member",
};

export function communityRoleLabel(role: string): string {
  return COMMUNITY_ROLE_LABELS[role] ?? "Community member";
}
