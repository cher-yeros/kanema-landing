"use client";

import { useId, useRef, useState } from "react";
import { forumMediaUploadUrl } from "@/lib/graphql-env";
import { useForumToast } from "@/components/forum/ForumToast";

export type ForumMediaAttachment = {
  kind: string;
  url: string;
  meta_json?: string;
  name?: string;
};

const ACCEPT =
  "image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime,video/x-msvideo,video/ogg,application/pdf,application/zip,application/x-zip-compressed,.mp4,.webm,.mov,.avi,.zip,.pdf,.txt";

const MAX_FILES = 6;

function attachmentIcon(kind: string): string {
  if (kind === "image") return "bi-image";
  if (kind === "video") return "bi-camera-video";
  return "bi-file-earmark-text";
}

function fileLabel(item: ForumMediaAttachment): string {
  if (item.name) return item.name;
  try {
    const meta = item.meta_json ? JSON.parse(item.meta_json) : null;
    if (meta && typeof meta.filename === "string") return meta.filename;
  } catch {
    /* ignore */
  }
  if (item.kind === "image") return "Image";
  if (item.kind === "video") return "Video";
  return "Attachment";
}

type ForumMediaUploadFieldProps = {
  value: ForumMediaAttachment[];
  onChange: (items: ForumMediaAttachment[]) => void;
  disabled?: boolean;
};

export function ForumMediaUploadField({
  value,
  onChange,
  disabled = false,
}: ForumMediaUploadFieldProps) {
  const inputId = useId();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const { showError } = useForumToast();

  async function onFiles(fileList: FileList | null) {
    if (!fileList?.length || disabled) return;
    const remaining = MAX_FILES - value.length;
    if (remaining <= 0) {
      showError(`You can attach up to ${MAX_FILES} files.`);
      return;
    }

    const files = Array.from(fileList).slice(0, remaining);
    setUploading(true);

    try {
      const uploaded: ForumMediaAttachment[] = [];
      for (const file of files) {
        const fd = new FormData();
        fd.set("file", file);
        const res = await fetch(forumMediaUploadUrl(), {
          method: "POST",
          body: fd,
        });
        const json = (await res.json()) as {
          url?: string;
          kind?: string;
          error?: string;
        };
        if (!res.ok || !json.url || !json.kind) {
          throw new Error(json.error ?? `Could not upload ${file.name}`);
        }
        uploaded.push({
          kind: json.kind,
          url: json.url,
          name: file.name,
          meta_json: JSON.stringify({
            filename: file.name,
            size: file.size,
            mime: file.type || undefined,
          }),
        });
      }
      onChange([...value, ...uploaded]);
    } catch (err) {
      showError(
        err instanceof Error ? err.message : "Could not upload attachment.",
      );
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function removeAt(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  return (
    <div className="col-12">
      <label className="form-label" htmlFor={inputId}>
        Attachments (optional)
      </label>
      <p className="small text-muted mb-2">
        Images (up to 10 MB), videos (MP4, WebM, MOV up to 50 MB), or documents
        (PDF, ZIP up to 25 MB).
      </p>

      {value.length > 0 ? (
        <ul className="list-unstyled d-flex flex-column gap-2 mb-3">
          {value.map((item, index) => (
            <li
              key={`${item.url}-${index}`}
              className="forum-media-attachment d-flex align-items-center gap-3 p-2 rounded"
            >
              {item.kind === "image" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.url}
                  alt=""
                  className="forum-media-attachment__thumb"
                />
              ) : item.kind === "video" ? (
                <video
                  src={item.url}
                  className="forum-media-attachment__thumb"
                  muted
                  playsInline
                  preload="metadata"
                />
              ) : (
                <span className="forum-media-attachment__icon" aria-hidden>
                  <i className={`bi ${attachmentIcon(item.kind)}`} />
                </span>
              )}
              <span className="small flex-grow-1 text-truncate">
                {fileLabel(item)}
              </span>
              <button
                type="button"
                className="btn btn-sm btn-ghost"
                disabled={disabled || uploading}
                onClick={() => removeAt(index)}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <input
        ref={fileRef}
        id={inputId}
        type="file"
        className="d-none"
        accept={ACCEPT}
        multiple
        disabled={disabled || uploading || value.length >= MAX_FILES}
        onChange={(e) => void onFiles(e.target.files)}
      />
      <button
        type="button"
        className="btn btn-ghost btn-sm"
        disabled={disabled || uploading || value.length >= MAX_FILES}
        onClick={() => fileRef.current?.click()}
      >
        <i className="bi bi-paperclip" />
        {uploading ? "Uploading…" : "Add files"}
      </button>
    </div>
  );
}

export function ForumMediaGallery({
  media,
}: {
  media: Array<{
    id: string;
    kind: string;
    url: string;
    meta_json?: string | null;
  }>;
}) {
  if (!media.length) return null;

  return (
    <div className="forum-media-gallery d-flex flex-wrap gap-3 mt-3">
      {media.map((item) => {
        const label = fileLabel({
          kind: item.kind,
          url: item.url,
          meta_json: item.meta_json ?? undefined,
        });
        if (item.kind === "image") {
          return (
            <a
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="forum-media-gallery__image"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.url} alt={label} />
            </a>
          );
        }
        if (item.kind === "video") {
          return (
            <div key={item.id} className="forum-media-gallery__video">
              <video src={item.url} controls playsInline preload="metadata" />
              <span className="small text-muted d-block mt-1">{label}</span>
            </div>
          );
        }
        return (
          <a
            key={item.id}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="forum-media-gallery__doc offering-block p-2 px-3 text-decoration-none small"
          >
            <i className="bi bi-download me-2" />
            {label}
          </a>
        );
      })}
    </div>
  );
}
