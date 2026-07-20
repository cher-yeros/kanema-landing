import Link from "next/link";
import { timeAgo } from "./forum-utils";

export type ThreadCardMedia = {
  id: string;
  kind: string;
  url: string;
};

export type ThreadCardData = {
  id: string;
  title: string;
  body_md?: string;
  score: number;
  reply_count: number;
  createdAt: string;
  is_featured?: boolean;
  author: { id: string; full_name: string };
  community: { slug: string; name: string; icon_url?: string | null };
  tags?: Array<{ slug: string; name: string }>;
  media?: ThreadCardMedia[];
};

function threadPreviewMedia(
  media: ThreadCardMedia[] | undefined,
): ThreadCardMedia | null {
  if (!media?.length) return null;
  return (
    media.find((item) => item.kind === "image") ??
    media.find((item) => item.kind === "video") ??
    null
  );
}

function ThreadCardMediaPreview({ media }: { media: ThreadCardMedia }) {
  if (media.kind === "image") {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={media.url} alt="" loading="lazy" />
    );
  }

  if (media.kind === "video") {
    return (
      <>
        <video
          src={media.url}
          muted
          playsInline
          preload="metadata"
          aria-hidden
        />
        <span className="forum-thread-card__media-play" aria-hidden>
          <i className="bi bi-play-fill" />
        </span>
      </>
    );
  }

  return null;
}

export function ThreadCard({ thread }: { thread: ThreadCardData }) {
  const excerpt = (thread.body_md ?? "").slice(0, 160);
  const previewMedia = threadPreviewMedia(thread.media);
  const threadHref = `/discussion/c/${thread.community.slug}/t/${thread.id}`;

  return (
    <article className="offering-block p-3 mb-3">
      <div className="d-flex gap-3">
        <div className="text-center pt-1" style={{ minWidth: 40 }}>
          <div className="fw-bold text-success">{thread.score}</div>
          <div className="small text-muted">votes</div>
        </div>
        <div className="flex-grow-1 min-w-0">
          <div className="d-flex flex-wrap gap-2 align-items-center mb-1 small text-muted">
            <span>
              {thread.community.icon_url} {thread.community.name}
            </span>
            <span>·</span>
            <span>{thread.author.full_name}</span>
            <span>·</span>
            <span>{timeAgo(thread.createdAt)}</span>
            {thread.is_featured ? (
              <span className="badge bg-warning text-dark">Featured</span>
            ) : null}
          </div>
          <h3 className="h5 mb-1">
            <Link
              href={threadHref}
              className="text-decoration-none forum-thread-title"
            >
              {thread.title}
            </Link>
          </h3>
          {excerpt ? <p className="small text-muted mb-2">{excerpt}…</p> : null}
          <div className="d-flex flex-wrap gap-2 align-items-center">
            {thread.tags?.map((t) => (
              <Link
                key={t.slug}
                href={`/discussion/tags/${t.slug}`}
                className="badge forum-tag-badge text-decoration-none"
              >
                {t.name}
              </Link>
            ))}
            <span className="small text-muted ms-auto">
              <i className="bi bi-chat me-1" />
              {thread.reply_count} replies
            </span>
          </div>
        </div>
        {previewMedia ? (
          <Link
            href={threadHref}
            className={`forum-thread-card__media${
              previewMedia.kind === "video"
                ? " forum-thread-card__media--video"
                : ""
            }`}
            aria-label={`View thread: ${thread.title}`}
            tabIndex={-1}
          >
            <ThreadCardMediaPreview media={previewMedia} />
          </Link>
        ) : null}
      </div>
    </article>
  );
}

export function ThreadList({ threads }: { threads: ThreadCardData[] }) {
  if (!threads.length) {
    return (
      <p className="text-muted text-center py-5">
        No discussions yet. Start the conversation!
      </p>
    );
  }
  return (
    <div>
      {threads.map((t) => (
        <ThreadCard key={t.id} thread={t} />
      ))}
    </div>
  );
}
