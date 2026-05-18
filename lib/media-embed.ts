export function toYouTubeEmbed(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) {
      const id = u.pathname.replace("/", "");
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (u.hostname.includes("youtube.com")) {
      const v = u.searchParams.get("v");
      return v ? `https://www.youtube.com/embed/${v}` : null;
    }
  } catch {
    return null;
  }
  return null;
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
