import WikiEditPageClient from "@/components/forum/WikiEditPageClient";

type Props = { params: Promise<{ slug: string }> };

export default async function WikiEditPage({ params }: Props) {
  const { slug } = await params;
  return <WikiEditPageClient slug={slug} />;
}
