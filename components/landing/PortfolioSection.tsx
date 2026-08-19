"use client";

import { landingImage } from "@/lib/landing-assets";
import GLightbox from "glightbox";
import imagesLoaded from "imagesloaded";
import Isotope from "isotope-layout";
import { useEffect, useMemo, useRef, useState } from "react";

type PortfolioFilter =
  | "*"
  | ".filter-weddings"
  | ".filter-fashion"
  | ".filter-documentary"
  | ".filter-commercial"
  | ".filter-film";

const FILTERS: { label: string; value: PortfolioFilter }[] = [
  { label: "All work", value: "*" },
  { label: "Weddings", value: ".filter-weddings" },
  { label: "Fashion", value: ".filter-fashion" },
  { label: "Documentary", value: ".filter-documentary" },
  { label: "Commercial", value: ".filter-commercial" },
  { label: "Film", value: ".filter-film" },
];

export function PortfolioSection() {
  const gridRef = useRef<HTMLDivElement>(null);
  const isoRef = useRef<Isotope | null>(null);
  const [activeFilter, setActiveFilter] = useState<PortfolioFilter>("*");

  const items = useMemo(
    () => [
      {
        filterClass: "filter-weddings",
        img: "portfolio/portfolio-1.webp",
        alt: "Wedding photography and videography",
        category: "Weddings",
        rating: "4.9",
        title: "Heritage ballroom celebration",
        text: "Full-day wedding photography and highlight film—emotion-first coverage with editorial finishing and respectful cultural detail.",
        stack: ["Photo", "Cinema", "Color"],
      },
      {
        filterClass: "filter-fashion",
        img: "portfolio/portfolio-3.webp",
        alt: "Fashion and portrait photography",
        category: "Fashion",
        rating: "4.8",
        title: "Editorial portrait series",
        text: "Studio and location portraits for designers and brands—clean lighting, strong composition, and campaign-ready deliverables.",
        stack: ["Portrait", "Studio", "Lookbook"],
      },
      {
        filterClass: "filter-documentary",
        img: "portfolio/portfolio-5.webp",
        alt: "Documentary film still",
        category: "Documentary",
        rating: "5.0",
        title: "Voices from the highlands",
        text: "Short documentary on community-led conservation—field producing, vérité cinematography, and Amharic-first storytelling.",
        stack: ["Field", "Sound", "Grade"],
      },
      {
        filterClass: "filter-commercial",
        img: "portfolio/portfolio-2.webp",
        alt: "Commercial advertising production",
        category: "Commercial",
        rating: "4.8",
        title: "Product launch spot",
        text: "Commercial campaign for a national brand—concept through delivery with motion, stills, and social cutdowns.",
        stack: ["Commercial", "Motion", "Stills"],
      },
      {
        filterClass: "filter-commercial",
        img: "portfolio/portfolio-4.webp",
        alt: "Event coverage",
        category: "Events",
        rating: "4.7",
        title: "Summit multi-cam coverage",
        text: "Live event photography and multicam recap for conferences—fast turnaround for organizers and partners.",
        stack: ["Multicam", "Photo", "Recap"],
      },
      {
        filterClass: "filter-film",
        img: "portfolio/portfolio-6.webp",
        alt: "Narrative film project",
        category: "Film",
        rating: "4.9",
        title: "Narrative short—city nights",
        text: "Independent short film—cinematography and post focused on mood, practical lighting, and authentic Addis Ababa textures.",
        stack: ["Cinema", "Narrative", "Post"],
      },
    ],
    [],
  );

  useEffect(() => {
    if (!gridRef.current) return;

    const iso = new Isotope(gridRef.current, {
      itemSelector: ".isotope-item",
      layoutMode: "masonry",
      filter: "*",
      sortBy: "original-order",
    });
    isoRef.current = iso;

    const imgLoad = imagesLoaded(gridRef.current);
    imgLoad.on("always", () => {
      iso.layout();
    });

    const lightbox = GLightbox({ selector: ".glightbox" });

    return () => {
      lightbox.destroy();
      iso.destroy();
      isoRef.current = null;
    };
  }, []);

  useEffect(() => {
    isoRef.current?.arrange({ filter: activeFilter });
  }, [activeFilter]);

  return (
    <section id="showcase" className="portfolio section">
      <div className="container section-title" data-aos="fade-up">
        <h2>Showcase</h2>
        <p>
          A curated gallery of visual work from Ethiopian creatives—browse by
          weddings, fashion, documentary, commercial, and film, then connect
          with talent that fits your brief.
        </p>
      </div>

      <div className="container" data-aos="fade-up" data-aos-delay="100">
        <div
          className="isotope-layout"
          data-default-filter="*"
          data-layout="masonry"
          data-sort="original-order"
        >
          <ul
            className="filter-tabs isotope-filters"
            data-aos="fade-down"
            data-aos-delay="200"
          >
            {FILTERS.map(({ label, value }) => (
              <li
                key={value}
                data-filter={value}
                className={activeFilter === value ? "filter-active" : ""}
                onClick={() => setActiveFilter(value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setActiveFilter(value);
                  }
                }}
                role="button"
                tabIndex={0}
              >
                {label}
              </li>
            ))}
          </ul>

          <div
            ref={gridRef}
            className="row gy-4 isotope-container"
            data-aos="fade-up"
            data-aos-delay="300"
          >
            {items.map((item) => (
              <div
                key={item.title}
                className={`col-lg-6 portfolio-item isotope-item ${item.filterClass}`}
              >
                <div className="showcase-card">
                  <div className="row g-0">
                    <div className="col-md-5">
                      <div className="card-thumbnail">
                        <img
                          src={landingImage(item.img)}
                          alt={item.alt}
                          className="img-fluid"
                          loading="lazy"
                        />
                        <div className="overlay-actions">
                          <a
                            href={landingImage(item.img)}
                            className="glightbox action-link"
                            title="Enlarge Image"
                          >
                            <i className="bi bi-fullscreen" />
                          </a>
                          <a
                            href="#"
                            className="action-link"
                            title="Project Details"
                          >
                            <i className="bi bi-link-45deg" />
                          </a>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-7">
                      <div className="card-info">
                        <div className="info-header">
                          <span className="category-label">
                            {item.category}
                          </span>
                          <div className="rating-badge">
                            <i className="bi bi-star-fill" /> {item.rating}
                          </div>
                        </div>
                        <h3>{item.title}</h3>
                        <p>{item.text}</p>
                        <div className="stack-list">
                          {item.stack.map((s) => (
                            <span key={s}>{s}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="action-banner" data-aos="zoom-in" data-aos-delay="200">
          <div className="row align-items-center">
            <div className="col-lg-7">
              <h4>Hiring a creative or listing an opportunity?</h4>
              <p>
                Reach out to collaborate, post a job, or feature your work with
                Canma&apos;s community of Ethiopian visual storytellers.
              </p>
            </div>
            <div className="col-lg-5 text-lg-end text-center mt-3 mt-lg-0">
              <a href="#contact" className="btn-launch">
                Contact Canma
              </a>
              <a href="#services" className="btn-explore">
                Explore platform
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
