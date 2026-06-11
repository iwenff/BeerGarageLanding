import { useEffect, useRef, useState } from "react";
import { PersonIcon } from "./icons";
import "./Navbar.css";

const NAV = [
  { label: "Меню",        href: "#menu" },
  { label: "Уже улетели", href: "#beers" },
  { label: "Ивенты",      href: "#events" },
  { label: "Атмосфера",   href: "#interior" },
  { label: "Контакты",    href: "#connect" },
];

function ProfilePopup({ onClose }) {
  return (
    <div className="nav__profile-popup">
      <button
        className="nav__profile-popup-close"
        onClick={onClose}
        type="button"
        aria-label="Закрыть"
      >
        ✕
      </button>
      <p className="nav__profile-popup-title">Личный кабинет</p>
      <p className="nav__profile-popup-text">
        Регистрация и вход для гостей появятся совсем скоро.
        <br />
        Сейчас войти могут только администраторы.
      </p>
      <a href="/admin/login" className="nav__profile-popup-btn">
        Войти как администратор
      </a>
    </div>
  );
}

export default function Navbar({ onMenuClick }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Закрывать попап при клике вне него
  useEffect(() => {
    if (!profileOpen) return;
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [profileOpen]);

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
          {/* mobile-only: войти ссылка */}
          <a
            className="nav__profile-mobile"
            href="/admin/login"
            onClick={() => setOpen(false)}
          >
            <PersonIcon style={{ width: 18, height: 18 }} />
            Войти (только для администраторов)
          </a>
          {/* mobile-only: open menu button inside the dropdown */}
          <button className="nav__menu-link-mobile" onClick={handleMenuClick} type="button">
            🍺 Открыть меню
          </button>
        </nav>

        <div className="nav__actions">
          {/* Кнопка профиля — всегда видна */}
          <div className="nav__profile-wrap" ref={profileRef}>
            <button
              className={`nav__profile-btn${profileOpen ? " is-open" : ""}`}
              onClick={() => setProfileOpen((o) => !o)}
              aria-label="Личный кабинет"
              type="button"
            >
              <PersonIcon />
            </button>
            {profileOpen && (
              <ProfilePopup onClose={() => setProfileOpen(false)} />
            )}
          </div>

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
