import { WikiHistoryClient } from "@/components/forum/WikiHistoryClient";

type Props = { params: Promise<{ slug: string }> };

export default async function WikiHistoryPage({ params }: Props) {
  const { slug } = await params;
  return <WikiHistoryClient slug={slug} />;
}
