import type { Metadata } from "next";

import { CanmaAppProviders } from "@/components/providers/CanmaAppProviders";
import { BRAND_ALT, BRAND_LOGO_SQUARE } from "@/lib/brand-assets";
import { siteOrigin } from "@/lib/site-url";

import "./globals.css";

/** Google Fonts bundle (Roboto, Poppins) for the landing layout. */
const GOOGLE_FONTS_URL =
  "https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap";

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
