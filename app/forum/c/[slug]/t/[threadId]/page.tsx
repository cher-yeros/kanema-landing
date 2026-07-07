import { notFound } from "next/navigation";
import { fetchForumThread } from "@/lib/forum-public";
import { ThreadDetailClient } from "@/components/forum/ThreadDetailClient";

type Props = { params: Promise<{ slug: string; threadId: string }> };

export default async function ThreadPage({ params }: Props) {
  const { slug, threadId } = await params;
  let thread: Awaited<ReturnType<typeof fetchForumThread>> = null;
  try {
    thread = await fetchForumThread(threadId);
  } catch {
    /* ignore */
  }
  if (!thread || thread.community.slug !== slug) notFound();

  return <ThreadDetailClient threadId={threadId} communitySlug={slug} />;
}
