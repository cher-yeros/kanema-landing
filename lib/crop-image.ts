import type { Area } from "react-easy-crop";

const MAX_OUTPUT_PX = 1024;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener("load", () => resolve(img));
    img.addEventListener("error", () =>
      reject(new Error("Could not load image.")),
    );
    img.src = src;
  });
}

function outputMimeType(sourceMime: string): string {
  if (sourceMime === "image/png") return "image/png";
  if (sourceMime === "image/webp") return "image/webp";
  return "image/jpeg";
}

function outputExtension(mime: string): string {
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  return "jpg";
}

export async function cropImageToSquareFile(
  imageSrc: string,
  pixelCrop: Area,
  sourceFile: File,
): Promise<File> {
  const image = await loadImage(imageSrc);
  const mime = outputMimeType(sourceFile.type);
  const scale = Math.min(
    1,
    MAX_OUTPUT_PX / Math.max(pixelCrop.width, pixelCrop.height),
  );
  const width = Math.max(1, Math.round(pixelCrop.width * scale));
  const height = Math.max(1, Math.round(pixelCrop.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not prepare image crop.");

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    width,
    height,
  );

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => {
        if (result) resolve(result);
        else reject(new Error("Could not crop image."));
      },
      mime,
      mime === "image/jpeg" ? 0.92 : undefined,
    );
  });

  const baseName = sourceFile.name.replace(/\.[^.]+$/, "") || "avatar";
  return new File([blob], `${baseName}.${outputExtension(mime)}`, {
    type: mime,
    lastModified: Date.now(),
  });
}
