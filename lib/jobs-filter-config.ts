export type JobFilterOption = {
  id: string;
  label: string;
  keywords: string[];
};

export const JOB_EMPLOYMENT_CATEGORIES: JobFilterOption[] = [
  {
    id: "permanent",
    label: "Permanent",
    keywords: ["permanent", "full-time staff", "staff role"],
  },
  {
    id: "full-time",
    label: "Full-time",
    keywords: ["full-time", "full time", "ft "],
  },
  {
    id: "part-time",
    label: "Part-time",
    keywords: ["part-time", "part time", "pt "],
  },
  {
    id: "contract",
    label: "Contract",
    keywords: ["contract", "fixed-term", "fixed term"],
  },
  {
    id: "freelance",
    label: "Freelance",
    keywords: ["freelance", "freelancer", "independent"],
  },
  {
    id: "project-based",
    label: "Project-based",
    keywords: ["project-based", "project based", "per project"],
  },
  {
    id: "internship",
    label: "Internship",
    keywords: ["intern", "internship", "trainee"],
  },
  {
    id: "temporary",
    label: "Temporary",
    keywords: ["temporary", "temp ", "short-term", "short term"],
  },
];

export const JOB_WORK_TYPES: JobFilterOption[] = [
  {
    id: "director-of-photography",
    label: "Director of Photography (DP)",
    keywords: ["director of photography", " dp ", "dop", "cinematographer"],
  },
  {
    id: "camera-operator",
    label: "Camera operator",
    keywords: ["camera operator", "cam op"],
  },
  {
    id: "camera-assistant",
    label: "Camera assistant",
    keywords: ["camera assistant", "camera man assistant", "cam assistant"],
  },
  {
    id: "1st-ac",
    label: "1st AC",
    keywords: ["1st ac", "first ac", "focus puller"],
  },
  {
    id: "2nd-ac",
    label: "2nd AC",
    keywords: ["2nd ac", "second ac", "clapper loader"],
  },
  {
    id: "gaffer",
    label: "Gaffer",
    keywords: ["gaffer", "chief lighting"],
  },
  {
    id: "best-boy-electric",
    label: "Best boy electric",
    keywords: ["best boy", "best boy electric"],
  },
  {
    id: "grip",
    label: "Grip",
    keywords: [" grip", "grip "],
  },
  {
    id: "sound-recordist",
    label: "Sound recordist",
    keywords: ["sound recordist", "production sound", "sound mixer"],
  },
  {
    id: "boom-operator",
    label: "Boom operator",
    keywords: ["boom operator", "boom op"],
  },
  {
    id: "production-assistant",
    label: "Production assistant",
    keywords: ["production assistant", " pa ", "set pa"],
  },
  {
    id: "editor",
    label: "Editor",
    keywords: [" editor", "editor ", "video editor", "offline editor"],
  },
  {
    id: "colorist",
    label: "Colorist",
    keywords: ["colorist", "colourist", "color grade", "colour grade"],
  },
  {
    id: "vfx-artist",
    label: "VFX artist",
    keywords: ["vfx", "visual effects", "compositor"],
  },
  {
    id: "motion-graphics",
    label: "Motion graphics designer",
    keywords: ["motion graphics", "mograph", "motion designer"],
  },
  {
    id: "photographer",
    label: "Photographer",
    keywords: ["photographer", "still photographer", "stills"],
  },
  {
    id: "steadicam-operator",
    label: "Steadicam operator",
    keywords: ["steadicam", "gimbal operator"],
  },
  {
    id: "drone-operator",
    label: "Drone operator",
    keywords: ["drone operator", "uav", "fpv pilot"],
  },
  {
    id: "makeup-artist",
    label: "Makeup artist",
    keywords: ["makeup artist", "mua", "hair and makeup"],
  },
  {
    id: "wardrobe-stylist",
    label: "Wardrobe stylist",
    keywords: ["wardrobe", "costume", "stylist"],
  },
  {
    id: "script-supervisor",
    label: "Script supervisor",
    keywords: ["script supervisor", "script continuity"],
  },
  {
    id: "line-producer",
    label: "Line producer",
    keywords: ["line producer"],
  },
  {
    id: "production-manager",
    label: "Production manager",
    keywords: ["production manager", "unit manager"],
  },
];

export const JOB_EMPLOYMENT_CATEGORY_LABELS = JOB_EMPLOYMENT_CATEGORIES.map(
  (item) => item.label,
);

export const JOB_WORK_TYPE_LABELS = JOB_WORK_TYPES.map((item) => item.label);

export type JobPostingTypeId = "ROLE" | "SHOOT_CALL" | "QUICK_GIG";

export const JOB_POSTING_TYPES: {
  id: JobPostingTypeId;
  label: string;
  shortLabel: string;
  description: string;
}[] = [
  {
    id: "ROLE",
    label: "Traditional role",
    shortLabel: "Role",
    description:
      "Hire for an ongoing or project crew role — the classic jobs board listing.",
  },
  {
    id: "SHOOT_CALL",
    label: "Shoot call",
    shortLabel: "Shoot call",
    description:
      "Invite creatives to join a commercial, film, or branded production shoot.",
  },
  {
    id: "QUICK_GIG",
    label: "Quick gig",
    shortLabel: "Quick gig",
    description:
      "Need talent soon near a place and date — e.g. camera op in Addis tomorrow.",
  },
];

export const JOB_PRODUCTION_KIND_LABELS = [
  "Commercial",
  "Film",
  "Music video",
  "Documentary",
  "Branded content",
  "Event coverage",
  "Other",
] as const;

export function jobPostingTypeLabel(type: string | null | undefined): string {
  const id = String(type ?? "ROLE").toUpperCase() as JobPostingTypeId;
  return JOB_POSTING_TYPES.find((item) => item.id === id)?.shortLabel ?? "Role";
}

function jobSearchText(job: {
  title: string;
  description: string;
  modality: string | null;
  role_tag: string | null;
  skills?: string[] | null;
}): string {
  return [
    job.title,
    job.description,
    job.modality,
    job.role_tag,
    ...(job.skills ?? []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function jobMatchesFilterOption(
  job: {
    title: string;
    description: string;
    modality: string | null;
    role_tag: string | null;
  },
  option: JobFilterOption,
  field: "modality" | "role_tag",
): boolean {
  const fieldValue = job[field]?.trim().toLowerCase();
  const label = option.label.toLowerCase();

  if (fieldValue === label || fieldValue === option.id.replace(/-/g, " ")) {
    return true;
  }

  if (
    fieldValue &&
    option.keywords.some((keyword) => fieldValue.includes(keyword))
  ) {
    return true;
  }

  const haystack = jobSearchText(job);
  if (haystack.includes(label)) return true;

  return option.keywords.some((keyword) => haystack.includes(keyword));
}

export function countJobsForFilterOption(
  jobs: {
    title: string;
    description: string;
    modality: string | null;
    role_tag: string | null;
  }[],
  option: JobFilterOption,
  field: "modality" | "role_tag",
): number {
  return jobs.filter((job) => jobMatchesFilterOption(job, option, field))
    .length;
}
