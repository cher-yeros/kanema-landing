import { SITE_CONTACT } from "@/lib/site-contact";

export const LEGAL_EFFECTIVE_DATE = "8 November 2026";

export const LEGAL_OPERATOR = {
  brand: "Canma",
  entity: "Canma (ካንማ)",
  location: SITE_CONTACT.location,
  privacyEmail: SITE_CONTACT.emails[0],
  supportEmail: SITE_CONTACT.emails[0],
  phoneDisplay: SITE_CONTACT.phone.display,
  phoneHref: SITE_CONTACT.phone.href,
} as const;
