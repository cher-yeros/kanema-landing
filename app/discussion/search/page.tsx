import { ForumSearchClient } from "@/components/forum/ForumSearchClient";

type Props = { searchParams: Promise<{ q?: string; sort?: string }> };

export default async function ForumSearchPage({ searchParams }: Props) {
  const sp = await searchParams;
  return (
    <ForumSearchClient initialQuery={sp.q ?? ""} initialSort={sp.sort ?? ""} />
  );
}
