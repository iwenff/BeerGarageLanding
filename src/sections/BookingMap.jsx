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

// Returns [timeStart, timeEnd] initialised to current time rounded up to next 30-min slot
function getInitTimes() {
  const now = new Date();
  const h = now.getHours();
  const m = now.getMinutes();
  const startTotalMin = m < 30 ? h * 60 + 30 : (h + 1) * 60;
  const endTotalMin = startTotalMin + 120;
  const fmt = (totalMin) => {
    const hh = Math.floor(totalMin / 60) % 24;
    const mm = totalMin % 60;
    return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
  };
  return [fmt(startTotalMin), fmt(endTotalMin)];
}

export default function BookingMap({ onClose }) {
  // ── шаг 1: ввод гостей; шаг 2: карта ──────────────────────────────────────
  const [step, setStep] = useState("guests");
  const [guestInput, setGuestInput] = useState("");
  const [guestCount, setGuestCount] = useState(0);

  const [occupied, setOccupied] = useState(new Set());
  const [selected, setSelected] = useState(new Set());
  const [date, setDate] = useState(todayStr);
  const [timeStart, setTimeStart] = useState(() => getInitTimes()[0]);
  const [timeEnd, setTimeEnd] = useState(() => getInitTimes()[1]);
  const [form, setForm] = useState({ name: "", phone: "" });
  const [submitting, setSub] = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiError, setError] = useState(null);
  // управление модалкой "нет мест"
  const [noSeatsDismissed, setNoSeatsDismissed] = useState(false);

  const formRef = useRef(null);
  // frontChair.key → real backend chair id
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
    // при каждом новом запросе сбрасываем dismissed, чтобы модалка могла открыться снова
    setNoSeatsDismissed(false);
    try {
      const qs = new URLSearchParams({ date, timeStart, timeEnd });
      const res = await fetch(`${API_URL}/tables?${qs}`);
      if (!res.ok) return;
      const data = await res.json();
      const occ = new Set();
      const newMap = {};
      if (Array.isArray(data)) {
        data.forEach((backendTable) => {
          const frontTable = TABLES.find((t) => t.label === backendTable.label);
          if (!frontTable) return;
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

  // ── умная фильтрация столов ────────────────────────────────────────────────
  const freeChairsOf = (table) => table.chairs.filter((c) => !isOcc(c.key));

  // Находим минимальное количество свободных мест среди столов, которые вообще
  // могут вместить гостей. Только столы с этим минимумом считаются подходящими.
  const nonBarCandidates = TABLES.filter(
    (t) => t.label !== "BAR" && freeChairsOf(t).length >= guestCount,
  );
  const minFreeSeats =
    nonBarCandidates.length > 0
      ? Math.min(...nonBarCandidates.map((t) => freeChairsOf(t).length))
      : Infinity;

  const isTableSuitable = (table) => {
    if (table.label === "BAR") return true;
    const free = freeChairsOf(table).length;
    return free >= guestCount && free === minFreeSeats;
  };

  const hasSuitableNonBar = nonBarCandidates.length > 0;
  const showNoSeatsModal = step === "map" && !hasSuitableNonBar && !noSeatsDismissed;

  // ── handlers ───────────────────────────────────────────────────────────────
  const handleGuestsNext = (e) => {
    e.preventDefault();
    const n = parseInt(guestInput, 10);
    if (!n || n < 1) return;
    setGuestCount(n);
    setStep("map");
  };

  // Авто-выбор ровно guestCount свободных мест за этим столом
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

  // ── Step 1: ввод количества гостей ────────────────────────────────────────
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

  // ── Step 2: карта ──────────────────────────────────────────────────────────
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
          {/* ── Фильтры даты/времени ── */}
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
            {hasSuitableNonBar
              ? `Нажмите на подходящий стол — выберем ${guestCount} ${guestCount === 1 ? "место" : guestCount < 5 ? "места" : "мест"} автоматически`
              : "Бар всегда доступен — нажмите, чтобы занять место"}
          </p>

          {/* ── Карта ── */}
          <div className="bm-map-wrap" style={{ position: "relative" }}>
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
                const isBar = table.label === "BAR";
                const tcx = table.x + table.width / 2;
                const tcy = table.y + table.height / 2;

                const occCount = table.chairs.filter((c) =>
                  isOcc(c.key),
                ).length;
                const tableOccStatus =
                  occCount === 0
                    ? "free"
                    : occCount === table.chairs.length
                      ? "full"
                      : "partial";

                // canClick: подходящий размер И есть свободные места
                const canClick = suitable && free.length > 0;
                const allSelFree =
                  free.length > 0 && free.every((c) => selected.has(c.key));

                // Цвета прямоугольника стола
                const rectFill = allSelFree
                  ? "rgba(244,165,46,0.18)"
                  : !suitable
                    ? "rgba(255,255,255,0.02)"
                    : tableOccStatus === "full"
                      ? "rgba(223,59,44,0.08)"
                      : tableOccStatus === "partial"
                        ? "rgba(244,165,46,0.08)"
                        : "rgba(255,255,255,0.08)";

                const rectStroke = allSelFree
                  ? "#f4a52e"
                  : !suitable
                    ? "rgba(255,255,255,0.1)"
                    : tableOccStatus === "full"
                      ? "rgba(223,59,44,0.55)"
                      : tableOccStatus === "partial"
                        ? "rgba(244,165,46,0.6)"
                        : "rgba(255,255,255,0.28)";

                const labelFill = allSelFree
                  ? "#f4a52e"
                  : !suitable
                    ? "rgba(255,255,255,0.2)"
                    : tableOccStatus === "full"
                      ? "rgba(223,59,44,0.7)"
                      : tableOccStatus === "partial"
                        ? "rgba(244,165,46,0.85)"
                        : "rgba(255,255,255,0.6)";

                const tableOpacity = !suitable ? 0.4 : 1;

                return (
                  <g key={table.id}>
                    <g
                      className={[
                        "bm-table",
                        allSelFree ? "bm-table--all-selected" : "",
                        !canClick ? "bm-table--disabled" : "",
                      ]
                        .join(" ")
                        .trim()}
                      onClick={() => canClick && toggleTable(table)}
                      style={{ cursor: canClick ? "pointer" : "default" }}
                      role="button"
                      aria-label={`${isBar ? "Бар" : `Стол ${table.label}`} — ${canClick ? "выбрать места" : "недоступен"}`}
                      aria-disabled={!canClick}
                    >
                      <rect
                        x={table.x}
                        y={table.y}
                        width={table.width}
                        height={table.height}
                        rx={4}
                        fill={rectFill}
                        stroke={rectStroke}
                        strokeWidth={allSelFree ? 2 : 1.5}
                        opacity={tableOpacity}
                      />
                      <text
                        x={tcx}
                        y={tcy + 6}
                        textAnchor="middle"
                        className="bm-tbl-name"
                        fill={labelFill}
                        writingMode={isBar ? "vertical-rl" : undefined}
                        pointerEvents="none"
                        opacity={tableOpacity}
                      >
                        {table.label}
                      </text>
                    </g>

                    {table.chairs.map((chair) => {
                      const occ = isOcc(chair.key);
                      const sel = isSel(chair.key);

                      // Стулья на недоступных столах — тусклые
                      const chairDim = !suitable;
                      const strokeColor = chairDim
                        ? "rgba(255,255,255,0.18)"
                        : sel
                          ? "#f4a52e"
                          : occ
                            ? "#df3b2c"
                            : "#22c55e";
                      const fillOpacity = chairDim ? 0.08 : occ ? 0.15 : 0.28;
                      const chairOpacity = chairDim ? 0.35 : 1;

                      return (
                        <g
                          key={chair.key}
                          className={[
                            "bm-chair",
                            occ || !canClick ? "bm-chair--occ" : "",
                            sel ? "bm-chair--sel" : "",
                          ]
                            .join(" ")
                            .trim()}
                          onClick={(e) =>
                            toggleChair(chair, suitable && !occ, e)
                          }
                          style={{
                            cursor:
                              occ || !suitable ? "default" : "pointer",
                          }}
                          role="button"
                          aria-label={`Место, ${occ ? "занято" : !suitable ? "недоступно" : sel ? "выбрано" : "свободно"}`}
                          aria-pressed={sel}
                          opacity={chairOpacity}
                        >
                          {/* Тултип для занятых мест */}
                          {occ && (
                            <title>Занято до {timeEnd}</title>
                          )}
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
                            fill={strokeColor}
                            fillOpacity={fillOpacity}
                            stroke={strokeColor}
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
              <span className="bm-leg bm-leg--partial">Частично занято</span>
              <span className="bm-leg bm-leg--dim">Не подходит</span>
            </div>

            {/* ── Модалка "нет свободных мест" ── */}
            {showNoSeatsModal && (
              <div className="bm-noseats-overlay">
                <div className="bm-noseats-card">
                  <p className="bm-noseats-text">
                    На это время свободных мест нет.
                    <br />
                    Позвоните нам и мы подберём вариант:
                  </p>
                  <a
                    className="bm-noseats-phone"
                    href={`tel:${BAR_PHONE.replace(/[\s()]/g, "")}`}
                  >
                    {BAR_PHONE}
                  </a>
                  <button
                    className="bm-noseats-dismiss"
                    type="button"
                    onClick={() => setNoSeatsDismissed(true)}
                  >
                    Изменить дату или время
                  </button>
                </div>
              </div>
            )}
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
                  ·{" "}
                  {guestCount}{" "}
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
