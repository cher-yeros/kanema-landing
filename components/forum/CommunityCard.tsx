import Link from "next/link";
import type { ForumCommunityPublic } from "@/lib/forum-public";

export function CommunityCard({
  community,
}: {
  community: ForumCommunityPublic;
}) {
  return (
    <Link
      href={`/discussion/c/${community.slug}`}
      className="offering-block p-3 text-decoration-none d-block h-100 forum-community-card"
    >
      <div className="d-flex align-items-start gap-3">
        <span className="fs-2" aria-hidden>
          {community.icon_url ?? "💬"}
        </span>
        <div>
          <h3 className="h6 mb-1">{community.name}</h3>
          <p className="small text-muted mb-2 line-clamp-2">
            {community.description ?? "Join the discussion"}
          </p>
          <span className="small text-muted">
            {community.member_count.toLocaleString()} members
          </span>
        </div>
      </div>
    </Link>
  );
}

export function CommunityGrid({
  communities,
}: {
  communities: ForumCommunityPublic[];
}) {
  return (
    <div className="row g-3">
      {communities.map((c) => (
        <div key={c.id} className="col-md-6 col-lg-4">
          <CommunityCard community={c} />
        </div>
      ))}
    </div>
  );
}
