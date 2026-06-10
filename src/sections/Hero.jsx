import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { LINKS } from "../data";
import { WhatsAppIcon, MaxIcon, ArrowIcon } from "../components/icons";
import "./Hero.css";

export default function Hero({ onMaxClick, onMenuClick }) {
  const root = useRef(null);

  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.from(
        ".hero__bg",
        { scale: 1.18, duration: 2.2, ease: "power2.out" },
        0,
      )
        .from(".hero__eyebrow", { y: 24, opacity: 0, duration: 0.7 }, 0.3)
        .from(
          ".hero__title .line span",
          { yPercent: 120, duration: 1, stagger: 0.12, ease: "power4.out" },
          0.35,
        )
        .from(".hero__lead", { y: 24, opacity: 0, duration: 0.7 }, 0.9)
        .from(
          ".hero__cta > *",
          { y: 26, opacity: 0, duration: 0.6, stagger: 0.12 },
          1.05,
        )
        .from(
          ".hero__stats .stat",
          { y: 20, opacity: 0, duration: 0.5, stagger: 0.1 },
          1.25,
        )
        .from(".hero__scroll", { opacity: 0, duration: 0.6 }, 1.5);

      // parallax background on scroll
      gsap.to(".hero__bg", {
        yPercent: 18,
        ease: "none",
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
      // subtle pointer parallax (desktop)
      if (window.matchMedia("(pointer:fine)").matches) {
        const move = (e) => {
          const y = e.clientY / window.innerHeight - 0.5;
          gsap.to(".hero__bg", {
            y: y * -28,
            duration: 0.8,
            ease: "power2.out",
          });
          gsap.to(".hero__glass", {
            y: y * 22,
            duration: 0.8,
            ease: "power2.out",
          });
        };
        window.addEventListener("pointermove", move);
        return () => window.removeEventListener("pointermove", move);
      }
    },
    { scope: root },
  );

  return (
    <section className="hero" id="top" ref={root}>
      {/* фон клипируется отдельно — glass может выходить за пределы секции */}
      <div className="hero__bg-clip">
        <img
          className="hero__bg"
          src="/assets/MainRoom.jpg"
          alt="Интерьер бара Beer Garage"
        />
        <div className="hero__overlay" />
      </div>

      {/* блобы вне clip-контейнера → свечение плавно вытекает за границы секции */}
      <div
        className="blob hero__blob-1"
        style={{ background: "var(--amber)" }}
      />
      <div className="blob hero__blob-2" style={{ background: "var(--red)" }} />

      <div className="container hero__inner">
        <span className="eyebrow hero__eyebrow">
          Крафтовый бар · заходи в гараж
        </span>

        <h1 className="hero__title">
          <span className="line">
            <span>BEER</span>
          </span>
          <span className="">
            <span className="accent">GARAGE</span>
          </span>
        </h1>

        <p className="hero__lead">
          Живой крафт на кранах, нормальные бургеры и хорошая компания. Бетон,
          тёплый свет и янтарь в бокале — всё остальное само складывается.
        </p>

        <div className="hero__cta">
          <a
            className="btn btn--primary"
            href={LINKS.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
          >
            <WhatsAppIcon /> Написать руководителю в WhatsApp
          </a>
          <button className="btn btn--ghost" onClick={onMaxClick} type="button">
            <MaxIcon /> Написать руководителю в Макс
          </button>
        </div>

        <button className="hero__menu-btn" onClick={onMenuClick} type="button">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M3 12h18M3 6h18M3 18h18" />
          </svg>
          Открыть меню
          <svg
            className="hero__menu-arrow"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>

        <div className="hero__stats">
          <div className="stat">
            <b>30+</b>
            <span>кранов крафта</span>
          </div>
          <div className="stat">
            <b>4</b>
            <span>авторских бургера</span>
          </div>
          <div className="stat">
            <b>2</b>
            <span>зала, есть бронь</span>
          </div>
        </div>
      </div>

      <a href="#menu" className="hero__scroll" aria-label="Листать вниз">
        <span>Листай</span>
        <ArrowIcon style={{ transform: "rotate(90deg)" }} />
      </a>
      <img
        className="hero__glass"
        src="/assets/hydration-lightbear.jpg"
        alt=""
        aria-hidden
      />
    </section>
  );
}
