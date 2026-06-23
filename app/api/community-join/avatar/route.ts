import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";

import {
  getImageDimensionsFromBuffer,
  isSquareDimensions,
  squareImageErrorMessage,
} from "@/lib/image-dimensions";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

const IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

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

  const ext = path.extname(file.name) || ".jpg";
  const safeExt = ext.replace(/[^a-zA-Z0-9.]/g, "").slice(0, 8) || ".jpg";
  const filename = `${randomUUID()}${safeExt}`;
  const relDir = "uploads/community-avatars";
  const absDir = path.join(process.cwd(), "public", relDir);
  await mkdir(absDir, { recursive: true });

  await writeFile(path.join(absDir, filename), buffer);

  const origin = req.nextUrl.origin;
  const url = `${origin}/${relDir}/${filename}`;
  return NextResponse.json({ url });
}
