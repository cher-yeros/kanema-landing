import type { Metadata } from "next";
import { OpenAppClient } from "@/components/open/OpenAppClient";
import { sanitizeOpenPath } from "@/lib/app-links";
import { absoluteSiteUrl } from "@/lib/site-url";

export const metadata: Metadata = {
  title: "Open in Canma",
  robots: { index: false, follow: false },
};

type Props = {
  searchParams: Promise<{ path?: string }>;
};

export default async function OpenInAppPage({ searchParams }: Props) {
  const params = await searchParams;
  const path = sanitizeOpenPath(params.path) ?? "/";
  const webUrl = absoluteSiteUrl(path);

  return (
    <main className="container py-5" style={{ maxWidth: 520 }}>
      <OpenAppClient path={path} webUrl={webUrl} />
    </main>
  );
}
