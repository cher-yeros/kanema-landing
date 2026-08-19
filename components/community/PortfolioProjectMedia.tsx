import {
  portfolioDisplayImage,
  portfolioYoutubeEmbed,
} from "@/lib/portfolio-media";

type PortfolioProjectMediaProps = {
  project: {
    title: string;
    cover_url: string | null;
    media_json: string | null;
  };
  variant?: "card" | "thumb";
};

export function PortfolioProjectMedia({
  project,
  variant = "card",
}: PortfolioProjectMediaProps) {
  const embedUrl = portfolioYoutubeEmbed(project.media_json);
  const image = portfolioDisplayImage(project);

  if (embedUrl && variant === "card") {
    return (
      <iframe
        src={embedUrl}
        title={project.title}
        className="community-portfolio-card__iframe"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  }

  if (image) {
    return (
      <img
        src={image}
        alt=""
        className={
          variant === "thumb" ? "portfolio-editor-item__thumb" : "img-fluid"
        }
      />
    );
  }

  return (
    <div
      className={
        variant === "thumb"
          ? "portfolio-editor-item__thumb portfolio-editor-item__thumb--empty"
          : "community-portfolio-card__placeholder"
      }
    >
      <i
        className={`bi ${embedUrl ? "bi-play-btn" : "bi-image"}`}
        aria-hidden
      />
    </div>
  );
}

export function PortfolioProjectThumb({
  project,
}: {
  project: {
    title: string;
    cover_url: string | null;
    media_json: string | null;
  };
}) {
  const embedUrl = portfolioYoutubeEmbed(project.media_json);
  const image = portfolioDisplayImage(project);

  if (image) {
    return (
      <div className="portfolio-editor-item__thumb-wrap">
        <img src={image} alt="" className="portfolio-editor-item__thumb" />
        {embedUrl ? (
          <span className="portfolio-editor-item__play" aria-hidden>
            <i className="bi bi-play-fill" />
          </span>
        ) : null}
      </div>
    );
  }

  return (
    <div className="portfolio-editor-item__thumb portfolio-editor-item__thumb--empty">
      <i
        className={`bi ${embedUrl ? "bi-play-btn" : "bi-image"}`}
        aria-hidden
      />
    </div>
  );
}
