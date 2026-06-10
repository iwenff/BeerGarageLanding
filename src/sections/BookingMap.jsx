import { useState, useEffect, useCallback, useRef } from 'react'
import './BookingMap.css'

const API = process.env.NEXT_PUBLIC_API_URL

const TABLES = [
  { id: 1, label: '1',   capacity: 4, x: 300, y: 200, width: 80,  height: 60  },
  { id: 2, label: '2',   capacity: 4, x: 105, y: 320, width: 100, height: 60  },
  { id: 3, label: '3',   capacity: 6, x: 105, y: 430, width: 110, height: 70  },
  { id: 4, label: 'VIP', capacity: 6, x: 480, y: 58,  width: 130, height: 100 },
  { id: 5, label: 'BAR', capacity: 6, x: 530, y: 300, width: 50,  height: 160 },
]

const todayStr = () => new Date().toISOString().slice(0, 10)

export default function BookingMap({ onClose }) {
  const [statuses, setStatuses]     = useState({})
  const [selectedIdx, setSelected]  = useState(null)
  const [date, setDate]             = useState(todayStr)
  const [timeStart, setTimeStart]   = useState('18:00')
  const [timeEnd, setTimeEnd]       = useState('21:00')
  const [form, setForm]             = useState({ name: '', phone: '', guests: 1 })
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess]       = useState(false)
  const [apiError, setApiError]     = useState(null)
  const formRef   = useRef(null)
  const scrollRef = useRef(null)

  // Закрытие по Escape, блокировка прокрутки
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const fetchStatuses = useCallback(async () => {
    if (!date || !timeStart || !timeEnd) return
    try {
      const qs = new URLSearchParams({ date, timeStart, timeEnd })
      const res = await fetch(`${API}/tables?${qs}`)
      if (!res.ok) return
      const data = await res.json()
      const map = {}
      if (Array.isArray(data)) data.forEach(t => { map[t.id] = t.status ?? 'free' })
      setStatuses(map)
    } catch { /* бэк может быть ещё не поднят */ }
  }, [date, timeStart, timeEnd])

  useEffect(() => { fetchStatuses() }, [fetchStatuses])

  const tableStatus = (t) => (t.id ? statuses[t.id] ?? 'free' : 'free')

  const tableColor = (t, idx) => {
    if (idx === selectedIdx) return '#f4a52e'
    return tableStatus(t) === 'occupied' ? '#df3b2c' : '#22c55e'
  }

  const handleTableClick = (idx) => {
    const t = TABLES[idx]
    if (tableStatus(t) === 'occupied') return
    const next = idx === selectedIdx ? null : idx
    setSelected(next)
    setSuccess(false)
    setApiError(null)
    if (next !== null) {
      setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 80)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (selectedIdx === null) return
    const t = TABLES[selectedIdx]
    setSubmitting(true)
    setApiError(null)
    try {
      const res = await fetch(`${API}/reservations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableId:     t.id,
          date,
          timeStart,
          timeEnd,
          guestsCount: Number(form.guests),
          guestName:   form.name,
          guestPhone:  form.phone,
        }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.message || `Ошибка ${res.status}`)
      }
      setSuccess(true)
      setSelected(null)
      setForm({ name: '', phone: '', guests: 1 })
      await fetchStatuses()
    } catch (err) {
      setApiError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const sel = selectedIdx !== null ? TABLES[selectedIdx] : null

  return (
    <div className="bm-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Бронирование стола">
      <div className="bm-modal" onClick={e => e.stopPropagation()}>

        {/* Шапка */}
        <div className="bm-modal__head">
          <div>
            <p className="bm-modal__eyebrow">Beer Garage</p>
            <h2 className="bm-modal__title">Забронировать стол</h2>
          </div>
          <button className="bm-modal__close" onClick={onClose} aria-label="Закрыть" type="button">✕</button>
        </div>

        {/* Прокручиваемое тело */}
        <div className="bm-modal__body" ref={scrollRef}>

          {/* Фильтры даты и времени */}
          <div className="bm-filters">
            <label className="bm-filter-field">
              <span>Дата</span>
              <input type="date" value={date} min={todayStr()} onChange={e => setDate(e.target.value)} />
            </label>
            <label className="bm-filter-field">
              <span>Время с</span>
              <input type="time" value={timeStart} onChange={e => setTimeStart(e.target.value)} />
            </label>
            <label className="bm-filter-field">
              <span>Время по</span>
              <input type="time" value={timeEnd} onChange={e => setTimeEnd(e.target.value)} />
            </label>
          </div>

          <p className="bm-hint">Нажмите на свободный стол, чтобы выбрать его</p>

          {/* Карта зала */}
          <div className="bm-map-wrap">
            <svg
              className="bm-svg"
              viewBox="0 0 700 590"
              xmlns="http://www.w3.org/2000/svg"
              aria-label="Карта зала Beer Garage"
            >
              {/* Основной зал */}
              <rect className="bm-room" x="65" y="183" width="590" height="395" rx="8" />

              {/* VIP комната */}
              <rect className="bm-room bm-room--vip" x="453" y="20" width="202" height="170" rx="8" />
              <text className="bm-room-label bm-room-label--vip" x="554" y="46">VIP</text>

              {/* Туалеты */}
              <rect className="bm-room bm-room--service" x="90"  y="20" width="130" height="88" rx="6" />
              <rect className="bm-room bm-room--service" x="232" y="20" width="130" height="88" rx="6" />
              <text className="bm-room-label" x="155" y="68">Туалет</text>
              <text className="bm-room-label" x="297" y="68">Туалет</text>

              {/* Вход */}
              <line className="bm-entrance-gap" x1="315" y1="578" x2="415" y2="578" />
              <text className="bm-entrance-label" x="365" y="596">ВХОД</text>

              {/* Столы */}
              {TABLES.map((t, idx) => {
                const color    = tableColor(t, idx)
                const occupied = tableStatus(t) === 'occupied'
                const isBar    = t.label === 'BAR'
                const cx       = t.x + t.width  / 2
                const cy       = t.y + t.height / 2
                return (
                  <g
                    key={idx}
                    className={[
                      'bm-table',
                      occupied          ? 'bm-table--occupied' : '',
                      isBar             ? 'bm-table--bar'      : '',
                      idx === selectedIdx ? 'bm-table--selected': '',
                    ].join(' ').trim()}
                    onClick={() => handleTableClick(idx)}
                    style={{ cursor: occupied ? 'not-allowed' : 'pointer' }}
                    role={isBar ? undefined : 'button'}
                    aria-label={isBar ? undefined : `Стол ${t.label}, ${t.capacity} человек`}
                  >
                    <rect
                      x={t.x} y={t.y}
                      width={t.width} height={t.height}
                      rx="6"
                      fill={color}
                      fillOpacity={isBar ? 0.12 : 0.18}
                      stroke={color}
                      strokeWidth={idx === selectedIdx ? 2.5 : 1.5}
                    />
                    <text
                      x={cx}
                      y={isBar ? cy + 6 : cy - 2}
                      textAnchor="middle"
                      className="bm-tbl-name"
                      fill={color}
                    >
                      {t.label === 'BAR' ? 'BAR' : `Стол ${t.label}`}
                    </text>
                    {!isBar && (
                      <text x={cx} y={cy + 14} textAnchor="middle" className="bm-tbl-cap" fill={color}>
                        {t.capacity} чел.
                      </text>
                    )}
                  </g>
                )
              })}
            </svg>

            {/* Легенда */}
            <div className="bm-legend">
              <span className="bm-leg bm-leg--free">Свободен</span>
              <span className="bm-leg bm-leg--occ">Занят</span>
              <span className="bm-leg bm-leg--sel">Выбран</span>
            </div>
          </div>

          {/* Успешное бронирование */}
          {success && (
            <div className="bm-success">
              Бронь принята! Мы свяжемся с вами для подтверждения.
            </div>
          )}

          {/* Форма — появляется после выбора стола */}
          {sel && (
            <div className="bm-form-wrap" ref={formRef}>
              <p className="bm-form-title">
                {sel.label === 'VIP' ? 'VIP-зал' : sel.label === 'BAR' ? 'Барная зона' : `Стол ${sel.label}`}
                <span className="bm-form-cap">· до {sel.capacity} чел.</span>
              </p>

              <form className="bm-form" onSubmit={handleSubmit} noValidate>
                <div className="bm-form-grid">
                  <label className="bm-field">
                    <span>Имя</span>
                    <input
                      type="text"
                      required
                      placeholder="Ваше имя"
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    />
                  </label>

                  <label className="bm-field">
                    <span>Телефон</span>
                    <input
                      type="tel"
                      required
                      placeholder="+7 900 000-00-00"
                      value={form.phone}
                      onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    />
                  </label>

                  <label className="bm-field">
                    <span>Дата</span>
                    <input
                      type="date"
                      required
                      min={todayStr()}
                      value={date}
                      onChange={e => setDate(e.target.value)}
                    />
                  </label>

                  <label className="bm-field">
                    <span>Время с</span>
                    <input
                      type="time"
                      required
                      value={timeStart}
                      onChange={e => setTimeStart(e.target.value)}
                    />
                  </label>

                  <label className="bm-field">
                    <span>Время по</span>
                    <input
                      type="time"
                      required
                      value={timeEnd}
                      onChange={e => setTimeEnd(e.target.value)}
                    />
                  </label>

                  <label className="bm-field">
                    <span>Количество гостей</span>
                    <input
                      type="number"
                      required
                      min="1"
                      max={sel.capacity}
                      value={form.guests}
                      onChange={e => setForm(f => ({ ...f, guests: e.target.value }))}
                    />
                  </label>
                </div>

                {apiError && <p className="bm-error">{apiError}</p>}

                <button
                  type="submit"
                  className="btn btn--primary btn--block bm-submit"
                  disabled={submitting}
                >
                  {submitting ? 'Бронируем…' : 'Забронировать'}
                </button>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
