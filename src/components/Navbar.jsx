import { useEffect, useState } from "react";
import "./Navbar.css";

const NAV = [
  { label: "Меню",        href: "#menu" },
  { label: "Уже улетели", href: "#beers" },
  { label: "Ивенты",      href: "#events" },
  { label: "Атмосфера",   href: "#interior" },
  { label: "Контакты",    href: "#connect" },
];

export default function Navbar({ onMenuClick }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleMenuClick = () => {
    setOpen(false);
    onMenuClick?.();
  };

  return (
    <header className={`nav ${scrolled ? "nav--solid" : ""}`}>
      <div className="container nav__inner">
        <a href="#top" className="nav__brand" onClick={() => setOpen(false)}>
          <img src="/assets/BarLogo.JPG" alt="Beer Garage" />
          <span>BEER <b>GARAGE</b></span>
        </a>

        <nav className={`nav__links ${open ? "is-open" : ""}`}>
          {NAV.map((n) => (
            <a key={n.href} href={n.href} onClick={() => setOpen(false)}>
              {n.label}
            </a>
          ))}
          {/* mobile-only: open menu button inside the dropdown */}
          <button className="nav__menu-link-mobile" onClick={handleMenuClick} type="button">
            🍺 Открыть меню
          </button>
        </nav>

        <div className="nav__actions">
          {/* desktop: always-visible amber menu button */}
          <button className="nav__menu-btn" onClick={handleMenuClick} type="button">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12h18M3 6h18M3 18h18"/>
            </svg>
            Меню
          </button>

          <button
            className={`nav__burger ${open ? "is-open" : ""}`}
            onClick={() => setOpen((o) => !o)}
            aria-label="Навигация"
            type="button"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>
    </header>
  );
}
