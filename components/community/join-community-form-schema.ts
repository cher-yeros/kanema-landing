import * as yup from "yup";

import { isValidEthiopiaLocalPhone } from "@/lib/ethiopia-phone";

/** Obscure name + ignore hints so browsers/password managers rarely autofill this honeypot. */
export const JOIN_COMMUNITY_HONEYPOT_FIELD = "kz_co_join_hp";

const ROLE_VALUES = [
  "creative",
  "producer",
  "business",
  "student",
  "volunteer",
  "other",
] as const;

export function createJoinCommunityFormSchema(interestIds: string[]) {
  return yup.object({
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
      .test(
        "ethiopia-mobile",
        "Enter a valid 9-digit mobile number starting with 9 or 7.",
        (value) => !value || isValidEthiopiaLocalPhone(value),
      ),
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
    interests: yup.array().of(yup.string().oneOf(interestIds)).default([]),
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
    avatarUrl: yup.string().trim().required("Please upload a profile picture."),
  });
}

export type JoinCommunityFormValues = yup.InferType<
  ReturnType<typeof createJoinCommunityFormSchema>
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
