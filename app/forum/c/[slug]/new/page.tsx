import { fetchForumCommunity } from "@/lib/forum-public";
import { notFound } from "next/navigation";
import { ThreadComposer } from "@/components/forum/ThreadComposer";
import { ForumPageShell } from "@/components/forum/ForumPageShell";

type Props = { params: Promise<{ slug: string }> };

export default async function NewThreadPage({ params }: Props) {
  const { slug } = await params;
  let community: Awaited<ReturnType<typeof fetchForumCommunity>> = null;
  try {
    community = await fetchForumCommunity(slug);
  } catch {
    /* ignore */
  }
  if (!community) notFound();

  return (
    <ForumPageShell
      title="New discussion"
      description={
        <>
          Post in <strong>{community.name}</strong>
        </>
      }
      backHref={`/forum/c/${slug}`}
      backLabel={community.name}
      narrow
    >
      <ThreadComposer
        communityId={community.id}
        communitySlug={community.slug}
        communityName={community.name}
        categories={community.categories}
      />
    </ForumPageShell>
  );
}
