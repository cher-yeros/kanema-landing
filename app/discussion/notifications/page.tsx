import { NotificationsPageClient } from "@/components/forum/NotificationBell";
import { ForumPageShell } from "@/components/forum/ForumPageShell";

export default function NotificationsPage() {
  return (
    <ForumPageShell
      title="Notifications"
      description="Stay up to date on replies, mentions, and badge awards."
      backHref="/discussion"
      backLabel="Back to discussion"
      narrow
    >
      <NotificationsPageClient />
    </ForumPageShell>
  );
}
