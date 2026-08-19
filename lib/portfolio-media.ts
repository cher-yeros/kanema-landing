import {
  parseYouTubeVideoId,
  toYouTubeEmbed,
  toYouTubeThumbnail,
} from "@/lib/media-embed";

export type PortfolioWorkType = "image" | "video";

export type PortfolioMediaItem = {
  kind: "youtube";
  url: string;
};

export function parsePortfolioYoutubeUrl(
  media_json: string | null | undefined,
): string | null {
  if (!media_json) return null;
  try {
    const media = JSON.parse(media_json) as Array<{
      kind?: string;
      url?: string;
    }>;
    const item = media.find(
      (entry) => entry.kind === "youtube" && entry.url?.trim(),
    );
    return item?.url?.trim() ?? null;
  } catch {
    return null;
  }
}

export function buildPortfolioMediaJson(youtubeUrl: string): string {
  return JSON.stringify([
    { kind: "youtube", url: youtubeUrl.trim() } satisfies PortfolioMediaItem,
  ]);
}

export function portfolioDisplayImage(project: {
  cover_url: string | null;
  media_json: string | null;
}): string | null {
  const youtubeUrl = parsePortfolioYoutubeUrl(project.media_json);
  if (youtubeUrl) {
    return toYouTubeThumbnail(youtubeUrl) ?? project.cover_url;
  }
  if (project.cover_url) return project.cover_url;
  if (!project.media_json) return null;
  try {
    const media = JSON.parse(project.media_json) as Array<{ url?: string }>;
    const first = media.find((item) => item.url);
    return first?.url ?? null;
  } catch {
    return null;
  }
}

export function portfolioYoutubeEmbed(
  media_json: string | null | undefined,
): string | null {
  const youtubeUrl = parsePortfolioYoutubeUrl(media_json);
  return youtubeUrl ? toYouTubeEmbed(youtubeUrl) : null;
}

export function isValidYouTubeUrl(url: string): boolean {
  return parseYouTubeVideoId(url) !== null;
}
