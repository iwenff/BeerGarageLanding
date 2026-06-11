import { useState, useEffect, useCallback } from 'react'
import AdminHeader from '../components/AdminHeader'
import { api } from '../../shared/api'
import { TABLES } from '../../shared/constants/tables.js'
import '../admin.css'

const CHAIR_R = 10

type ChairStatus = 'free' | 'occupied' | 'reserved'

// Текущее время → строка HH:MM
function nowTime() {
  const d = new Date()
  const h = String(d.getHours()).padStart(2, '0')
  const m = String(d.getMinutes()).padStart(2, '0')
  return `${h}:${m}`
}
function todayStr() { return new Date().toISOString().slice(0, 10) }
function addH(t: string, h: number) {
  const [hh, mm] = t.split(':').map(Number)
  const total = hh * 60 + mm + h * 60
  return `${String(Math.floor(total / 60) % 24).padStart(2,'0')}:${String(total % 60).padStart(2,'0')}`
}

export default function AdminMap() {
  const [date, setDate]           = useState(todayStr)
  const initStart                 = nowTime()
  const [timeStart, setTimeStart] = useState(initStart)
  const [timeEnd,   setTimeEnd]   = useState(() => addH(initStart, 2))

  // key → actual status from API
  const [apiStatus, setApiStatus] = useState<Map<string, ChairStatus>>(new Map())
  // key → admin override (pending save)
  const [overrides, setOverrides] = useState<Map<string, ChairStatus>>(new Map())
  // key → backend chair id
  const [keyToId,   setKeyToId]   = useState<Map<string, number>>(new Map())
  // label → backend table id
  const [labelToTableId, setLabelToTableId] = useState<Map<string, number>>(new Map())

  // Selected table for bottom panel
  const [activeTable, setActiveTable] = useState<(typeof TABLES)[0] | null>(null)

  const fetchStatuses = useCallback(async () => {
    if (!date || !timeStart || !timeEnd) return
    try {
      const qs  = new URLSearchParams({ date, timeStart, timeEnd })
      const res = await api.get(`/tables?${qs}`)
      if (!res.ok) return
      const data = await res.json() as Array<{ id: number; label: string; chairs: Array<{ id: number; label: string; status: string }> }>
      const statusMap = new Map<string, ChairStatus>()
      const idMap     = new Map<string, number>()
      const tableMap  = new Map<string, number>()
      if (Array.isArray(data)) {
        data.forEach((bt) => {
          tableMap.set(bt.label, bt.id)
          const ft = TABLES.find((t) => t.label === bt.label)
          if (!ft) return
          bt.chairs.forEach((bc, idx) => {
            const fc = ft.chairs[idx]
            if (!fc) return
            idMap.set(fc.key, bc.id)
            statusMap.set(fc.key, bc.status as ChairStatus)
          })
        })
      }
      setApiStatus(statusMap)
      setKeyToId(idMap)
      setLabelToTableId(tableMap)
      // Сбросить переопределения которые теперь совпадают с API
      setOverrides((prev) => {
        const next = new Map(prev)
        for (const [k, v] of next) {
          if (statusMap.get(k) === v) next.delete(k)
        }
        return next
      })
    } catch { /* keep */ }
  }, [date, timeStart, timeEnd])

  useEffect(() => { fetchStatuses() }, [fetchStatuses])

  const getStatus = (key: string): ChairStatus =>
    overrides.get(key) ?? apiStatus.get(key) ?? 'free'

  const toggleChair = (key: string) => {
    const cur = getStatus(key)
    if (cur === 'occupied') return          // нельзя снять реальную бронь
    const next: ChairStatus = cur === 'free' ? 'reserved' : 'free'
    setOverrides((prev) => new Map(prev).set(key, next))
  }

  const chairColor = (key: string) => {
    const s = getStatus(key)
    return s === 'occupied' ? '#ef4444' : s === 'reserved' ? '#f4a52e' : '#22c55e'
  }

  const hasChanges = overrides.size > 0

  const handleSave = async () => {
    // Группируем изменения по таблицам
    for (const table of TABLES) {
      const changed = table.chairs.filter((c) => overrides.has(c.key))
      if (!changed.length) continue
      const tableId = labelToTableId.get(table.label)
      if (!tableId) continue
      await api.patch(`/admin/tables/${tableId}/chairs`, {
        chairs: changed.map((c) => ({ id: keyToId.get(c.key), status: overrides.get(c.key) })),
      })
    }
    setOverrides(new Map())
    await fetchStatuses()
  }

  const handleReset = async () => {
    for (const table of TABLES) {
      const tableId = labelToTableId.get(table.label)
      if (!tableId) continue
      await api.patch(`/admin/tables/${tableId}/chairs`, {
        chairs: table.chairs.map((c) => ({ id: keyToId.get(c.key), status: 'free' })),
      })
    }
    setOverrides(new Map())
    await fetchStatuses()
  }

  return (
    <div className="admin-app">
      <AdminHeader />

      <div className="adm-map-page">
        {/* Фильтры */}
        <div className="adm-map-filters">
          <label className="adm-map-filter">
            <span>Дата</span>
            <input type="date" value={date} min={todayStr()} onChange={(e) => setDate(e.target.value)} />
          </label>
          <label className="adm-map-filter">
            <span>Время с</span>
            <input type="time" value={timeStart} onChange={(e) => setTimeStart(e.target.value)} />
          </label>
          <label className="adm-map-filter">
            <span>Время по</span>
            <input type="time" value={timeEnd} onChange={(e) => setTimeEnd(e.target.value)} />
          </label>
        </div>

        {/* Действия */}
        <div className="adm-map-actions">
          <button className="adm-map-btn adm-map-btn--save" onClick={handleSave} disabled={!hasChanges}>
            Сохранить изменения
          </button>
          <button className="adm-map-btn adm-map-btn--reset" onClick={handleReset}>
            Сбросить всё
          </button>
          {hasChanges && (
            <span className="adm-map-changes">
              {overrides.size} {overrides.size === 1 ? 'изменение' : 'изменений'} не сохранено
            </span>
          )}
        </div>

        {/* Карта */}
        <div className="adm-map-wrap">
          <svg className="adm-svg" viewBox="0 0 990 905" xmlns="http://www.w3.org/2000/svg">
            {/* ── VIP комната ── */}
            <rect className="bm-room bm-room--vip" x="520" y="28"  width="300" height="272" rx="6" />
            <text className="bm-vip-badge" x="592" y="68">VIP</text>
            {/* ── Основной зал ── */}
            <rect className="bm-room bm-room--main" x="58"  y="300" width="762" height="570" rx="6" />
            <rect className="bm-shelf" x="60"  y="760" width="300" height="4"   rx="3" />
            <rect className="bm-shelf" rx="3"  x="500" y="770" width="4"   height="100" />
            {/* Входы */}
            <line className="bm-wall-erase" x1="432" y1="870" x2="476" y2="870" />
            <line className="bm-door" x1="432" y1="850" x2="432" y2="871" />
            <line className="bm-door" x1="476" y1="850" x2="476" y2="871" />
            <line className="bm-door" x1="432" y1="850" x2="476" y2="850" />
            <text className="bm-entrance-label" x="454" y="893">ВХОД</text>
            <line className="bm-wall-erase" x1="618" y1="304" x2="668" y2="304" />
            <line className="bm-door" x1="618" y1="284" x2="618" y2="305" />
            <line className="bm-door" x1="668" y1="284" x2="668" y2="305" />
            <line className="bm-door" x1="618" y1="284" x2="668" y2="284" />
            <text className="bm-entrance-label" x="643" y="318">ВХОД</text>

            {/* ── Столы + стулья ── */}
            {TABLES.map((table) => {
              const isBar    = table.label === 'BAR'
              const tcx      = table.x + table.width  / 2
              const tcy      = table.y + table.height / 2
              const isActive = activeTable?.id === table.id

              return (
                <g key={table.id}>
                  {/* Стол (клик → открыть панель) */}
                  <g
                    style={{ cursor: 'pointer' }}
                    onClick={() => setActiveTable((prev) => prev?.id === table.id ? null : table)}
                  >
                    <rect
                      x={table.x} y={table.y}
                      width={table.width} height={table.height}
                      rx={4}
                      fill={isActive ? 'rgba(244,165,46,0.12)' : 'rgba(255,255,255,0.06)'}
                      stroke={isActive ? '#f4a52e' : 'rgba(255,255,255,0.22)'}
                      strokeWidth={isActive ? 2 : 1.5}
                    />
                    <text
                      x={tcx} y={tcy + 6}
                      textAnchor="middle"
                      className="bm-tbl-name"
                      fill={isActive ? '#f4a52e' : 'rgba(255,255,255,0.55)'}
                      writingMode={isBar ? 'vertical-rl' : undefined}
                      pointerEvents="none"
                    >
                      {table.label}
                    </text>
                  </g>

                  {/* Стулья (клик → переключить статус) */}
                  {table.chairs.map((chair) => {
                    const status = getStatus(chair.key)
                    const color  = chairColor(chair.key)
                    const isOcc  = status === 'occupied'
                    return (
                      <g
                        key={chair.key}
                        style={{ cursor: isOcc ? 'default' : 'pointer' }}
                        onClick={(e) => { e.stopPropagation(); toggleChair(chair.key) }}
                      >
                        {isOcc && <title>Занято до {timeEnd}</title>}
                        <circle
                          cx={chair.x} cy={chair.y}
                          r={CHAIR_R}
                          fill={color}
                          fillOpacity={0.25}
                          stroke={color}
                          strokeWidth={1.5}
                        />
                      </g>
                    )
                  })}
                </g>
              )
            })}
          </svg>

          {/* Легенда */}
          <div className="adm-legend">
            <span className="adm-leg adm-leg--free">Свободно</span>
            <span className="adm-leg adm-leg--occ">Занято (бронь)</span>
            <span className="adm-leg adm-leg--reserved">Заблокировано</span>
          </div>
        </div>

        {/* Панель выбранного стола */}
        {activeTable && (
          <div className="adm-table-panel">
            <div className="adm-panel__title">
              <span>
                {activeTable.label === 'BAR' ? 'Бар' : `Стол ${activeTable.label}`}
                {' — '}
                {activeTable.chairs.length} мест
              </span>
              <button className="adm-panel__close" onClick={() => setActiveTable(null)}>✕</button>
            </div>

            <div className="adm-panel__chairs">
              {activeTable.chairs.map((chair, idx) => {
                const status = getStatus(chair.key)
                return (
                  <button
                    key={chair.key}
                    className={`adm-chair-btn adm-chair-btn--${status}`}
                    onClick={() => toggleChair(chair.key)}
                    disabled={status === 'occupied'}
                  >
                    {activeTable.label}-{idx + 1}
                    {' · '}
                    {status === 'free' ? 'Свободно' : status === 'occupied' ? 'Занято' : 'Заблок.'}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
