"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import type { PublicProductionJob } from "@/lib/public-graphql";
import {
  collectLocationOptions,
  filterJobs,
  PROPOSAL_RANGE_OPTIONS,
  sortJobs,
  type JobsBoardFilters,
  type JobsSort,
} from "@/lib/jobs-board-utils";
import {
  countJobsForFilterOption,
  JOB_EMPLOYMENT_CATEGORIES,
  JOB_WORK_TYPES,
} from "@/lib/jobs-filter-config";

import { JobListCard } from "./JobListCard";
import { JobsFilterCheckbox } from "./JobsFilterCheckbox";
import { JobsSortSelect } from "./JobsSortSelect";

type Props = {
  jobs: PublicProductionJob[];
};

const EMPTY_FILTERS: JobsBoardFilters = {
  search: "",
  categories: [],
  workTypes: [],
  locations: [],
  proposalRanges: [],
};

function toggleValue(list: string[], value: string): string[] {
  return list.includes(value)
    ? list.filter((item) => item !== value)
    : [...list, value];
}

function FilterSection({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={`jobs-filter-section${open ? " is-open" : ""}`}>
      <button
        type="button"
        className="jobs-filter-section__toggle"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
      >
        <span>{title}</span>
        <i className="bi bi-chevron-down" aria-hidden />
      </button>
      {open ? (
        <div className="jobs-filter-section__body">{children}</div>
      ) : null}
    </div>
  );
}

export function JobsBoard({ jobs }: Props) {
  const [filters, setFilters] = useState<JobsBoardFilters>(EMPTY_FILTERS);
  const [sort, setSort] = useState<JobsSort>("best");
  const [draftSearch, setDraftSearch] = useState("");

  const locations = useMemo(() => collectLocationOptions(jobs), [jobs]);

  const filteredJobs = useMemo(() => {
    const filtered = filterJobs(jobs, filters, {
      categories: JOB_EMPLOYMENT_CATEGORIES,
      workTypes: JOB_WORK_TYPES,
    });
    return sortJobs(filtered, sort);
  }, [filters, jobs, sort]);

  const activeFilterCount =
    filters.categories.length +
    filters.workTypes.length +
    filters.locations.length +
    filters.proposalRanges.length +
    (filters.search.trim() ? 1 : 0);

  const applySearch = () => {
    setFilters((current) => ({ ...current, search: draftSearch.trim() }));
  };

  const clearFilters = () => {
    setDraftSearch("");
    setFilters(EMPTY_FILTERS);
  };

  return (
    <div className="jobs-board">
      <aside className="jobs-board__sidebar" aria-label="Job filters">
        <div className="jobs-board__sidebar-inner">
          <FilterSection title="Category">
            <ul className="jobs-filter-list">
              {JOB_EMPLOYMENT_CATEGORIES.map((category) => {
                const count = countJobsForFilterOption(
                  jobs,
                  category,
                  "modality",
                );
                return (
                  <li key={category.id}>
                    <JobsFilterCheckbox
                      checked={filters.categories.includes(category.id)}
                      onChange={() =>
                        setFilters((current) => ({
                          ...current,
                          categories: toggleValue(
                            current.categories,
                            category.id,
                          ),
                        }))
                      }
                    >
                      {category.label}
                      <span className="jobs-filter-count">({count})</span>
                    </JobsFilterCheckbox>
                  </li>
                );
              })}
            </ul>
          </FilterSection>

          <FilterSection title="Work type">
            <ul className="jobs-filter-list">
              {JOB_WORK_TYPES.map((workType) => {
                const count = countJobsForFilterOption(
                  jobs,
                  workType,
                  "role_tag",
                );
                return (
                  <li key={workType.id}>
                    <JobsFilterCheckbox
                      checked={filters.workTypes.includes(workType.id)}
                      onChange={() =>
                        setFilters((current) => ({
                          ...current,
                          workTypes: toggleValue(
                            current.workTypes,
                            workType.id,
                          ),
                        }))
                      }
                    >
                      {workType.label}
                      <span className="jobs-filter-count">({count})</span>
                    </JobsFilterCheckbox>
                  </li>
                );
              })}
            </ul>
          </FilterSection>

          {locations.length > 0 ? (
            <FilterSection title="Location" defaultOpen={false}>
              <ul className="jobs-filter-list">
                {locations.map((location) => (
                  <li key={location}>
                    <JobsFilterCheckbox
                      checked={filters.locations.includes(location)}
                      onChange={() =>
                        setFilters((current) => ({
                          ...current,
                          locations: toggleValue(current.locations, location),
                        }))
                      }
                    >
                      {location}
                    </JobsFilterCheckbox>
                  </li>
                ))}
              </ul>
            </FilterSection>
          ) : null}

          <FilterSection title="Proposals" defaultOpen={false}>
            <ul className="jobs-filter-list">
              {PROPOSAL_RANGE_OPTIONS.map((range) => (
                <li key={range.id}>
                  <JobsFilterCheckbox
                    checked={filters.proposalRanges.includes(range.id)}
                    onChange={() =>
                      setFilters((current) => ({
                        ...current,
                        proposalRanges: toggleValue(
                          current.proposalRanges,
                          range.id,
                        ),
                      }))
                    }
                  >
                    {range.label}
                  </JobsFilterCheckbox>
                </li>
              ))}
            </ul>
          </FilterSection>

          {activeFilterCount > 0 ? (
            <button
              type="button"
              className="jobs-board__clear-filters"
              onClick={clearFilters}
            >
              Clear all filters
            </button>
          ) : null}
        </div>
      </aside>

      <div className="jobs-board__main">
        <div className="jobs-board__toolbar">
          <form
            className="jobs-board__search"
            onSubmit={(event) => {
              event.preventDefault();
              applySearch();
            }}
          >
            <label className="visually-hidden" htmlFor="jobs-search">
              Search jobs
            </label>
            <input
              id="jobs-search"
              type="search"
              className="form-control"
              placeholder="Search title, skills, location…"
              value={draftSearch}
              onChange={(event) => setDraftSearch(event.target.value)}
            />
            <button
              type="submit"
              className="btn btn-accent btn-sm"
              aria-label="Search jobs"
            >
              <i className="bi bi-search" aria-hidden />
            </button>
          </form>
          <p className="jobs-board__count">
            {filteredJobs.length} {filteredJobs.length === 1 ? "job" : "jobs"}{" "}
            found
          </p>
          <JobsSortSelect value={sort} onChange={setSort} />
        </div>

        {filteredJobs.length === 0 ? (
          <div className="jobs-board__empty info-box text-center py-5">
            <p className="lead mb-2">
              {jobs.length === 0
                ? "No jobs listed yet."
                : "No jobs match your filters."}
            </p>
            <p className="text-muted mb-3">
              {jobs.length === 0
                ? "Be the first to publish a scoped brief—or check back soon."
                : "Try adjusting your search or clearing filters."}
            </p>
            {jobs.length === 0 ? (
              <Link href="/jobs/new" className="btn btn-accent">
                <i className="bi bi-plus-circle me-2" aria-hidden />
                Publish a brief
              </Link>
            ) : (
              <button
                type="button"
                className="btn btn-ghost"
                onClick={clearFilters}
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="jobs-board__list">
            {filteredJobs.map((job) => (
              <JobListCard key={job.id} job={job} />
            ))}
          </div>
        )}

        <div className="jobs-board__cta action-banner mt-4">
          <div className="row align-items-center">
            <div className="col-lg-8">
              <h3>Membership unlocks applicants and postings</h3>
              <p>
                Canma ties creative jobs to verified community accounts—join the
                community to post roles and apply.
              </p>
            </div>
            <div className="col-lg-4 text-lg-end text-center">
              <Link href="/community/join" className="action-btn">
                Join as member
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
