"use client";

import { useId, useRef, useState } from "react";

type ProfilePictureUploadProps = {
  value: string | null;
  onChange: (url: string | null) => void;
  disabled?: boolean;
  error?: string | null;
};

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

  const displayError = error ?? uploadError;

  async function onFile(file: File | null) {
    if (!file) return;
    setUploadError(null);

    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);
    setUploading(true);

    try {
      const fd = new FormData();
      fd.set("file", file);
      const res = await fetch("/api/community-join/avatar", {
        method: "POST",
        body: fd,
      });
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
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function clearPhoto() {
    setUploadError(null);
    setPreview(null);
    onChange(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
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
              <i className="bi bi-person-fill" style={{ fontSize: "1.75rem" }} />
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
            {uploading ? "Uploading…" : preview ? "Change photo" : "Upload photo"}
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
          onChange={(e) => void onFile(e.target.files?.[0] ?? null)}
        />
      </div>
      <p className="small text-secondary mb-0 mt-2">
        JPEG, PNG, WebP, or GIF · max 5 MB
      </p>
      {displayError ? (
        <div className="invalid-feedback d-block">{displayError}</div>
      ) : null}
    </div>
  );
}
