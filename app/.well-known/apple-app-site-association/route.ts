import { NextResponse } from "next/server";
import { APPLE_TEAM_ID, IOS_BUNDLE_ID } from "@/lib/app-links";

export const dynamic = "force-static";

export function GET() {
  const appID = APPLE_TEAM_ID
    ? `${APPLE_TEAM_ID}.${IOS_BUNDLE_ID}`
    : IOS_BUNDLE_ID;

  const body = {
    applinks: {
      apps: [],
      details: [
        {
          appID,
          paths: [
            "/marketplace/*",
            "/jobs/*",
            "/open",
            "/open/*",
            "/channels/*",
            "/forum/*",
            "/community/*",
            "/events/*",
            "/learn/*",
          ],
        },
      ],
    },
  };

  return new NextResponse(JSON.stringify(body), {
    headers: {
      "Cache-Control": "public, max-age=3600",
      // Apple requires this content type (no .json extension on the path).
      "Content-Type": "application/json",
    },
  });
}
