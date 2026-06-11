import { useState } from 'react'
import { api } from '../../shared/api'

interface Chair {
  id: number
  label: string
  table?: { label: string }
}

interface Reservation {
  id: number
  guestName: string
  guestPhone: string
  date: string
  timeStart: string
  timeEnd: string
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED'
  chairs: Chair[]
}

interface Props {
  reservation: Reservation
  onRefresh: () => void
}

const MONTHS = ['января','февраля','марта','апреля','мая','июня',
                 'июля','августа','сентября','октября','ноября','декабря']

function formatDate(d: string) {
  const [y, m, day] = d.split('-')
  return `${parseInt(day)} ${MONTHS[parseInt(m) - 1]} ${y}`
}

function chairsSummary(chairs: Chair[]) {
  const grouped: Record<string, string[]> = {}
  chairs.forEach((c) => {
    const tLabel = c.table?.label ?? c.label?.split('-')[0] ?? '?'
    ;(grouped[tLabel] ??= []).push(c.label)
  })
  return Object.entries(grouped)
    .map(([t, cs]) => `${t === 'BAR' ? 'Бар' : `Стол ${t}`} (${cs.join(', ')})`)
    .join('; ')
}

const STATUS_MAP = {
  PENDING:   { label: 'Ожидает',      cls: 'pending',   icon: '⏳' },
  CONFIRMED: { label: 'Подтверждено', cls: 'confirmed', icon: '✅' },
  CANCELLED: { label: 'Отменено',     cls: 'cancelled', icon: '❌' },
}

export default function ReservationCard({ reservation: r, onRefresh }: Props) {
  const [busy, setBusy] = useState(false)
  const [extending, setExtending] = useState(false)
  const [newEnd, setNewEnd] = useState(r.timeEnd)

  const act = async (fn: () => Promise<void>) => {
    setBusy(true)
    try { await fn() } catch { /* ignore */ } finally { setBusy(false) }
    onRefresh()
  }

  const confirm = () => act(() => api.patch(`/admin/reservations/${r.id}/confirm`, {}).then(() => {}))
  const cancel  = () => act(() => api.patch(`/admin/reservations/${r.id}/cancel`,  {}).then(() => {}))
  const extend  = async () => {
    if (!newEnd || newEnd === r.timeEnd) { setExtending(false); return }
    await act(() => api.patch(`/admin/reservations/${r.id}`, { timeEnd: newEnd }).then(() => {}))
    setExtending(false)
  }

  const s = STATUS_MAP[r.status] ?? STATUS_MAP.PENDING
  const isCancelled = r.status === 'CANCELLED'

  return (
    <div className={`adm-card${isCancelled ? ' adm-card--cancelled' : ''}`}>
      {/* Name + phone */}
      <div className="adm-card__row">
        <span className="adm-card__name">👤 {r.guestName}</span>
        <span className="adm-card__phone">📞 {r.guestPhone}</span>
      </div>

      {/* Date / time / guests */}
      <div className="adm-card__meta">
        <span>📅 {formatDate(r.date)}</span>
        <span>⏰ {r.timeStart} – {r.timeEnd}</span>
        <span>👥 {r.chairs.length} {r.chairs.length === 1 ? 'персона' : r.chairs.length < 5 ? 'персоны' : 'персон'}</span>
      </div>

      {/* Chairs */}
      {r.chairs.length > 0 && (
        <p className="adm-card__chairs">🪑 {chairsSummary(r.chairs)}</p>
      )}

      {/* Footer: status + actions */}
      <div className="adm-card__footer">
        <span className={`adm-badge adm-badge--${s.cls}`}>{s.icon} {s.label}</span>

        {!isCancelled && (
          <>
            {r.status === 'PENDING' && (
              <button className="adm-btn adm-btn--confirm" onClick={confirm} disabled={busy}>
                ✅ Подтвердить
              </button>
            )}

            {extending ? (
              <span className="adm-extend-row">
                <input
                  className="adm-extend-input"
                  type="time"
                  value={newEnd}
                  autoFocus
                  onChange={(e) => setNewEnd(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') extend() }}
                  onBlur={extend}
                />
                <button className="adm-btn adm-btn--ghost" onClick={() => setExtending(false)}>✕</button>
              </span>
            ) : (
              <button className="adm-btn adm-btn--extend" onClick={() => { setNewEnd(r.timeEnd); setExtending(true) }} disabled={busy}>
                ✏️ Продлить
              </button>
            )}

            <button className="adm-btn adm-btn--cancel" onClick={cancel} disabled={busy}>
              ❌ Отменить
            </button>
          </>
        )}
      </div>
    </div>
  )
}
