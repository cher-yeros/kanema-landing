import * as yup from "yup";

import { isValidEthiopiaLocalPhone } from "@/lib/ethiopia-phone";
import { COMMUNITY_JOIN_INTEREST_OPTIONS } from "@/components/community/join-community-form-schema";

const INTEREST_IDS = COMMUNITY_JOIN_INTEREST_OPTIONS.map((o) => o.id);

const ROLE_VALUES = [
  "creative",
  "producer",
  "business",
  "student",
  "volunteer",
  "other",
] as const;

export const profileIdentityEditorSchema = yup.object({
  fullName: yup.string().trim().required("Please provide your full name."),
  phone: yup
    .string()
    .trim()
    .required("Please provide your phone number.")
    .test(
      "ethiopia-mobile",
      "Enter a valid 9-digit mobile number starting with 9 or 7.",
      (value) => !value || isValidEthiopiaLocalPhone(value),
    ),
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

export type ProfileIdentityEditorValues = {
  fullName: string;
  phone: string;
  city: string;
  role: (typeof ROLE_VALUES)[number];
  interests: string[];
  portfolioUrl: string;
  message: string;
  avatarUrl: string;
};

export const COMMUNITY_JOIN_ROLE_GRAPHQL: Record<string, string> = {
  creative: "CREATIVE",
  producer: "PRODUCER",
  business: "BUSINESS",
  student: "STUDENT",
  volunteer: "VOLUNTEER",
  other: "OTHER",
};

export const COMMUNITY_JOIN_ROLE_FROM_GRAPHQL: Record<
  string,
  ProfileIdentityEditorValues["role"]
> = {
  CREATIVE: "creative",
  PRODUCER: "producer",
  BUSINESS: "business",
  STUDENT: "student",
  VOLUNTEER: "volunteer",
  OTHER: "other",
};

export function mapCommunityJoinRole(role: string): string {
  const key = role.trim().toLowerCase();
  return COMMUNITY_JOIN_ROLE_GRAPHQL[key] ?? "OTHER";
}
