import Link from "next/link";

type Props = {
  title: string;
  description: string;
  icon: string;
  href: string;
};

export function MarketplaceModuleCard({
  title,
  description,
  icon,
  href,
}: Props) {
  return (
    <div className="col-md-6 col-lg-4" data-aos="fade-up">
      <Link href={href} className="text-decoration-none text-body">
        <div className="module-card">
          <div className="fs-2 mb-2" aria-hidden>
            {icon}
          </div>
          <h3 className="h5 mb-2">{title}</h3>
          <p className="small text-muted mb-0">{description}</p>
        </div>
      </Link>
    </div>
  );
}
