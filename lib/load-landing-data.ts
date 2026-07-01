import {
  fetchCommunityMembers,
  fetchTeamMembers,
  fetchTestimonials,
  type PublicCommunityMember,
  type PublicTeamMember,
  type PublicTestimonial,
} from "./public-graphql";

export type LandingPublicData = {
  testimonials: PublicTestimonial[];
  communityMembers: PublicCommunityMember[];
  teamMembers: PublicTeamMember[];
  featuredMembers: PublicCommunityMember[];
};

export async function loadLandingPublicData(): Promise<LandingPublicData> {
  const [testimonials, communityMembers, teamMembers, featuredMembers] =
    await Promise.all([
      fetchTestimonials().catch(() => [] as PublicTestimonial[]),
      fetchCommunityMembers().catch(() => [] as PublicCommunityMember[]),
      fetchTeamMembers().catch(() => [] as PublicTeamMember[]),
      fetchCommunityMembers({ featuredOnly: true }).catch(
        () => [] as PublicCommunityMember[],
      ),
    ]);

  return {
    testimonials,
    communityMembers,
    teamMembers,
    featuredMembers,
  };
}
