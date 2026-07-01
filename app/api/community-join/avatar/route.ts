import { NextRequest, NextResponse } from "next/server";

import { canmaApiBaseUrl } from "@/lib/graphql-env";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  try {
    const res = await fetch(`${canmaApiBaseUrl()}/uploads/community-avatar`, {
      method: "POST",
      body: formData,
      cache: "no-store",
    });

    const json = (await res.json()) as { url?: string; error?: string };
    return NextResponse.json(json, { status: res.status });
  } catch (error) {
    console.error("Avatar upload proxy failed:", error);
    return NextResponse.json(
      { error: "Upload service unavailable. Try again later." },
      { status: 500 },
    );
  }
}
