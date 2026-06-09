import { LINKS } from "../data";
import {
  WhatsAppIcon,
  MaxIcon,
  TelegramIcon,
  VkIcon,
  StarIcon,
  PinIcon,
  ArrowIcon,
} from "../components/icons";
import "./Connect.css";

export default function Connect({ onMaxClick }) {
  const GROUPS = [
    {
      key: "manager",
      badge: "Главное",
      title: "Написать руководителю",
      text: "Вопрос, бронь, банкет или предложение — пишите напрямую. Ответим лично.",
      accent: true,
      actions: [
        {
          label: "Написать руководителю в WhatsApp",
          href: LINKS.whatsapp,
          icon: WhatsAppIcon,
          primary: true,
        },
        {
          label: "Написать руководителю в Макс",
          onClick: onMaxClick,
          icon: MaxIcon,
        },
      ],
    },
    {
      key: "review",
      badge: "Спасибо",
      title: "Оставить отзыв",
      text: "Понравилось у нас? Пара слов очень помогает — выбирай площадку.",
      actions: [
        { label: "Отзыв на Яндекс", href: LINKS.reviewYandex, icon: StarIcon },
        { label: "Отзыв на 2ГИС", href: LINKS.review2gis, icon: PinIcon },
      ],
    },
    {
      key: "social",
      badge: "Будь в теме",
      title: "Мы в соцсетях",
      text: "Афиша, новые краны и розыгрыши — первыми узнают подписчики.",
      actions: [
        { label: "Телеграм-канал", href: LINKS.telegram, icon: TelegramIcon },
        { label: "Группа ВКонтакте", href: LINKS.vk, icon: VkIcon },
      ],
    },
  ];

  return (
    <section className="section connect" id="connect">
      <div
        className="blob connect__blob"
        style={{ background: "var(--amber)" }}
      />
      <div className="container">
        <div className="section-head connect__head">
          <span className="eyebrow" data-reveal>
            На связи
          </span>
          <h2 className="heading" data-reveal>
            Давай <span className="accent">на «ты»</span>
          </h2>
          <p className="lead" data-reveal>
            Напиши руководителю, оставь отзыв или следи за новыми кранами —
            всеми удобными способами на связи.
          </p>
        </div>

        <div className="connect__grid">
          {GROUPS.map((g) => (
            <article
              className={`cgroup ${g.accent ? "cgroup--accent" : ""}`}
              data-reveal
              key={g.key}
            >
              <span className="cgroup__badge">{g.badge}</span>
              <h3 className="cgroup__title">{g.title}</h3>
              <p className="cgroup__text">{g.text}</p>
              <div className="cgroup__actions">
                {g.actions.map((a) => {
                  const Icon = a.icon;
                  if (a.onClick) {
                    return (
                      <button
                        key={a.label}
                        className={`actionbtn ${a.primary ? "actionbtn--primary" : ""}`}
                        onClick={a.onClick}
                        type="button"
                      >
                        <span className="actionbtn__ico">
                          <Icon />
                        </span>
                        <span className="actionbtn__label">{a.label}</span>
                        <ArrowIcon className="actionbtn__arrow" />
                      </button>
                    );
                  }
                  return (
                    <a
                      key={a.label}
                      className={`actionbtn ${a.primary ? "actionbtn--primary" : ""}`}
                      href={a.href}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span className="actionbtn__ico">
                        <Icon />
                      </span>
                      <span className="actionbtn__label">{a.label}</span>
                      <ArrowIcon className="actionbtn__arrow" />
                    </a>
                  );
                })}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
