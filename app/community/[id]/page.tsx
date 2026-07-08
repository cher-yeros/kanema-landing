import { notFound } from "next/navigation";

import {
  LandingProvidersClient,
  SiteFooter,
  SiteHeader,
} from "@/components/landing";
import { ScrollTop } from "@/components/landing/ScrollTop";
import { CommunityMemberProfileClient } from "@/components/community/CommunityMemberProfileClient";
import {
  fetchCommunityMember,
  fetchUserPortfolioProjects,
} from "@/lib/public-graphql";

import "./community-member.css";

export const dynamic = "force-dynamic";

export default async function CommunityMemberPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const member = await fetchCommunityMember(id).catch(() => null);
  if (!member) notFound();

  const projects = member.user_id
    ? await fetchUserPortfolioProjects(member.user_id).catch(() => [])
    : [];

  return (
    <>
      <LandingProvidersClient />
      <SiteHeader />
      <main className="main community-member-page">
        <CommunityMemberProfileClient member={member} projects={projects} />
      </main>
      <SiteFooter />
      <ScrollTop />
    </>
  );
}
