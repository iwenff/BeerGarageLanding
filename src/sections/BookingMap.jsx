import { useState, useEffect, useCallback, useRef } from "react";
import "./BookingMap.css";

const API_URL = "https://beergarage-back-production.up.railway.app";
const CHAIR_R = 10;
const BAR_PHONE = "+7 (999) 631-69-99";

const RAW_TABLES = [
  {
    id: 1,
    label: "1",
    x: 105,
    y: 580,
    width: 70,
    height: 100,
    chairs: [
      { x: 80, y: 590 },
      { x: 80, y: 630 },
      { x: 200, y: 605 },
      { x: 200, y: 655 },
      { x: 80, y: 670 },
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
      { x: 90, y: 325 },
      { x: 140, y: 325 },
      { x: 190, y: 325 },
      { x: 240, y: 325 },
      { x: 90, y: 435 },
      { x: 140, y: 435 },
      { x: 190, y: 435 },
      { x: 240, y: 435 },
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
      { x: 440, y: 320 },
      { x: 440, y: 360 },
      { x: 565, y: 320 },
      { x: 565, y: 360 },
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
      { x: 545, y: 110 },
      { x: 545, y: 230 },
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
      { x: 700, y: 55 },
      { x: 740, y: 55 },
      { x: 780, y: 55 },
      { x: 710, y: 150 },
      { x: 660, y: 105 },
      { x: 760, y: 150 },
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
      { x: 690, y: 275 },
      { x: 800, y: 275 },
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
      { x: 550, y: 820 },
      { x: 590, y: 820 },
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
      { x: 630, y: 440 },
      { x: 630, y: 485 },
      { x: 630, y: 535 },
      { x: 630, y: 585 },
      { x: 630, y: 635 },
      { x: 630, y: 685 },
      { x: 630, y: 735 },
      { x: 630, y: 785 },
    ],
  },
];

const TABLES = RAW_TABLES.map((t) => ({
  ...t,
  chairs: t.chairs.map((c, i) => ({ ...c, key: `${t.id}_${i}` })),
}));

const todayStr = () => new Date().toISOString().slice(0, 10);

export default function BookingMap({ onClose }) {
  // Step 1: enter guest count; Step 2: pick table on map
  const [step, setStep] = useState("guests");
  const [guestInput, setGuestInput] = useState("");
  const [guestCount, setGuestCount] = useState(0);

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

  // frontChair.key → real backend chair id (populated after fetchStatuses)
  const keyToChairId = useRef({});

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

  const fetchStatuses = useCallback(async () => {
    if (!date || !timeStart || !timeEnd) return;
    try {
      const qs = new URLSearchParams({ date, timeStart, timeEnd });
      const res = await fetch(`${API_URL}/tables?${qs}`);
      if (!res.ok) return;
      const data = await res.json();
      const occ = new Set();
      const newMap = {};
      if (Array.isArray(data)) {
        data.forEach((backendTable) => {
          // Match frontend table by label
          const frontTable = TABLES.find((t) => t.label === backendTable.label);
          if (!frontTable) return;
          // Match chairs by index order — backend and frontend must have same count
          backendTable.chairs.forEach((backendChair, idx) => {
            const frontChair = frontTable.chairs[idx];
            if (!frontChair) return;
            newMap[frontChair.key] = backendChair.id;
            if (backendChair.status === "occupied") occ.add(frontChair.key);
          });
        });
      }
      keyToChairId.current = newMap;
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

  // Smart seat logic
  const freeChairsOf = (table) => table.chairs.filter((c) => !isOcc(c.key));

  const isTableSuitable = (table) => {
    if (table.label === "BAR") return true;
    return freeChairsOf(table).length >= guestCount;
  };

  // Non-BAR tables sorted by ascending free seat count (smallest fit first)
  const suitableNonBar = TABLES.filter(
    (t) => t.label !== "BAR" && isTableSuitable(t),
  ).sort((a, b) => freeChairsOf(a).length - freeChairsOf(b).length);

  const hasSuitableNonBar = suitableNonBar.length > 0;

  const handleGuestsNext = (e) => {
    e.preventDefault();
    const n = parseInt(guestInput, 10);
    if (!n || n < 1) return;
    setGuestCount(n);
    setStep("map");
  };

  // Auto-select exactly guestCount free chairs from this table
  const toggleTable = (table) => {
    if (!isTableSuitable(table)) return;
    const free = freeChairsOf(table);
    if (!free.length) return;
    const toSelect = free.slice(0, guestCount || free.length);
    const wasEmpty = selected.size === 0;
    setSelected(new Set(toSelect.map((c) => c.key)));
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

  const toggleChair = (chair, tableSuitable, e) => {
    e.stopPropagation();
    if (isOcc(chair.key) || !tableSuitable) return;
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selected.size) return;
    setSub(true);
    setError(null);

    const chairIds = [...selected]
      .map((key) => keyToChairId.current[key])
      .filter((id) => id != null);

    console.log("[BookingMap] Выбранные стулья перед отправкой:", {
      selectedKeys: [...selected],
      chairIds,
      keyToChairIdMap: { ...keyToChairId.current },
    });

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

  // ── Step 1: enter guest count ──────────────────────────────────────────────
  if (step === "guests") {
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
              <h2 className="bm-modal__title">Бронирование</h2>
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
            <form className="bm-guests-step" onSubmit={handleGuestsNext}>
              <p className="bm-guests-title">Сколько вас человек?</p>
              <div className="bm-guests-row">
                <input
                  className="bm-guests-input"
                  type="number"
                  min="1"
                  max="30"
                  placeholder="Число гостей"
                  value={guestInput}
                  onChange={(e) => setGuestInput(e.target.value)}
                  autoFocus
                />
                <button
                  type="submit"
                  className="btn btn--primary bm-guests-btn"
                  disabled={!guestInput || parseInt(guestInput, 10) < 1}
                >
                  Далее
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ── Step 2: map ────────────────────────────────────────────────────────────
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

          {!hasSuitableNonBar && (
            <div className="bm-no-seats">
              Свободных мест нет. Позвоните нам:{" "}
              <a href={`tel:${BAR_PHONE.replace(/\s/g, "")}`}>{BAR_PHONE}</a>
            </div>
          )}

          <p className="bm-hint">
            {hasSuitableNonBar
              ? `Нажмите на подходящий стол — выберем ${guestCount} ${guestCount === 1 ? "место" : guestCount < 5 ? "места" : "мест"} автоматически`
              : "Бар всегда доступен — нажмите, чтобы занять место"}
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
                const suitable = isTableSuitable(table);
                const free = freeChairsOf(table);
                const allSel =
                  free.length > 0 && free.every((c) => selected.has(c.key));
                const isBar = table.label === "BAR";
                const tcx = table.x + table.width / 2;
                const tcy = table.y + table.height / 2;
                const disabled = !suitable || !free.length;

                return (
                  <g key={table.id}>
                    <g
                      className={[
                        "bm-table",
                        allSel ? "bm-table--all-selected" : "",
                        disabled ? "bm-table--disabled" : "",
                      ]
                        .join(" ")
                        .trim()}
                      onClick={() => !disabled && toggleTable(table)}
                      style={{ cursor: disabled ? "default" : "pointer" }}
                      role="button"
                      aria-label={`${isBar ? "Бар" : `Стол ${table.label}`} — ${disabled ? "недоступен" : "выбрать места"}`}
                      aria-disabled={disabled}
                    >
                      <rect
                        x={table.x}
                        y={table.y}
                        width={table.width}
                        height={table.height}
                        rx={4}
                        fill={
                          disabled
                            ? "rgba(255,255,255,0.02)"
                            : allSel
                              ? "rgba(244,165,46,0.18)"
                              : "rgba(255,255,255,0.08)"
                        }
                        stroke={
                          disabled
                            ? "rgba(255,255,255,0.1)"
                            : allSel
                              ? "#f4a52e"
                              : "rgba(255,255,255,0.28)"
                        }
                        strokeWidth={allSel ? 2 : 1.5}
                        opacity={disabled ? 0.4 : 1}
                      />
                      <text
                        x={tcx}
                        y={tcy + 6}
                        textAnchor="middle"
                        className="bm-tbl-name"
                        fill={
                          disabled
                            ? "rgba(255,255,255,0.2)"
                            : allSel
                              ? "#f4a52e"
                              : "rgba(255,255,255,0.6)"
                        }
                        writingMode={isBar ? "vertical-rl" : undefined}
                        pointerEvents="none"
                        opacity={disabled ? 0.4 : 1}
                      >
                        {table.label}
                      </text>
                    </g>

                    {table.chairs.map((chair) => {
                      const occ = isOcc(chair.key);
                      const sel = isSel(chair.key);
                      const c = disabled
                        ? "rgba(255,255,255,0.2)"
                        : chairColor(chair.key);
                      return (
                        <g
                          key={chair.key}
                          className={[
                            "bm-chair",
                            occ || disabled ? "bm-chair--occ" : "",
                            sel ? "bm-chair--sel" : "",
                          ]
                            .join(" ")
                            .trim()}
                          onClick={(e) =>
                            toggleChair(chair, suitable && !occ, e)
                          }
                          style={{
                            cursor:
                              occ || disabled ? "default" : "pointer",
                          }}
                          role="button"
                          aria-label={`Место, ${occ ? "занято" : disabled ? "недоступно" : sel ? "выбрано" : "свободно"}`}
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
                            fillOpacity={occ || disabled ? 0.1 : 0.28}
                            stroke={c}
                            strokeWidth={sel ? 2.5 : 1.5}
                            opacity={disabled ? 0.35 : 1}
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
              <span className="bm-leg bm-leg--dim">Не подходит</span>
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
                  · {guestCount}{" "}
                  {guestCount === 1
                    ? "гость"
                    : guestCount < 5
                      ? "гостя"
                      : "гостей"}
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
                      value={guestCount}
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
