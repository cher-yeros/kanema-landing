import { NextRequest, NextResponse } from "next/server";

import {
  getImageDimensionsFromBuffer,
  isSquareDimensions,
  squareImageErrorMessage,
} from "@/lib/image-dimensions";
import { communityAvatarBase64UploadUrl } from "@/lib/graphql-env";

export const runtime = "nodejs";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

const IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

async function readUploadResponse(res: Response): Promise<{
  status: number;
  body: { url?: string; error?: string };
}> {
  const text = await res.text();
  try {
    return {
      status: res.status,
      body: JSON.parse(text) as { url?: string; error?: string },
    };
  } catch {
    return {
      status: res.status >= 400 ? res.status : 502,
      body: {
        error:
          text.trim().slice(0, 200) ||
          "Upload service returned an invalid response.",
      },
    };
  }
}

export async function POST(req: NextRequest) {
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (!IMAGE_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: `Unsupported file type: ${file.type || "unknown"}` },
      { status: 400 },
    );
  }

  if (file.size > MAX_IMAGE_BYTES) {
    return NextResponse.json(
      { error: "File too large (max 5 MB)" },
      { status: 400 },
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const dimensions = getImageDimensionsFromBuffer(buffer);
  if (!dimensions) {
    return NextResponse.json(
      { error: "Could not read image dimensions." },
      { status: 400 },
    );
  }
  if (!isSquareDimensions(dimensions.width, dimensions.height)) {
    return NextResponse.json(
      {
        error: squareImageErrorMessage(dimensions.width, dimensions.height),
      },
      { status: 400 },
    );
  }

  try {
    const res = await fetch(communityAvatarBase64UploadUrl(), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        data: buffer.toString("base64"),
        filename: file.name,
        mimeType: file.type,
      }),
      cache: "no-store",
    });

    const { status, body } = await readUploadResponse(res);
    return NextResponse.json(body, { status });
  } catch (error) {
    console.error("Avatar upload proxy failed:", error);
    return NextResponse.json(
      { error: "Upload service unavailable. Try again later." },
      { status: 500 },
    );
  }
}
