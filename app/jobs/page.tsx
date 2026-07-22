import { fetchProductionJobs } from "@/lib/public-graphql";

import { JobsBoard } from "@/components/jobs/JobsBoard";
import { JobsMemberStrip } from "./jobs-member-strip";

export default async function ProductionJobsPage() {
  let jobs: Awaited<ReturnType<typeof fetchProductionJobs>> = [];
  try {
    jobs = await fetchProductionJobs();
  } catch {
    jobs = [];
  }

  return (
    <>
      <JobsMemberStrip />

      <section id="open-roles" className="services section">
        <div className="container" data-aos="fade-up" data-aos-delay="100">
          <JobsBoard jobs={jobs} />
        </div>
      </section>
    </>
  );
}
