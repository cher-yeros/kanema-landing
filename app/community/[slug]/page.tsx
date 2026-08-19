import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import {
  LandingProvidersClient,
  SiteFooter,
  SiteHeader,
} from "@/components/landing";
import { ScrollTop } from "@/components/landing/ScrollTop";
import { CommunityMemberProfileClient } from "@/components/community/CommunityMemberProfileClient";
import { communityRoleLabel } from "@/lib/community-member-labels";
import { memberImageSrc } from "@/lib/member-image";
import {
  fetchCommunityMember,
  fetchCommunityMemberBySlug,
  fetchPublicUserProfile,
  fetchUserPortfolioProjects,
  type PublicCommunityMember,
} from "@/lib/public-graphql";
import {
  absoluteMediaUrl,
  absoluteSiteUrl,
  communityMemberPath,
  isUuid,
} from "@/lib/site-url";

import "../community-member.css";

export const dynamic = "force-dynamic";

async function resolveCommunityMember(
  slugOrId: string,
): Promise<PublicCommunityMember | null> {
  if (isUuid(slugOrId)) {
    return fetchCommunityMember(slugOrId).catch(() => null);
  }
  return fetchCommunityMemberBySlug(slugOrId).catch(() => null);
}

function memberDescription(member: PublicCommunityMember): string {
  const trimmedMessage = member.message?.trim();
  if (trimmedMessage) return trimmedMessage;

  const role = communityRoleLabel(member.role);
  const location = member.city?.trim();
  return location
    ? `${member.full_name} — ${role} in ${location} on Canma.`
    : `${member.full_name} — ${role} on Canma.`;
}

function memberOgImage(member: PublicCommunityMember): string {
  return absoluteMediaUrl(memberImageSrc(member.avatar_url));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const member = await resolveCommunityMember(slug);
  if (!member) {
    return { title: "Member not found — Canma" };
  }

  const canonicalSlug = member.slug;
  const title = `${member.full_name} — Canma Community`;
  const description = memberDescription(member);
  const ogImage = memberOgImage(member);
  const profileUrl = absoluteSiteUrl(communityMemberPath(canonicalSlug));

  return {
    title,
    description,
    alternates: { canonical: profileUrl },
    openGraph: {
      title,
      description,
      url: profileUrl,
      type: "profile",
      images: [
        {
          url: ogImage,
          alt: `${member.full_name} profile photo`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function CommunityMemberPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const member = await resolveCommunityMember(slug);
  if (!member) notFound();

  if (isUuid(slug) && member.slug && member.slug !== slug) {
    redirect(communityMemberPath(member.slug));
  }

  const projects = member.user_id
    ? await fetchUserPortfolioProjects(member.user_id).catch(() => [])
    : [];

  const forumProfile = member.user_id
    ? await fetchPublicUserProfile(member.user_id).catch(() => null)
    : null;

  return (
    <>
      <LandingProvidersClient />
      <SiteHeader />
      <main className="main community-member-page">
        <CommunityMemberProfileClient
          member={member}
          projects={projects}
          forumProfile={forumProfile}
        />
      </main>
      <SiteFooter />
      <ScrollTop />
    </>
  );
}
