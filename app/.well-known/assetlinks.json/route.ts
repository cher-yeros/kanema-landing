import { NextResponse } from "next/server";
import {
  ANDROID_APPLICATION_ID,
  ANDROID_SHA256_FINGERPRINTS,
} from "@/lib/app-links";

export const dynamic = "force-static";

export function GET() {
  const body = [
    {
      relation: ["delegate_permission/common.handle_all_urls"],
      target: {
        namespace: "android_app",
        package_name: ANDROID_APPLICATION_ID,
        sha256_cert_fingerprints: ANDROID_SHA256_FINGERPRINTS,
      },
    },
  ];

  return NextResponse.json(body, {
    headers: {
      "Cache-Control": "public, max-age=3600",
      "Content-Type": "application/json",
    },
  });
}
