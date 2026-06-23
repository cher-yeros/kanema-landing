import * as yup from "yup";

/** Obscure name + ignore hints so browsers/password managers rarely autofill this honeypot. */
export const JOIN_COMMUNITY_HONEYPOT_FIELD = "kz_co_join_hp";

export const COMMUNITY_JOIN_INTEREST_OPTIONS: { id: string; label: string }[] =
  [
    { id: "acting", label: "Acting" },
    { id: "directing", label: "Directing" },
    { id: "cinematography", label: "Cinematography" },
    { id: "editing", label: "Editing" },
    { id: "sound", label: "Sound" },
    { id: "production", label: "Production" },
    { id: "writing", label: "Writing" },
    { id: "design", label: "Design" },
    { id: "music", label: "Music" },
    { id: "events", label: "Events / workshops" },
  ];

const INTEREST_IDS = COMMUNITY_JOIN_INTEREST_OPTIONS.map((o) => o.id);

const ROLE_VALUES = [
  "creative",
  "producer",
  "business",
  "student",
  "volunteer",
  "other",
] as const;

export const joinCommunityFormSchema = yup.object({
  [JOIN_COMMUNITY_HONEYPOT_FIELD]: yup.string().default(""),
  fullName: yup.string().trim().required("Please provide your full name."),
  email: yup
    .string()
    .trim()
    .required("Please provide your email.")
    .email("Please enter a valid email address."),
  phone: yup
    .string()
    .trim()
    .required("Please provide your phone number.")
    .min(9, "Enter a valid phone number."),
  password: yup
    .string()
    .required("Please choose a password.")
    .min(8, "Password must be at least 8 characters."),
  confirmPassword: yup
    .string()
    .required("Please confirm your password.")
    .oneOf([yup.ref("password")], "Passwords must match."),
  city: yup.string().trim().default(""),
  role: yup
    .string()
    .oneOf([...ROLE_VALUES], "Select a role.")
    .required("Select a role."),
  interests: yup.array().of(yup.string().oneOf(INTEREST_IDS)).default([]),
  portfolioUrl: yup
    .string()
    .trim()
    .default("")
    .test(
      "optional-url",
      "Please enter a valid URL.",
      (v) => !v || /^https?:\/\/[^\s]+$/.test(v),
    ),
  message: yup.string().trim().default(""),
  avatarUrl: yup.string().trim().default(""),
});

export type JoinCommunityFormValues = yup.InferType<
  typeof joinCommunityFormSchema
>;

export const joinCommunityFormDefaultValues: JoinCommunityFormValues = {
  [JOIN_COMMUNITY_HONEYPOT_FIELD]: "",
  fullName: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  city: "",
  role: "creative",
  interests: [],
  portfolioUrl: "",
  message: "",
  avatarUrl: "",
};
