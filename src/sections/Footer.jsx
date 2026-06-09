import { LINKS } from "../data";
import {
  WhatsAppIcon,
  MaxIcon,
  TelegramIcon,
  VkIcon,
  StarIcon,
  PinIcon,
} from "../components/icons";
import "./Footer.css";

const SOCIALS = [
  { href: LINKS.whatsapp, icon: WhatsAppIcon, label: "WhatsApp" },
  { isMax: true, icon: MaxIcon, label: "MAX" },
  { href: LINKS.telegram, icon: TelegramIcon, label: "Telegram" },
  { href: LINKS.vk, icon: VkIcon, label: "ВКонтакте" },
  { href: LINKS.reviewYandex, icon: StarIcon, label: "Яндекс" },
  { href: LINKS.review2gis, icon: PinIcon, label: "2ГИС" },
];

export default function Footer({ onMaxClick }) {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__brand">
          <img src="/assets/BarLogo.JPG" alt="Beer Garage" />
          <span className="footer__logo">
            BEER<b>GARAGE</b>
          </span>
          <p>Крафтовый бар. Редкое пиво, сочные бургеры и движ по выходным.</p>
        </div>

        <div className="footer__socials">
          <span className="footer__col-title">Мы здесь</span>
          <div className="footer__icons">
            {SOCIALS.map((s) => {
              const Icon = s.icon;
              if (s.isMax) {
                return (
                  <button
                    key={s.label}
                    onClick={onMaxClick}
                    aria-label={s.label}
                    title={s.label}
                    type="button"
                  >
                    <Icon />
                  </button>
                );
              }
              return (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  title={s.label}
                >
                  <Icon />
                </a>
              );
            })}
          </div>
        </div>
      </div>

      <div className="container footer__bottom">
        <span>© {new Date().getFullYear()} BEER GARAGE </span>
        <span>Бар для тех, кому 18+. Не злоупотребляйте.</span>
      </div>
    </footer>
  );
}
