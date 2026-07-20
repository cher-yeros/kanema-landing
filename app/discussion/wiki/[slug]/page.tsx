import { WikiArticleClient } from "@/components/forum/WikiArticleClient";

type Props = { params: Promise<{ slug: string }> };

export default async function WikiArticlePage({ params }: Props) {
  const { slug } = await params;
  return <WikiArticleClient slug={slug} />;
}
