import { PublicUserProfileClient } from "@/components/forum/PublicUserProfileClient";

type Props = { params: Promise<{ userId: string }> };

export default async function ForumUserPage({ params }: Props) {
  const { userId } = await params;
  return <PublicUserProfileClient userId={userId} />;
}
