import Link from "next/link";

export function SiteFooter() {
  return (
    <footer id="footer" className="footer dark-background">
      <div className="container footer-top">
        <div className="row gy-4">
          <div className="col-lg-4 col-md-6 footer-about">
            <Link href="/" className="logo d-flex align-items-center">
              <span className="sitename">ካንማ</span>
            </Link>
            <p className="mt-3 small text-secondary">
              Empowering Ethiopian visual storytellers—visibility,
              opportunities, and professional growth in one digital hub.
            </p>
            <div className="footer-contact pt-3">
              <p>Addis Ababa, Ethiopia</p>
              <p className="mt-3">
                <strong>Phone:</strong> <span>+251 XXX XXX XXX</span>
              </p>
              <p>
                <strong>Email:</strong>{" "}
                <span>
                  <a href="mailto:info@canmaet.net">info@canmaet.net</a>
                </span>
              </p>
            </div>
            <div className="social-links d-flex mt-4">
              <a href="#" aria-label="Instagram">
                <i className="bi bi-instagram" />
              </a>
              <a href="#" aria-label="Facebook">
                <i className="bi bi-facebook" />
              </a>
              <a href="#" aria-label="Telegram">
                <i className="bi bi-telegram" />
              </a>
            </div>
          </div>

          <div className="col-lg-2 col-md-3 footer-links">
            <h4>Explore</h4>
            <ul>
              <li>
                <Link href="/">Home</Link>
              </li>
              <li>
                <a href="#about">About Canma</a>
              </li>
              <li>
                <a href="#services">Platform</a>
              </li>
              <li>
                <a href="#showcase">Showcase</a>
              </li>
              <li>
                <a href="#contact">Membership</a>
              </li>
              <li>
                <Link href="/election">Presidential election</Link>
              </li>
              <li>
                <Link href="/jobs">Production job center</Link>
              </li>
            </ul>
          </div>

          <div className="col-lg-2 col-md-3 footer-links">
            <h4>For creatives</h4>
            <ul>
              <li>
                <a href="#showcase">Explore talent</a>
              </li>
              <li>
                <a href="#services">Opportunities</a>
              </li>
              <li>
                <Link href="/events">Events and trainings</Link>
              </li>
              <li>
                <a href="#why-us">Resources</a>
              </li>
              <li>
                <a href="#testimonials">Community voices</a>
              </li>
            </ul>
          </div>

          <div className="col-lg-2 col-md-3 footer-links">
            <h4>Clients</h4>
            <ul>
              <li>
                <a href="#showcase">Find a creative</a>
              </li>
              <li>
                <a href="#contact">Post a brief</a>
              </li>
              <li>
                <a href="#why-us">Why Canma</a>
              </li>
              <li>
                <a href="#team">Community</a>
              </li>
              <li>
                <a href="#contact">Contact</a>
              </li>
            </ul>
          </div>

          <div className="col-lg-2 col-md-3 footer-links">
            <h4>Legal</h4>
            <ul>
              <li>
                <a href="#">Terms of service</a>
              </li>
              <li>
                <a href="#">Privacy policy</a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="container copyright text-center mt-4">
        <p>
          © <span>2026</span>
          <strong className="px-1 sitename">ካንማ</strong>
          <span>All rights reserved.</span>
        </p>
        <div className="credits">
          Designed by{" "}
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://shevadigitals.com/"
          >
            Sheva Digitals.
          </a>
        </div>
      </div>
    </footer>
  );
}
