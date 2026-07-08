"use client";

import { cropImageToSquareFile } from "@/lib/crop-image";
import { communityAvatarUploadUrl } from "@/lib/graphql-env";
import { useId, useRef, useState } from "react";
import type { Area } from "react-easy-crop";

import { SquarePhotoCropModal } from "./SquarePhotoCropModal";

type ProfilePictureUploadProps = {
  value: string | null;
  onChange: (url: string | null) => void;
  disabled?: boolean;
  error?: string | null;
};

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export function ProfilePictureUpload({
  value,
  onChange,
  disabled = false,
  error,
}: ProfilePictureUploadProps) {
  const inputId = useId();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(value);
  const [cropSource, setCropSource] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const displayError = error ?? uploadError;

  function resetCropState() {
    if (cropSource?.startsWith("blob:")) URL.revokeObjectURL(cropSource);
    setCropSource(null);
    setPendingFile(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  function onFileSelected(file: File | null) {
    if (!file) return;
    setUploadError(null);

    if (file.size > MAX_IMAGE_BYTES) {
      setUploadError("File too large (max 5 MB).");
      if (fileRef.current) fileRef.current.value = "";
      return;
    }

    const localPreview = URL.createObjectURL(file);
    setPendingFile(file);
    setCropSource(localPreview);
  }

  function onCropCancel() {
    resetCropState();
  }

  async function uploadCroppedFile(file: File) {
    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);
    setUploading(true);

    try {
      const buildFormData = () => {
        const fd = new FormData();
        fd.set("file", file);
        return fd;
      };

      let res: Response;
      try {
        res = await fetch(communityAvatarUploadUrl(), {
          method: "POST",
          body: buildFormData(),
        });
        if (res.status === 404 || res.status === 405) {
          res = await fetch("/api/community-join/avatar", {
            method: "POST",
            body: buildFormData(),
          });
        }
      } catch {
        res = await fetch("/api/community-join/avatar", {
          method: "POST",
          body: buildFormData(),
        });
      }

      const json = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !json.url) {
        throw new Error(json.error ?? "Upload failed");
      }
      if (localPreview.startsWith("blob:")) URL.revokeObjectURL(localPreview);
      setPreview(json.url);
      onChange(json.url);
    } catch (err) {
      if (localPreview.startsWith("blob:")) URL.revokeObjectURL(localPreview);
      setPreview(value);
      setUploadError(
        err instanceof Error ? err.message : "Could not upload photo.",
      );
      onChange(null);
    } finally {
      setUploading(false);
      resetCropState();
    }
  }

  async function onCropConfirm(croppedAreaPixels: Area) {
    if (!pendingFile || !cropSource) return;

    setUploading(true);
    setUploadError(null);

    try {
      const croppedFile = await cropImageToSquareFile(
        cropSource,
        croppedAreaPixels,
        pendingFile,
      );

      if (croppedFile.size > MAX_IMAGE_BYTES) {
        throw new Error(
          "Cropped image is too large (max 5 MB). Try zooming in.",
        );
      }

      if (cropSource.startsWith("blob:")) URL.revokeObjectURL(cropSource);
      setCropSource(null);
      setPendingFile(null);

      await uploadCroppedFile(croppedFile);
    } catch (err) {
      setUploading(false);
      setUploadError(
        err instanceof Error ? err.message : "Could not crop photo.",
      );
      resetCropState();
    }
  }

  function clearPhoto() {
    setUploadError(null);
    setPreview(null);
    onChange(null);
    resetCropState();
  }

  return (
    <>
      <div>
        <span className="form-label d-block">Profile picture (optional)</span>
        <div className="d-flex align-items-center gap-3 flex-wrap">
          <div
            className="rounded-circle overflow-hidden border bg-light flex-shrink-0"
            style={{ width: 72, height: 72 }}
          >
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={preview}
                alt=""
                className="w-100 h-100"
                style={{ objectFit: "cover" }}
              />
            ) : (
              <div
                className="w-100 h-100 d-flex align-items-center justify-content-center text-secondary"
                aria-hidden
              >
                <i
                  className="bi bi-person-fill"
                  style={{ fontSize: "1.75rem" }}
                />
              </div>
            )}
          </div>

          <div className="d-flex flex-wrap gap-2">
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              disabled={disabled || uploading}
              onClick={() => fileRef.current?.click()}
            >
              {uploading
                ? "Uploading…"
                : preview
                  ? "Change photo"
                  : "Upload photo"}
            </button>
            {preview ? (
              <button
                type="button"
                className="btn btn-outline-danger btn-sm"
                disabled={disabled || uploading}
                onClick={clearPhoto}
              >
                Remove
              </button>
            ) : null}
          </div>

          <input
            id={inputId}
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="visually-hidden"
            disabled={disabled || uploading}
            onChange={(e) => onFileSelected(e.target.files?.[0] ?? null)}
          />
        </div>
        <p className="small text-secondary mb-0 mt-2">
          Any photo can be cropped to square · JPEG, PNG, WebP, or GIF · max 5
          MB
        </p>
        {displayError ? (
          <div className="invalid-feedback d-block">{displayError}</div>
        ) : null}
      </div>

      <SquarePhotoCropModal
        open={Boolean(cropSource && pendingFile)}
        imageSrc={cropSource ?? ""}
        loading={uploading}
        onCancel={onCropCancel}
        onConfirm={(area) => void onCropConfirm(area)}
      />
    </>
  );
}
