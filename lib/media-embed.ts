export function parseYouTubeVideoId(url: string): string | null {
  try {
    const u = new URL(url.trim());
    if (u.hostname.includes("youtu.be")) {
      const id = u.pathname.replace(/^\//, "").split("/")[0];
      return id || null;
    }
    if (u.hostname.includes("youtube.com")) {
      const v = u.searchParams.get("v");
      if (v) return v;
      const parts = u.pathname.split("/").filter(Boolean);
      const embedIdx = parts.indexOf("embed");
      if (embedIdx >= 0 && parts[embedIdx + 1]) return parts[embedIdx + 1];
      const shortsIdx = parts.indexOf("shorts");
      if (shortsIdx >= 0 && parts[shortsIdx + 1]) return parts[shortsIdx + 1];
    }
  } catch {
    return null;
  }
  return null;
}

export function toYouTubeEmbed(url: string): string | null {
  const id = parseYouTubeVideoId(url);
  return id ? `https://www.youtube.com/embed/${id}` : null;
}

export function toYouTubeThumbnail(url: string): string | null {
  const id = parseYouTubeVideoId(url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
}

export function toVimeoEmbed(url: string): string | null {
  try {
    const u = new URL(url);
    if (!u.hostname.includes("vimeo.com")) return null;
    const parts = u.pathname.split("/").filter(Boolean);
    const id = parts[parts.length - 1];
    return id && /^\d+$/.test(id)
      ? `https://player.vimeo.com/video/${id}`
      : null;
  } catch {
    return null;
  }
}

export function formatLessonDuration(
  seconds: number | null | undefined,
): string | null {
  if (seconds == null || seconds <= 0) return null;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m <= 0) return `${s}s`;
  return s > 0 ? `${m}m ${s}s` : `${m} min`;
}

export function lessonTypeIcon(type: string): string {
  switch (type.toUpperCase()) {
    case "VIDEO":
      return "bi-play-circle";
    case "DOCUMENT":
      return "bi-file-earmark-pdf";
    case "AUDIO":
      return "bi-music-note-beamed";
    case "IMAGE":
      return "bi-image";
    case "LINK":
      return "bi-link-45deg";
    default:
      return "bi-journal-text";
  }
}
