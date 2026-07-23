import type { Metadata } from "next";

import { CanmaAppProviders } from "@/components/providers/CanmaAppProviders";
import { BRAND_ALT, BRAND_LOGO_SQUARE } from "@/lib/brand-assets";
import { siteOrigin } from "@/lib/site-url";

import "./globals.css";

/** Google Fonts bundle (Space Grotesk, DM Sans) for the landing layout. */
const GOOGLE_FONTS_URL =
  "https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=Space+Grotesk:wght@300..700&display=swap";

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin()),
  title: "Canma — Ethiopian Visual Storytellers",
  description:
    "The official digital hub for Ethiopian photographers, videographers, and filmmakers—visibility, opportunities, and community.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  themeColor: "#061428",
  openGraph: {
    title: "Canma — Ethiopian Visual Storytellers",
    description:
      "The official digital hub for Ethiopian photographers, videographers, and filmmakers—visibility, opportunities, and community.",
    images: [
      {
        url: BRAND_LOGO_SQUARE,
        width: 512,
        height: 512,
        alt: BRAND_ALT,
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link href={GOOGLE_FONTS_URL} rel="stylesheet" />
      </head>
      <body className="index-page">
        <CanmaAppProviders>{children}</CanmaAppProviders>
      </body>
    </html>
  );
}
