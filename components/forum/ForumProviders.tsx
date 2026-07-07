"use client";

import { ForumToastProvider } from "@/components/forum/ForumToast";

export function ForumProviders({ children }: { children: React.ReactNode }) {
  return <ForumToastProvider>{children}</ForumToastProvider>;
}
