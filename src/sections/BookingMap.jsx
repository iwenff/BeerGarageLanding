import { useState, useEffect, useCallback, useRef } from "react";
import "./BookingMap.css";

const API_URL = "https://beergarage-back-production.up.railway.app";
const CHAIR_R = 10;

// id: null — стулья без бэкенд-ID пока не залит seed
const RAW_TABLES = [
  {
    id: 1,
    label: "1",
    x: 105,
    y: 580,
    width: 70,
    height: 100,
    chairs: [
      { id: null, x: 80, y: 590 },
      { id: null, x: 80, y: 630 },
      { id: null, x: 200, y: 605 },
      { id: null, x: 200, y: 655 },
      { id: null, x: 80, y: 670 },
    ],
  },
  {
    id: 2,
    label: "2",
    x: 60,
    y: 345,
    width: 210,
    height: 70,
    chairs: [
      { id: null, x: 90, y: 325 },
      { id: null, x: 140, y: 325 },
      { id: null, x: 190, y: 325 },
      { id: null, x: 240, y: 325 },
      { id: null, x: 90, y: 435 },
      { id: null, x: 140, y: 435 },
      { id: null, x: 190, y: 435 },
      { id: null, x: 240, y: 435 },
    ],
  },
  {
    id: 3,
    label: "3",
    x: 465,
    y: 300,
    width: 80,
    height: 80,
    chairs: [
      { id: null, x: 440, y: 320 },
      { id: null, x: 440, y: 360 },
      { id: null, x: 565, y: 320 },
      { id: null, x: 565, y: 360 },
    ],
  },
  // ── VIP ──
  {
    id: 4,
    label: "4",
    vip: true,
    x: 520,
    y: 130,
    width: 50,
    height: 80,
    chairs: [
      { id: null, x: 545, y: 110 },
      { id: null, x: 545, y: 230 },
    ],
  },
  {
    id: 5,
    label: "5",
    vip: true,
    x: 680,
    y: 80,
    width: 110,
    height: 50,
    chairs: [
      { id: null, x: 700, y: 55 },
      { id: null, x: 740, y: 55 },
      { id: null, x: 780, y: 55 },
      { id: null, x: 710, y: 150 },
      { id: null, x: 660, y: 105 },
      { id: null, x: 760, y: 150 },
    ],
  },
  {
    id: 6,
    label: "6",
    vip: true,
    x: 705,
    y: 250,
    width: 80,
    height: 50,
    chairs: [
      { id: null, x: 690, y: 275 },
      { id: null, x: 800, y: 275 },
    ],
  },
  // ── низ зала ──
  {
    id: 7,
    label: "7",
    x: 530,
    y: 840,
    width: 80,
    height: 30,
    chairs: [
      { id: null, x: 550, y: 820 },
      { id: null, x: 590, y: 820 },
    ],
  },
  {
    id: 8,
    label: "BAR",
    x: 650,
    y: 420,
    width: 50,
    height: 450,
    chairs: [
      { id: null, x: 630, y: 440 },
      { id: null, x: 630, y: 485 },
      { id: null, x: 630, y: 535 },
      { id: null, x: 630, y: 585 },
      { id: null, x: 630, y: 635 },
      { id: null, x: 630, y: 685 },
      { id: null, x: 630, y: 735 },
      { id: null, x: 630, y: 785 },
    ],
  },
];

// Уникальный ключ каждому стулу: tableId_chairIndex
const TABLES = RAW_TABLES.map((t) => ({
  ...t,
  chairs: t.chairs.map((c, i) => ({ ...c, key: `${t.id}_${i}` })),
}));

const todayStr = () => new Date().toISOString().slice(0, 10);

export default function BookingMap({ onClose }) {
  const [occupied, setOccupied] = useState(new Set());
  const [selected, setSelected] = useState(new Set());
  const [date, setDate] = useState(todayStr);
  const [timeStart, setTimeStart] = useState("18:00");
  const [timeEnd, setTimeEnd] = useState("21:00");
  const [form, setForm] = useState({ name: "", phone: "" });
  const [submitting, setSub] = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiError, setError] = useState(null);
  const formRef = useRef(null);

  useEffect(() => {
    const fn = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", fn);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", fn);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  // chairId → chairKey (для маппинга ответа бэка когда придут реальные id)
  const idToKey = useRef({});
  useEffect(() => {
    const m = {};
    TABLES.forEach((t) =>
      t.chairs.forEach((c) => {
        if (c.id !== null) m[c.id] = c.key;
      }),
    );
    idToKey.current = m;
  }, []);

  const fetchStatuses = useCallback(async () => {
    if (!date || !timeStart || !timeEnd) return;
    try {
      const qs = new URLSearchParams({ date, timeStart, timeEnd });
      const res = await fetch(`${API_URL}/tables?${qs}`);
      if (!res.ok) return;
      const data = await res.json();
      const occ = new Set();
      if (Array.isArray(data)) {
        data.forEach((t) =>
          t.chairs?.forEach((c) => {
            if (c.status === "occupied") {
              const key = idToKey.current[c.id];
              if (key) occ.add(key);
            }
          }),
        );
      }
      setOccupied(occ);
      setSelected((prev) => {
        const next = new Set([...prev].filter((k) => !occ.has(k)));
        return next.size !== prev.size ? next : prev;
      });
    } catch {
      /* keep current */
    }
  }, [date, timeStart, timeEnd]);

  useEffect(() => {
    fetchStatuses();
  }, [fetchStatuses]);

  const isOcc = (key) => occupied.has(key);
  const isSel = (key) => selected.has(key);
  const chairColor = (key) =>
    isSel(key) ? "#f4a52e" : isOcc(key) ? "#df3b2c" : "#22c55e";

  const toggleChair = (chair, e) => {
    e.stopPropagation();
    if (isOcc(chair.key)) return;
    const wasEmpty = selected.size === 0;
    setSelected((prev) => {
      const n = new Set(prev);
      n.has(chair.key) ? n.delete(chair.key) : n.add(chair.key);
      return n;
    });
    setSuccess(false);
    setError(null);
    if (wasEmpty)
      setTimeout(
        () =>
          formRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
          }),
        80,
      );
  };

  const toggleTable = (table) => {
    const free = table.chairs.filter((c) => !isOcc(c.key));
    if (!free.length) return;
    const allSel = free.every((c) => selected.has(c.key));
    const wasEmpty = selected.size === 0;
    setSelected((prev) => {
      const n = new Set(prev);
      allSel
        ? free.forEach((c) => n.delete(c.key))
        : free.forEach((c) => n.add(c.key));
      return n;
    });
    setSuccess(false);
    setError(null);
    if (wasEmpty && !allSel)
      setTimeout(
        () =>
          formRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
          }),
        80,
      );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selected.size) return;
    setSub(true);
    setError(null);
    const chairIds = TABLES.flatMap((t) =>
      t.chairs
        .filter((c) => c.id !== null && selected.has(c.key))
        .map((c) => c.id),
    );
    try {
      const res = await fetch(`${API_URL}/reservations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chairIds,
          date,
          timeStart,
          timeEnd,
          guestName: form.name,
          guestPhone: form.phone,
        }),
      });
      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        throw new Error(b.message || `Ошибка ${res.status}`);
      }
      setSuccess(true);
      setSelected(new Set());
      setForm({ name: "", phone: "" });
      await fetchStatuses();
    } catch (err) {
      setError(err.message);
    } finally {
      setSub(false);
    }
  };

  const count = selected.size;
  const summary = TABLES.map((t) => {
    const n = t.chairs.filter((c) => selected.has(c.key)).length;
    if (!n) return null;
    return `${t.label === "BAR" ? "Бар" : `Стол ${t.label}`} ×${n}`;
  })
    .filter(Boolean)
    .join(", ");

  return (
    <div
      className="bm-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div className="bm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="bm-modal__head">
          <div>
            <p className="bm-modal__eyebrow">Beer Garage</p>
            <h2 className="bm-modal__title">Выбрать места</h2>
          </div>
          <button
            className="bm-modal__close"
            onClick={onClose}
            type="button"
            aria-label="Закрыть"
          >
            ✕
          </button>
        </div>

        <div className="bm-modal__body">
          <div className="bm-filters">
            <label className="bm-filter-field">
              <span>Дата</span>
              <input
                type="date"
                value={date}
                min={todayStr()}
                onChange={(e) => setDate(e.target.value)}
              />
            </label>
            <label className="bm-filter-field">
              <span>Время с</span>
              <input
                type="time"
                value={timeStart}
                onChange={(e) => setTimeStart(e.target.value)}
              />
            </label>
            <label className="bm-filter-field">
              <span>Время по</span>
              <input
                type="time"
                value={timeEnd}
                onChange={(e) => setTimeEnd(e.target.value)}
              />
            </label>
          </div>

          <p className="bm-hint">
            Нажмите на стул — выбрать место, на стол — выбрать все свободные
          </p>

          <div className="bm-map-wrap">
            <svg
              className="bm-svg"
              viewBox="0 0 990 905"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* ── VIP комната ── */}
              <rect
                className="bm-room bm-room--vip"
                x="520"
                y="28"
                width="300"
                height="272"
                rx="6"
              />
              <text className="bm-vip-badge" x="592" y="68">
                VIP
              </text>
              {/* ── Основной зал ── */}
              <rect
                className="bm-room bm-room--main"
                x="58"
                y="300"
                width="762"
                height="570"
                rx="6"
              />
              {/* Декор: стойка снизу слева */}
              <rect
                className="bm-shelf"
                x="60"
                y="760"
                width="300"
                height="4"
                rx="3"
              />
              {/* Декор: разделитель у входа */}
              <rect
                className="bm-shelf"
                rx="3"
                x="500"
                y="770"
                width="4"
                height="100"
              />
              {/* Основной вход */}
              <line
                className="bm-wall-erase"
                x1="432"
                y1="870"
                x2="476"
                y2="870"
              />
              <line className="bm-door" x1="432" y1="850" x2="432" y2="871" />
              <line className="bm-door" x1="476" y1="850" x2="476" y2="871" />
              <line className="bm-door" x1="432" y1="850" x2="476" y2="850" />
              <text className="bm-entrance-label" x="454" y="893">
                ВХОД
              </text>
              {/* Вход в VIP */}

              <line
                className="bm-wall-erase"
                x1="618"
                y1="304"
                x2="668"
                y2="304"
              />
              <line className="bm-door" x1="618" y1="284" x2="618" y2="305" />
              <line className="bm-door" x1="668" y1="284" x2="668" y2="305" />
              <line className="bm-door" x1="618" y1="284" x2="668" y2="284" />
              <text className="bm-entrance-label" x="643" y="318">
                ВХОД
              </text>

              {/* ── Столы + стулья ── */}
              {TABLES.map((table) => {
                const free = table.chairs.filter((c) => !isOcc(c.key));
                const allSel =
                  free.length > 0 && free.every((c) => selected.has(c.key));
                const isBar = table.label === "BAR";
                const tcx = table.x + table.width / 2;
                const tcy = table.y + table.height / 2;

                return (
                  <g key={table.id}>
                    <g
                      className={`bm-table${allSel ? " bm-table--all-selected" : ""}`}
                      onClick={() => toggleTable(table)}
                      style={{ cursor: free.length ? "pointer" : "default" }}
                      role="button"
                      aria-label={`${isBar ? "Бар" : `Стол ${table.label}`} — выбрать все свободные`}
                    >
                      <rect
                        x={table.x}
                        y={table.y}
                        width={table.width}
                        height={table.height}
                        rx={4}
                        fill={
                          allSel
                            ? "rgba(244,165,46,0.18)"
                            : "rgba(255,255,255,0.08)"
                        }
                        stroke={allSel ? "#f4a52e" : "rgba(255,255,255,0.28)"}
                        strokeWidth={allSel ? 2 : 1.5}
                      />
                      <text
                        x={tcx}
                        y={isBar ? tcy + 6 : tcy + 6}
                        textAnchor="middle"
                        className="bm-tbl-name"
                        fill={allSel ? "#f4a52e" : "rgba(255,255,255,0.6)"}
                        writingMode={isBar ? "vertical-rl" : undefined}
                        pointerEvents="none"
                      >
                        {table.label}
                      </text>
                    </g>

                    {table.chairs.map((chair) => {
                      const occ = isOcc(chair.key);
                      const sel = isSel(chair.key);
                      const c = chairColor(chair.key);
                      return (
                        <g
                          key={chair.key}
                          className={[
                            "bm-chair",
                            occ ? "bm-chair--occ" : "",
                            sel ? "bm-chair--sel" : "",
                          ]
                            .join(" ")
                            .trim()}
                          onClick={(e) => toggleChair(chair, e)}
                          style={{ cursor: occ ? "default" : "pointer" }}
                          role="button"
                          aria-label={`Место, ${occ ? "занято" : sel ? "выбрано" : "свободно"}`}
                          aria-pressed={sel}
                        >
                          {sel && (
                            <circle
                              cx={chair.x}
                              cy={chair.y}
                              r={CHAIR_R + 5}
                              fill="none"
                              stroke="#f4a52e"
                              strokeWidth="1"
                              opacity="0.35"
                            />
                          )}
                          <circle
                            cx={chair.x}
                            cy={chair.y}
                            r={CHAIR_R}
                            fill={c}
                            fillOpacity={occ ? 0.15 : 0.28}
                            stroke={c}
                            strokeWidth={sel ? 2.5 : 1.5}
                          />
                        </g>
                      );
                    })}
                  </g>
                );
              })}
            </svg>

            <div className="bm-legend">
              <span className="bm-leg bm-leg--free">Свободно</span>
              <span className="bm-leg bm-leg--occ">Занято</span>
              <span className="bm-leg bm-leg--sel">Выбрано</span>
            </div>
          </div>

          {success && (
            <div className="bm-success">
              Бронь принята! Мы свяжемся с вами для подтверждения.
            </div>
          )}

          {count > 0 && (
            <div className="bm-form-wrap" ref={formRef}>
              <p className="bm-form-title">
                Бронирование
                <span className="bm-form-cap">
                  · {count}{" "}
                  {count === 1 ? "место" : count < 5 ? "места" : "мест"}
                </span>
              </p>
              {summary && <p className="bm-form-summary">{summary}</p>}

              <form className="bm-form" onSubmit={handleSubmit} noValidate>
                <div className="bm-form-grid">
                  <label className="bm-field">
                    <span>Имя</span>
                    <input
                      type="text"
                      required
                      placeholder="Ваше имя"
                      value={form.name}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, name: e.target.value }))
                      }
                    />
                  </label>
                  <label className="bm-field">
                    <span>Телефон</span>
                    <input
                      type="tel"
                      required
                      placeholder="+7 900 000-00-00"
                      value={form.phone}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, phone: e.target.value }))
                      }
                    />
                  </label>
                  <label className="bm-field">
                    <span>Дата</span>
                    <input
                      type="date"
                      required
                      min={todayStr()}
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                    />
                  </label>
                  <label className="bm-field">
                    <span>Время с</span>
                    <input
                      type="time"
                      required
                      value={timeStart}
                      onChange={(e) => setTimeStart(e.target.value)}
                    />
                  </label>
                  <label className="bm-field">
                    <span>Время по</span>
                    <input
                      type="time"
                      required
                      value={timeEnd}
                      onChange={(e) => setTimeEnd(e.target.value)}
                    />
                  </label>
                  <label className="bm-field">
                    <span>Количество гостей</span>
                    <input
                      type="number"
                      readOnly
                      value={count}
                      className="bm-field-readonly"
                    />
                  </label>
                </div>

                {apiError && <p className="bm-error">{apiError}</p>}

                <button
                  type="submit"
                  className="btn btn--primary btn--block bm-submit"
                  disabled={submitting}
                >
                  {submitting ? "Бронируем…" : "Забронировать"}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
