import { useEffect, useState } from "react";
import {
  BURGERS,
  MENU_DRAFT,
  MENU_SPIRITS,
  MENU_COCKTAILS,
  MENU_SHOTS,
  MENU_SHOT_SETS,
  MENU_STARTERS,
  MENU_SALADS,
  MENU_SEAFOOD,
} from "../data";
import "./MenuPage.css";

/* ── icons ─────────────────────────────────────────── */
const IconTap = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M8 3h8l1 6H7L8 3Z" />
    <rect x="9" y="9" width="6" height="12" rx="1" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="8" y1="23" x2="16" y2="23" />
  </svg>
);
const IconCocktail = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M6 3h12l-6 8v8" />
    <line x1="9" y1="19" x2="15" y2="19" />
  </svg>
);
const IconShot = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M6 3h12l-1.5 12a2 2 0 0 1-2 1.8H9.5a2 2 0 0 1-2-1.8L6 3Z" />
    <line x1="4" y1="3" x2="20" y2="3" />
  </svg>
);
const IconSet = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="8" cy="14" r="4" />
    <circle cx="16" cy="14" r="4" />
    <circle cx="12" cy="8" r="4" />
  </svg>
);
const IconSpirit = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M9 3h6l1 4a4 4 0 0 1 1 3v9a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V10a4 4 0 0 1 1-3L9 3Z" />
  </svg>
);
const IconSnack = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M4 11h16v2a8 8 0 0 1-16 0v-2Z" />
    <path d="M4 11 6 5h12l2 6" />
  </svg>
);
const IconSalad = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M2 12h20M12 2C6.5 2 2 7 2 12h20c0-5-4.5-10-10-10Z" />
    <path d="M6 12v8a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-8" />
  </svg>
);
const IconSeafood = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M3 12s3-7 9-7 9 7 9 7-3 7-9 7-9-7-9-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const IconBurger = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M5 19h14a2 2 0 0 0 0-4H5a2 2 0 0 0 0 4Z" />
    <path d="M20 15a8 8 0 1 0-16 0" />
    <line x1="4" y1="12" x2="20" y2="12" />
  </svg>
);
const IconGroup = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="9" cy="7" r="3" />
    <circle cx="15" cy="7" r="3" />
    <path d="M3 21v-2a5 5 0 0 1 5-5h8a5 5 0 0 1 5 5v2" />
  </svg>
);

const BAR_TABS = [
  { id: "draft",     label: "На кранах",  icon: <IconTap /> },
  { id: "cocktails", label: "Коктейли",   icon: <IconCocktail /> },
  { id: "shots",     label: "Шоты",       icon: <IconShot /> },
  { id: "setshots",  label: "Сет-шоты",   icon: <IconSet /> },
  { id: "spirits",   label: "Крепкое",    icon: <IconSpirit /> },
];
const FOOD_TABS = [
  { id: "starters",  label: "Закуски",      icon: <IconSnack /> },
  { id: "salads",    label: "Салаты",       icon: <IconSalad /> },
  { id: "seafood",   label: "Морепродукты", icon: <IconSeafood /> },
  { id: "burgers",   label: "Бургеры",      icon: <IconBurger /> },
  { id: "group",     label: "Для компании", icon: <IconGroup /> },
];

/* ── Draft beer card ─────────────────────────────────── */
function DraftCard({ beer }) {
  return (
    <div className="mcard mcard--draft">
      <div className="mcard__accent" style={{ background: beer.accent }} />
      <div className="mcard__body">
        <div className="mcard__meta">
          <span className="mcard__brewery">{beer.brewery}</span>
          <span className="mcard__style">{beer.style}</span>
        </div>
        <h3 className="mcard__name">{beer.name}</h3>
        <p className="mcard__desc">{beer.desc}</p>
        <div className="mcard__footer">
          <span className="mcard__spec">{beer.abv} ABV</span>
          <span className="mcard__spec">{beer.vol}</span>
          <span className="mcard__price">{beer.price} ₽</span>
        </div>
      </div>
    </div>
  );
}

/* ── Cocktail card ───────────────────────────────────── */
function CocktailCard({ item }) {
  return (
    <div className="mcard mcard--cocktail">
      <div className="mcard__body">
        <h3 className="mcard__name">{item.name}</h3>
        <p className="mcard__desc">{item.desc}</p>
        <div className="mcard__footer">
          <span className="mcard__spec">{item.vol}</span>
          {item.price != null ? (
            <span className="mcard__price">{item.price} ₽</span>
          ) : (
            <span className="mcard__price-ask">спросите бармена</span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Unified list row (shots, shot sets, starters, salads, seafood) ── */
function ListRow({ item }) {
  return (
    <div className="mrow">
      <div className="mrow__left">
        <div className="mrow__name-wrap">
          <span className="mrow__name">{item.name}</span>
          {item.tag && <span className="mrow__badge">{item.tag}</span>}
        </div>
        {item.desc && <span className="mrow__desc">{item.desc}</span>}
        {(item.note || item.vol) && (
          <span className="mrow__vol">{item.note || item.vol}</span>
        )}
      </div>
      <div className="mrow__price-col">
        {item.price2 ? (
          <span className="mrow__price">{item.price2} ₽</span>
        ) : item.price != null ? (
          <span className="mrow__price">{item.price} ₽</span>
        ) : (
          <span className="mrow__price-ask">уточнить</span>
        )}
      </div>
    </div>
  );
}

/* ── Spirit row (with category badge) ───────────────── */
function SpiritRow({ item }) {
  return (
    <div className="mrow">
      <div className="mrow__left">
        <div className="mrow__name-wrap">
          <span className="mrow__name">{item.name}</span>
          <span className="mrow__badge mrow__badge--cat">{item.cat}</span>
        </div>
        <span className="mrow__vol">{item.vol}</span>
      </div>
      <div className="mrow__price-col">
        {item.price != null ? (
          <span className="mrow__price">{item.price} ₽</span>
        ) : (
          <span className="mrow__price-ask">{item.note || "уточнить"}</span>
        )}
      </div>
    </div>
  );
}

/* ── Burger card ─────────────────────────────────────── */
function BurgerCard({ burger }) {
  return (
    <div className="mcard mcard--burger">
      <div className="mcard__img-wrap">
        <img src={burger.img} alt={burger.name} loading="lazy" />
        <span className="mcard__tag">{burger.tag}</span>
      </div>
      <div className="mcard__body">
        <h3 className="mcard__name">{burger.name}</h3>
        <p className="mcard__desc">{burger.desc}</p>
        <div className="mcard__footer">
          <span className="mcard__price">{burger.price} ₽</span>
        </div>
      </div>
    </div>
  );
}

/* ── Group set card ──────────────────────────────────── */
function GroupCard({ item }) {
  return (
    <div className="mcard mcard--group">
      <div className="mcard__body">
        <h3 className="mcard__name">{item.name}</h3>
        <p className="mcard__desc">{item.desc}</p>
        <div className="mcard__footer">
          <span className="mcard__price">{item.price} ₽</span>
        </div>
      </div>
    </div>
  );
}

/* ── Main MenuPage ───────────────────────────────────── */
export default function MenuPage({ onClose }) {
  const [mainTab, setMainTab] = useState("bar");
  const [barSub, setBarSub] = useState("draft");
  const [foodSub, setFoodSub] = useState("starters");

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const subTabs = mainTab === "bar" ? BAR_TABS : FOOD_TABS;
  const activeSub = mainTab === "bar" ? barSub : foodSub;
  const setActiveSub = mainTab === "bar" ? setBarSub : setFoodSub;

  const groupItems = MENU_STARTERS.filter((i) => i.tag === "Для компании");
  const starterItems = MENU_STARTERS.filter((i) => i.tag !== "Для компании");

  return (
    <div
      className="menupage"
      role="dialog"
      aria-modal="true"
      aria-label="Меню BEER GARAGE"
    >
      {/* sticky header */}
      <div className="menupage__header">
        <div className="menupage__brand">
          <img src="/assets/BarLogo.JPG" alt="Beer Garage" />
          <span>
            BEER<b>GARAGE</b>
          </span>
        </div>

        <div className="menupage__maintabs">
          <button
            className={mainTab === "bar" ? "active" : ""}
            onClick={() => { setMainTab("bar"); setBarSub("draft"); }}
            type="button"
          >
            🍺 Барная карта
          </button>
          <button
            className={mainTab === "food" ? "active" : ""}
            onClick={() => { setMainTab("food"); setFoodSub("starters"); }}
            type="button"
          >
            🍔 Кухня
          </button>
        </div>

        <button
          className="menupage__close"
          onClick={onClose}
          type="button"
          aria-label="Закрыть меню"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
          <span>Закрыть</span>
        </button>
      </div>

      {/* sub-tab strip */}
      <div className="menupage__subtabs">
        <div className="menupage__subtabs-inner">
          {subTabs.map((t) => (
            <button
              key={t.id}
              className={activeSub === t.id ? "active" : ""}
              onClick={() => setActiveSub(t.id)}
              type="button"
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* scrollable content */}
      <div className="menupage__content">
        <div className="container">

          {/* BAR: draft */}
          {mainTab === "bar" && barSub === "draft" && (
            <>
              <div className="menupage__section-head">
                <h2 className="menupage__section-title">
                  На кранах <span className="accent">30+</span>
                </h2>
                <p className="menupage__section-note">
                  Ротация каждую неделю — актуальный список у бармена
                </p>
              </div>
              <div className="mcard-grid mcard-grid--draft">
                {MENU_DRAFT.map((b) => (
                  <DraftCard key={b.id} beer={b} />
                ))}
              </div>
            </>
          )}

          {/* BAR: cocktails */}
          {mainTab === "bar" && barSub === "cocktails" && (
            <>
              <div className="menupage__section-head">
                <h2 className="menupage__section-title">Коктейли</h2>
              </div>
              <div className="mcard-grid mcard-grid--cocktails">
                {MENU_COCKTAILS.map((c) => (
                  <CocktailCard key={c.id} item={c} />
                ))}
              </div>
            </>
          )}

          {/* BAR: shots */}
          {mainTab === "bar" && barSub === "shots" && (
            <>
              <div className="menupage__section-head">
                <h2 className="menupage__section-title">Шоты</h2>
                <p className="menupage__section-note">
                  Две цены — малая и двойная порция
                </p>
              </div>
              <div className="mrow-list">
                {MENU_SHOTS.map((s) => (
                  <ListRow key={s.id} item={s} />
                ))}
              </div>
            </>
          )}

          {/* BAR: set-shots */}
          {mainTab === "bar" && barSub === "setshots" && (
            <>
              <div className="menupage__section-head">
                <h2 className="menupage__section-title">Сет-шоты</h2>
                <p className="menupage__section-note">
                  5 шотов за один раз — берёте сразу, платите меньше
                </p>
              </div>
              <div className="mrow-list">
                {MENU_SHOT_SETS.map((s) => (
                  <ListRow key={s.id} item={s} />
                ))}
              </div>
            </>
          )}

          {/* BAR: spirits */}
          {mainTab === "bar" && barSub === "spirits" && (
            <>
              <div className="menupage__section-head">
                <h2 className="menupage__section-title">Крепкое</h2>
              </div>
              <div className="mrow-list">
                {MENU_SPIRITS.map((s) => (
                  <SpiritRow key={s.id} item={s} />
                ))}
              </div>
            </>
          )}

          {/* FOOD: starters */}
          {mainTab === "food" && foodSub === "starters" && (
            <>
              <div className="menupage__section-head">
                <h2 className="menupage__section-title">Закуски</h2>
              </div>
              <div className="mrow-list">
                {starterItems.map((s) => (
                  <ListRow key={s.id} item={s} />
                ))}
              </div>
            </>
          )}

          {/* FOOD: salads */}
          {mainTab === "food" && foodSub === "salads" && (
            <>
              <div className="menupage__section-head">
                <h2 className="menupage__section-title">Салаты</h2>
              </div>
              <div className="mrow-list">
                {MENU_SALADS.map((s) => (
                  <ListRow key={s.id} item={s} />
                ))}
              </div>
            </>
          )}

          {/* FOOD: seafood */}
          {mainTab === "food" && foodSub === "seafood" && (
            <>
              <div className="menupage__section-head">
                <h2 className="menupage__section-title">Морепродукты</h2>
              </div>
              <div className="mrow-list">
                {MENU_SEAFOOD.map((s) => (
                  <ListRow key={s.id} item={s} />
                ))}
              </div>
            </>
          )}

          {/* FOOD: burgers */}
          {mainTab === "food" && foodSub === "burgers" && (
            <>
              <div className="menupage__section-head">
                <h2 className="menupage__section-title">
                  Авторские <span className="accent">бургеры</span>
                </h2>
                <p className="menupage__section-note">
                  Котлета ручной лепки, свежая булка, фирменный соус
                </p>
              </div>
              <div className="mcard-grid mcard-grid--burgers">
                {BURGERS.map((b) => (
                  <BurgerCard key={b.id} burger={b} />
                ))}
              </div>
            </>
          )}

          {/* FOOD: for company */}
          {mainTab === "food" && foodSub === "group" && (
            <>
              <div className="menupage__section-head">
                <h2 className="menupage__section-title">Для компании</h2>
                <p className="menupage__section-note">
                  Большие наборы — берёте всего и сразу
                </p>
              </div>
              <div className="mcard-grid mcard-grid--group">
                {groupItems.map((i) => (
                  <GroupCard key={i.id} item={i} />
                ))}
              </div>
            </>
          )}

          <p className="menupage__disclaimer">
            Цены и состав могут меняться. Уточняйте у бармена — он всё знает.
          </p>
        </div>
      </div>
    </div>
  );
}
