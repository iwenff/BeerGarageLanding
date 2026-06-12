import { useState, useEffect, useCallback, useRef } from "react";
import { TABLES } from "../shared/constants/tables.js";
import "./BookingMap.css";

const API_URL = import.meta.env.VITE_API_URL;
const CHAIR_R = 10;
const BAR_PHONE = "+7 (999) 631-69-99";

function formatPhone(val) {
  const digits = val.replace(/\D/g, "").slice(0, 11);
  let out = "";
  for (let i = 0; i < digits.length; i++) {
    if (i === 0) out += "+" + digits[i];
    else if (i === 1) out += "(" + digits[i];
    else if (i === 4) out += ")-" + digits[i];
    else if (i === 7) out += "-" + digits[i];
    else if (i === 9) out += "-" + digits[i];
    else out += digits[i];
  }
  return out;
}

const todayStr = () => new Date().toISOString().slice(0, 10);

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

const tableCap = (t) => t.chairs.length;
const is2seat  = (t) => tableCap(t) === 2;
const is4or5   = (t) => tableCap(t) === 4 || tableCap(t) === 5;
const is6seat  = (t) => tableCap(t) === 6;
const is8plus  = (t) => tableCap(t) >= 8;

function pluralSeats(n) {
  return n === 1 ? "место" : n < 5 ? "места" : "мест";
}

export default function BookingMap({ onClose }) {
  const [step, setStep] = useState("guests");
  const [guestInput, setGuestInput] = useState("");
  const [guestCount, setGuestCount] = useState(0);
  const [guestTooMany, setGuestTooMany] = useState(false);

  // occupied = Set ключей (reserved + blocked — оба нельзя выбрать)
  const [occupied,    setOccupied]    = useState(new Set());
  // blockedMeta = { [key]: blockColor } — только blocked стулья
  const [blockedMeta, setBlockedMeta] = useState({});
  const [selected,  setSelected]  = useState(new Set());
  const [date,      setDate]      = useState(todayStr);
  const [timeStart, setTimeStart] = useState(() => getInitTimes()[0]);
  const [timeEnd,   setTimeEnd]   = useState(() => getInitTimes()[1]);
  const [form,      setForm]      = useState({ name: "", phone: "" });
  const [submitting, setSub]      = useState(false);
  const [success,   setSuccess]   = useState(false);
  const [apiError,  setError]     = useState(null);
  const [noSeatsDismissed, setNoSeatsDismissed] = useState(false);
  const [mapNotice,    setMapNotice]    = useState(null);
  const [fetchLoading, setFetchLoading] = useState(false);

  const formRef = useRef(null);
  const keyToChairId = useRef({});

  useEffect(() => {
    const fn = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", fn);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", fn);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const fetchStatuses = useCallback(async () => {
    if (!date || !timeStart || !timeEnd) return;
    setNoSeatsDismissed(false);
    setFetchLoading(true);
    try {
      const qs = new URLSearchParams({ date, timeStart, timeEnd });
      const res = await fetch(`${API_URL}/tables?${qs}`);
      if (!res.ok) return;
      const data = await res.json();
      const occ = new Set();
      const blocked = {};
      const newMap = {};
      if (Array.isArray(data)) {
        data.forEach((backendTable) => {
          const frontTable = TABLES.find((t) => t.label === backendTable.label);
          if (!frontTable) return;
          backendTable.chairs.forEach((bc) => {
            // Матчинг по label, а не по индексу
            const fc = frontTable.chairs.find((c) => c.label === bc.label);
            if (!fc) return;
            newMap[fc.key] = bc.id;
            if (bc.status === "reserved") {
              occ.add(fc.key);
            } else if (bc.status === "blocked") {
              occ.add(fc.key);
              blocked[fc.key] = bc.blockColor || "#facc15";
            }
          });
        });
      }
      keyToChairId.current = newMap;
      setOccupied(occ);
      setBlockedMeta(blocked);
      setSelected((prev) => {
        const next = new Set([...prev].filter((k) => !occ.has(k)));
        return next.size !== prev.size ? next : prev;
      });
    } catch {
      /* keep current */
    } finally {
      setFetchLoading(false);
    }
  }, [date, timeStart, timeEnd]);

  useEffect(() => {
    fetchStatuses();
  }, [fetchStatuses]);

  const resetOnTimeChange = () => {
    setSelected(new Set());
    setMapNotice(null);
    setError(null);
  };

  const handleDateChange = (e) => { setDate(e.target.value); resetOnTimeChange(); };
  const handleTimeStartChange = (e) => { setTimeStart(e.target.value); resetOnTimeChange(); };
  const handleTimeEndChange   = (e) => { setTimeEnd(e.target.value);   resetOnTimeChange(); };

  const isOcc = (key) => occupied.has(key);
  const isSel = (key) => selected.has(key);
  const freeChairsOf = (table) => table.chairs.filter((c) => !isOcc(c.key));

  const computeSuitableNonBarTables = () => {
    if (!guestCount) return [];
    const nonBar = TABLES.filter((t) => t.label !== "BAR");

    let tiers;
    if (guestCount === 1)      tiers = [is2seat];
    else if (guestCount === 2) tiers = [is2seat, is4or5];
    else if (guestCount <= 5)  tiers = [is4or5, is6seat];
    else if (guestCount <= 6)  tiers = [is6seat, is8plus];
    else                       tiers = [is8plus];

    for (const tierFn of tiers) {
      const candidates = nonBar.filter(
        (t) => tierFn(t) && freeChairsOf(t).length >= guestCount,
      );
      if (candidates.length > 0) return candidates;
    }
    return [];
  };

  const suitableNonBarTables  = computeSuitableNonBarTables();
  const suitableNonBarIds     = new Set(suitableNonBarTables.map((t) => t.id));
  const barTable              = TABLES.find((t) => t.label === "BAR");
  const barFreeCount          = barTable ? freeChairsOf(barTable).length : 0;
  const barSuitable           = guestCount > 0 && barFreeCount >= guestCount;
  const hasSuitableNonBar     = suitableNonBarTables.length > 0;
  const hasAnySuitable        = hasSuitableNonBar || barSuitable;
  const showNoSeatsModal      = step === "map" && guestCount > 0 && !hasAnySuitable && !noSeatsDismissed;

  const isTableSuitable = (table) =>
    table.label === "BAR" ? barSuitable : suitableNonBarIds.has(table.id);

  // ── Step 1 ────────────────────────────────────────────────────────────────
  const handleGuestsNext = (e) => {
    e.preventDefault();
    const n = parseInt(guestInput, 10);
    if (!n || n < 1) return;
    if (n > 8) { setGuestTooMany(true); return; }
    setGuestTooMany(false);
    setGuestCount(n);
    setStep("map");
  };

  // ── Table click ───────────────────────────────────────────────────────────
  const toggleTable = (table) => {
    if (success) return;
    const suitable = isTableSuitable(table);
    if (!suitable) {
      const occCount = table.chairs.filter((c) => isOcc(c.key)).length;
      if (occCount === table.chairs.length) {
        setMapNotice(`Этот стол занят до ${timeEnd}. Попробуйте другое время`);
      }
      return;
    }
    const free = freeChairsOf(table);
    if (!free.length) return;
    const toSelect = free.slice(0, guestCount || free.length);
    const wasEmpty = selected.size === 0;
    setSelected(new Set(toSelect.map((c) => c.key)));
    setSuccess(false);
    setError(null);
    setMapNotice(null);
    if (wasEmpty) {
      setTimeout(
        () => formRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }),
        80,
      );
    }
  };

  // ── Chair click ───────────────────────────────────────────────────────────
  const toggleChair = (chair, table, tableSuitable, e) => {
    e.stopPropagation();
    if (success) return;
    if (isOcc(chair.key) || !tableSuitable) return;

    if (!selected.has(chair.key) && selected.size >= guestCount) {
      setMapNotice(`Уже выбрано ${guestCount} ${pluralSeats(guestCount)} — это максимум`);
      return;
    }

    const cap = tableCap(table);
    const fromThisTable = table.chairs.filter((c) => selected.has(c.key)).length;
    if (!selected.has(chair.key) && fromThisTable >= cap) {
      setMapNotice(`За этим столом только ${cap} ${pluralSeats(cap)}`);
      return;
    }

    setSelected((prev) => {
      const n = new Set(prev);
      n.has(chair.key) ? n.delete(chair.key) : n.add(chair.key);
      return n;
    });
    setSuccess(false);
    setError(null);
    setMapNotice(null);
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selected.size) return;
    if (selected.size !== guestCount) {
      setError(`Выберите ровно ${guestCount} ${pluralSeats(guestCount)}`);
      return;
    }
    const nowOccupied = [...selected].filter((key) => occupied.has(key));
    if (nowOccupied.length > 0) {
      setError("Упс, пока вы заполняли форму места были заняты. Выберите другие места");
      setSelected(new Set([...selected].filter((k) => !occupied.has(k))));
      return;
    }
    setSub(true);
    setError(null);
    const chairIds = [...selected]
      .map((key) => keyToChairId.current[key])
      .filter((id) => id != null);
    try {
      const res = await fetch(`${API_URL}/reservations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chairIds, date, timeStart, timeEnd, guestName: form.name, guestPhone: "+" + form.phone.replace(/\D/g, "") }),
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
  }).filter(Boolean).join(", ");

  // ── Step 1: guest count ───────────────────────────────────────────────────
  if (step === "guests") {
    return (
      <div className="bm-overlay" onClick={onClose} role="dialog" aria-modal="true">
        <div className="bm-modal" onClick={(e) => e.stopPropagation()}>
          <div className="bm-modal__head">
            <div>
              <p className="bm-modal__eyebrow">Beer Garage</p>
              <h2 className="bm-modal__title">Бронирование</h2>
            </div>
            <button className="bm-modal__close" onClick={onClose} type="button" aria-label="Закрыть">✕</button>
          </div>
          <div className="bm-modal__body">
            <form className="bm-guests-step" onSubmit={handleGuestsNext}>
              <p className="bm-guests-title">Сколько вас человек?</p>
              <div className="bm-guests-row">
                <input
                  className="bm-guests-input"
                  type="number"
                  min="1"
                  placeholder="Число гостей"
                  value={guestInput}
                  onChange={(e) => { setGuestInput(e.target.value); setGuestTooMany(false); }}
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
              {guestTooMany && (
                <p className="bm-guests-overflow">
                  Для большой компании позвоните нам, мы всё организуем:{" "}
                  <a href={`tel:${BAR_PHONE.replace(/[\s()]/g, "")}`}>{BAR_PHONE}</a>
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ── Step 2: map ───────────────────────────────────────────────────────────
  return (
    <div className="bm-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="bm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="bm-modal__head">
          <div>
            <p className="bm-modal__eyebrow">Beer Garage</p>
            <h2 className="bm-modal__title">Выбрать места</h2>
          </div>
          <button className="bm-modal__close" onClick={onClose} type="button" aria-label="Закрыть">✕</button>
        </div>

        <div className="bm-modal__body">
          {/* Фильтры */}
          <div className="bm-filters">
            <label className="bm-filter-field">
              <span>Дата</span>
              <input type="date" value={date} min={todayStr()} onChange={handleDateChange} />
            </label>
            <label className="bm-filter-field">
              <span>Время с</span>
              <input type="time" value={timeStart} onChange={handleTimeStartChange} />
            </label>
            <label className="bm-filter-field">
              <span>Время по</span>
              <input type="time" value={timeEnd} onChange={handleTimeEndChange} />
            </label>
          </div>

          <p className="bm-hint">
            {hasSuitableNonBar
              ? `Нажмите на подходящий стол — выберем ${guestCount} ${pluralSeats(guestCount)} автоматически`
              : "Бар всегда доступен — нажмите, чтобы занять место"}
          </p>

          {/* Карта */}
          <div className="bm-map-wrap" style={{ position: "relative" }}>
            {fetchLoading && (
              <div className="bm-map-loading">Обновление…</div>
            )}
            <svg
              className="bm-svg"
              viewBox="0 0 990 905"
              xmlns="http://www.w3.org/2000/svg"
              style={{ opacity: fetchLoading ? 0.5 : success ? 0.45 : 1, transition: "opacity 0.2s", pointerEvents: success ? "none" : undefined }}
            >
              {/* VIP room */}
              <rect className="bm-room bm-room--vip" x="520" y="28" width="300" height="272" rx="6" />
              <text className="bm-vip-badge" x="592" y="68">VIP</text>
              {/* Main hall */}
              <rect className="bm-room bm-room--main" x="58" y="300" width="762" height="570" rx="6" />
              {/* Decor */}
              <rect className="bm-shelf" x="60" y="760" width="300" height="4" rx="3" />
              <rect className="bm-shelf" rx="3" x="500" y="770" width="4" height="100" />
              {/* Main entrance */}
              <line className="bm-wall-erase" x1="432" y1="870" x2="476" y2="870" />
              <line className="bm-door" x1="432" y1="850" x2="432" y2="871" />
              <line className="bm-door" x1="476" y1="850" x2="476" y2="871" />
              <line className="bm-door" x1="432" y1="850" x2="476" y2="850" />
              <text className="bm-entrance-label" x="454" y="893">ВХОД</text>
              {/* VIP entrance */}
              <line className="bm-wall-erase" x1="618" y1="304" x2="668" y2="304" />
              <line className="bm-door" x1="618" y1="284" x2="618" y2="305" />
              <line className="bm-door" x1="668" y1="284" x2="668" y2="305" />
              <line className="bm-door" x1="618" y1="284" x2="668" y2="284" />
              <text className="bm-entrance-label" x="643" y="318">ВХОД</text>

              {/* Столы + стулья */}
              {TABLES.map((table) => {
                const suitable = isTableSuitable(table);
                const free = freeChairsOf(table);
                const isBar = table.label === "BAR";
                const cap = tableCap(table);
                const tcx = table.x + table.width / 2;
                const tcy = table.y + table.height / 2;

                const occCount = table.chairs.filter((c) => isOcc(c.key)).length;
                const tableOccStatus =
                  occCount === 0 ? "free" : occCount === cap ? "full" : "partial";

                const selectedFromTable = table.chairs.filter((c) => isSel(c.key)).length;
                const canClick = suitable && free.length > 0;
                const hasSelected = selectedFromTable > 0;

                const rectFill = hasSelected
                  ? "rgba(244,165,46,0.18)"
                  : !suitable
                    ? "rgba(255,255,255,0.02)"
                    : tableOccStatus === "full"
                      ? "rgba(223,59,44,0.08)"
                      : tableOccStatus === "partial"
                        ? "rgba(244,165,46,0.08)"
                        : "rgba(255,255,255,0.08)";

                const rectStroke = hasSelected
                  ? "#f4a52e"
                  : !suitable
                    ? "rgba(255,255,255,0.1)"
                    : tableOccStatus === "full"
                      ? "rgba(223,59,44,0.7)"
                      : tableOccStatus === "partial"
                        ? "rgba(244,165,46,0.6)"
                        : "rgba(255,255,255,0.28)";

                const labelFill = hasSelected
                  ? "#f4a52e"
                  : !suitable
                    ? "rgba(255,255,255,0.2)"
                    : tableOccStatus === "full"
                      ? "rgba(223,59,44,0.7)"
                      : tableOccStatus === "partial"
                        ? "rgba(244,165,46,0.85)"
                        : "rgba(255,255,255,0.6)";

                const tableOpacity = !suitable ? 0.4 : 1;
                const cursor = canClick
                  ? "pointer"
                  : tableOccStatus === "full"
                    ? "not-allowed"
                    : "default";
                const showUntil = tableOccStatus === "full" && !isBar;

                return (
                  <g key={table.id}>
                    <g
                      className={["bm-table", hasSelected ? "bm-table--all-selected" : "", !canClick ? "bm-table--disabled" : ""].join(" ").trim()}
                      onClick={() => toggleTable(table)}
                      style={{ cursor }}
                      role="button"
                      aria-label={`${isBar ? "Бар" : `Стол ${table.label}`} — ${canClick ? "выбрать места" : "недоступен"}`}
                      aria-disabled={!canClick}
                    >
                      {tableOccStatus === "full" && <title>Стол занят до {timeEnd}</title>}
                      <rect
                        x={table.x} y={table.y}
                        width={table.width} height={table.height}
                        rx={4}
                        fill={rectFill}
                        stroke={rectStroke}
                        strokeWidth={hasSelected ? 2 : 1.5}
                        opacity={tableOpacity}
                      />
                      <text
                        x={tcx}
                        y={tcy + (showUntil ? -4 : 6)}
                        textAnchor="middle"
                        className="bm-tbl-name"
                        fill={labelFill}
                        writingMode={isBar ? "vertical-rl" : undefined}
                        pointerEvents="none"
                        opacity={tableOpacity}
                      >
                        {table.label}
                      </text>
                      {showUntil && (
                        <text
                          x={tcx} y={tcy + 10}
                          textAnchor="middle"
                          fill="rgba(223,59,44,0.7)"
                          pointerEvents="none"
                          fontSize="9"
                          fontFamily="var(--font-display)"
                          opacity={tableOpacity}
                        >
                          до {timeEnd}
                        </text>
                      )}
                    </g>

                    {table.chairs.map((chair) => {
                      const occ = isOcc(chair.key);
                      const sel = isSel(chair.key);
                      const chairDim = !suitable;
                      const isBlocked = !!blockedMeta[chair.key];

                      // free=зелёный, reserved=красный, blocked=светло-жёлтый, selected=янтарный
                      const strokeColor = chairDim
                        ? "rgba(255,255,255,0.18)"
                        : sel
                          ? "#f4a52e"
                          : isBlocked
                            ? "#facc15"
                            : occ
                              ? "#ef4444"
                              : "#22c55e";
                      const fillOpacity = chairDim ? 0.08 : occ ? 0.15 : 0.28;
                      const chairOpacity = chairDim ? 0.35 : 1;

                      return (
                        <g
                          key={chair.key}
                          className={["bm-chair", occ || !suitable ? "bm-chair--occ" : "", sel ? "bm-chair--sel" : ""].join(" ").trim()}
                          onClick={(e) => toggleChair(chair, table, suitable, e)}
                          style={{ cursor: occ || !suitable ? "default" : "pointer" }}
                          role="button"
                          aria-label={`Место, ${occ ? (isBlocked ? "недоступно" : "занято") : !suitable ? "недоступно" : sel ? "выбрано" : "свободно"}`}
                          aria-pressed={sel}
                          opacity={chairOpacity}
                        >
                          {/* увеличенная область клика */}
                          <circle cx={chair.x} cy={chair.y} r={CHAIR_R + 20} fill="rgba(0,0,0,0)" style={{ pointerEvents: "all" }} />
                          {occ && !isBlocked && <title>Занято до {timeEnd}</title>}
                          {isBlocked && <title>Недоступно</title>}
                          {sel && (
                            <circle cx={chair.x} cy={chair.y} r={CHAIR_R + 5} fill="none" stroke="#f4a52e" strokeWidth="1" opacity="0.35" />
                          )}
                          <circle
                            cx={chair.x} cy={chair.y}
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
              <span className="bm-leg bm-leg--blocked">Недоступно</span>
              <span className="bm-leg bm-leg--sel">Выбрано</span>
              <span className="bm-leg bm-leg--partial">Частично занято</span>
              <span className="bm-leg bm-leg--dim">Не подходит</span>
            </div>

            {mapNotice && <div className="bm-map-notice">{mapNotice}</div>}

            {showNoSeatsModal && (
              <div className="bm-noseats-overlay">
                <div className="bm-noseats-card">
                  <p className="bm-noseats-text">
                    На это время мест нет.<br />Позвоните нам:
                  </p>
                  <a className="bm-noseats-phone" href={`tel:${BAR_PHONE.replace(/[\s()]/g, "")}`}>
                    {BAR_PHONE}
                  </a>
                  <button className="bm-noseats-dismiss" type="button" onClick={() => setNoSeatsDismissed(true)}>
                    Изменить дату или время
                  </button>
                </div>
              </div>
            )}
          </div>

          {success && (
            <div className="bm-success">
              Бронь принята! Мы свяжемся с вами для подтверждения.
              <span className="bm-success__hint">Чтобы забронировать снова — закройте и откройте раздел бронирования.</span>
            </div>
          )}

          {count > 0 && (
            <div className="bm-form-wrap" ref={formRef}>
              <p className="bm-form-title">
                Бронирование
                <span className="bm-form-cap">
                  · {guestCount} {guestCount === 1 ? "гость" : guestCount < 5 ? "гостя" : "гостей"}
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
                      onChange={(e) => {
                        const val = e.target.value.replace(/[0-9]/g, "");
                        setForm((f) => ({ ...f, name: val }));
                      }}
                    />
                  </label>
                  <label className="bm-field">
                    <span>Телефон</span>
                    <input
                      type="tel"
                      inputMode="numeric"
                      required
                      placeholder="+7(900)-000-00-00"
                      value={form.phone}
                      maxLength={18}
                      onChange={(e) => {
                        const formatted = formatPhone(e.target.value);
                        setForm((f) => ({ ...f, phone: formatted }));
                      }}
                    />
                  </label>
                  <label className="bm-field">
                    <span>Дата</span>
                    <input type="date" required min={todayStr()} value={date} onChange={handleDateChange} />
                  </label>
                  <label className="bm-field">
                    <span>Время с</span>
                    <input type="time" required value={timeStart} onChange={handleTimeStartChange} />
                  </label>
                  <label className="bm-field">
                    <span>Время по</span>
                    <input type="time" required value={timeEnd} onChange={handleTimeEndChange} />
                  </label>
                  <label className="bm-field">
                    <span>Количество гостей</span>
                    <input type="number" readOnly value={guestCount} className="bm-field-readonly" />
                  </label>
                </div>

                {apiError && <p className="bm-error">{apiError}</p>}

                <button
                  type="submit"
                  className="btn btn--primary btn--block bm-submit"
                  disabled={submitting || selected.size !== guestCount}
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
