import { useState, useEffect, useCallback } from 'react'
import AdminHeader from '../components/AdminHeader'
import { api } from '../../shared/api'
import { TABLES } from '../../shared/constants/tables.js'
import '../admin.css'

const CHAIR_R = 10
const DEFAULT_BLOCK_COLOR = '#facc15'

type ChairStatus = 'free' | 'blocked' | 'reserved'
type ChairOverride = { status: ChairStatus; blockColor?: string }

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
  return `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

export default function AdminMap() {
  const [date, setDate]           = useState(todayStr)
  const initStart                 = nowTime()
  const [timeStart, setTimeStart] = useState(initStart)
  const [timeEnd,   setTimeEnd]   = useState(() => addH(initStart, 2))

  const [apiStatus,      setApiStatus]      = useState<Map<string, ChairStatus>>(new Map())
  const [apiBlockColors, setApiBlockColors] = useState<Map<string, string>>(new Map())
  const [overrides,      setOverrides]      = useState<Map<string, ChairOverride>>(new Map())
  const [keyToId,        setKeyToId]        = useState<Map<string, number>>(new Map())
  const [labelToTableId, setLabelToTableId] = useState<Map<string, number>>(new Map())

  const [activeTable,  setActiveTable]  = useState<(typeof TABLES)[0] | null>(null)
  const [fetchLoading, setFetchLoading] = useState(false)

  const fetchStatuses = useCallback(async () => {
    if (!date || !timeStart || !timeEnd) return
    setFetchLoading(true)
    try {
      const qs  = new URLSearchParams({ date, timeStart, timeEnd })
      const res = await api.get(`/tables?${qs}`)
      if (!res.ok) return
      const data = await res.json() as Array<{
        id: number
        label: string
        chairs: Array<{ id: number; label: string; status: string; blockColor?: string | null }>
      }>
      const statusMap     = new Map<string, ChairStatus>()
      const blockColorMap = new Map<string, string>()
      const idMap         = new Map<string, number>()
      const tableMap      = new Map<string, number>()
      if (Array.isArray(data)) {
        data.forEach((bt) => {
          tableMap.set(bt.label, bt.id)
          const ft = TABLES.find((t) => t.label === bt.label)
          if (!ft) return
          bt.chairs.forEach((bc) => {
            // Матчинг по label, а не по индексу
            const fc = ft.chairs.find((c) => c.label === bc.label)
            if (!fc) return
            idMap.set(fc.key, bc.id)
            statusMap.set(fc.key, bc.status as ChairStatus)
            if (bc.status === 'blocked' && bc.blockColor) {
              blockColorMap.set(fc.key, bc.blockColor)
            }
          })
        })
      }
      setApiStatus(statusMap)
      setApiBlockColors(blockColorMap)
      setKeyToId(idMap)
      setLabelToTableId(tableMap)
      setOverrides((prev) => {
        const next = new Map(prev)
        for (const [k, v] of next) {
          if (statusMap.get(k) === v.status) next.delete(k)
        }
        return next
      })
    } catch { /* keep */ }
    finally { setFetchLoading(false) }
  }, [date, timeStart, timeEnd])

  useEffect(() => { fetchStatuses() }, [fetchStatuses])

  const getStatus = (key: string): ChairStatus =>
    overrides.get(key)?.status ?? apiStatus.get(key) ?? 'free'

  const getBlockColor = (key: string): string =>
    overrides.get(key)?.blockColor ?? apiBlockColors.get(key) ?? DEFAULT_BLOCK_COLOR

  // Клик на стул — переключает free ↔ blocked
  const toggleChair = (key: string) => {
    const cur = getStatus(key)
    if (cur === 'reserved') return
    const nextStatus: ChairStatus = cur === 'free' ? 'blocked' : 'free'
    setOverrides((prev) => {
      const next = new Map(prev)
      next.set(key, nextStatus === 'blocked'
        ? { status: 'blocked', blockColor: prev.get(key)?.blockColor ?? apiBlockColors.get(key) ?? DEFAULT_BLOCK_COLOR }
        : { status: 'free' }
      )
      return next
    })
  }

  // Клик на стол — блокирует все свободные стулья (или разблокирует все, если все уже заблокированы)
  const handleTableClick = (table: (typeof TABLES)[0]) => {
    const chairStatuses = table.chairs.map((c) => getStatus(c.key))
    const allUnavailable = chairStatuses.every((s) => s !== 'free')

    setOverrides((prev) => {
      const next = new Map(prev)
      table.chairs.forEach((c, i) => {
        const cur = chairStatuses[i]
        if (allUnavailable) {
          // Разблокировать все заблокированные (reserved не трогаем)
          if (cur === 'blocked') next.set(c.key, { status: 'free' })
        } else {
          // Заблокировать все свободные
          if (cur === 'free') {
            next.set(c.key, {
              status: 'blocked',
              blockColor: prev.get(c.key)?.blockColor ?? apiBlockColors.get(c.key) ?? DEFAULT_BLOCK_COLOR,
            })
          }
        }
      })
      return next
    })

    // Открыть/закрыть панель стола
    setActiveTable((prev) => (prev?.id === table.id ? null : table))
  }

  const setChairBlockColor = (key: string, color: string) => {
    setOverrides((prev) => {
      const next = new Map(prev)
      next.set(key, { status: 'blocked', blockColor: color })
      return next
    })
  }

  const chairColor = (key: string) => {
    const s = getStatus(key)
    if (s === 'reserved') return '#ef4444'
    if (s === 'blocked')  return getBlockColor(key)
    return '#22c55e'
  }

  const hasChanges = overrides.size > 0

  const handleSave = async () => {
    for (const table of TABLES) {
      const changed = table.chairs.filter((c) => overrides.has(c.key))
      if (!changed.length) continue
      const tableId = labelToTableId.get(table.label)
      if (!tableId) continue
      await api.patch(`/admin/tables/${tableId}/chairs`, {
        chairs: changed.map((c) => {
          const ov = overrides.get(c.key)!
          return {
            id: keyToId.get(c.key),
            status: ov.status,
            ...(ov.status === 'blocked' ? { blockColor: ov.blockColor ?? DEFAULT_BLOCK_COLOR } : {}),
          }
        }),
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
        <div className="adm-map-filters" style={{ position: 'relative' }}>
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
          {fetchLoading && <span className="adm-map-loading">Обновление…</span>}
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
          <svg className="adm-svg" viewBox="0 0 990 905" xmlns="http://www.w3.org/2000/svg"
            style={{ opacity: fetchLoading ? 0.5 : 1, transition: 'opacity 0.2s' }}
          >
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

              // Есть ли несохранённые изменения у этого стола
              const hasTableOverrides = table.chairs.some((c) => overrides.has(c.key))

              return (
                <g key={table.id}>
                  {/* Стол — клик блокирует все стулья */}
                  <g style={{ cursor: 'pointer' }} onClick={() => handleTableClick(table)}>
                    <rect
                      x={table.x} y={table.y}
                      width={table.width} height={table.height}
                      rx={4}
                      fill={
                        isActive
                          ? 'rgba(244,165,46,0.18)'
                          : hasTableOverrides
                            ? 'rgba(244,165,46,0.08)'
                            : 'rgba(255,255,255,0.06)'
                      }
                      stroke={isActive ? '#f4a52e' : hasTableOverrides ? 'rgba(244,165,46,0.5)' : 'rgba(255,255,255,0.22)'}
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

                  {/* Стулья */}
                  {table.chairs.map((chair) => {
                    const status = getStatus(chair.key)
                    const color  = chairColor(chair.key)
                    const isRes  = status === 'reserved'
                    return (
                      <g
                        key={chair.key}
                        style={{ cursor: isRes ? 'default' : 'pointer' }}
                        onClick={(e) => { e.stopPropagation(); toggleChair(chair.key) }}
                      >
                        {isRes && <title>Занято — активная бронь</title>}
                        {isActive && (
                          <circle
                            cx={chair.x} cy={chair.y}
                            r={CHAIR_R + 4}
                            fill="none"
                            stroke="#f4a52e"
                            strokeWidth={1.5}
                            strokeDasharray="3 2"
                            opacity={0.7}
                            pointerEvents="none"
                          />
                        )}
                        <circle
                          cx={chair.x} cy={chair.y}
                          r={CHAIR_R}
                          fill={color}
                          fillOpacity={0.25}
                          stroke={color}
                          strokeWidth={isActive ? 2.5 : 1.5}
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
            <span className="adm-leg adm-leg--reserved">Занято (бронь)</span>
            <span className="adm-leg adm-leg--blocked">Заблокировано</span>
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
              {activeTable.chairs.map((chair) => {
                const status     = getStatus(chair.key)
                const blockColor = getBlockColor(chair.key)
                return (
                  <div key={chair.key} className="adm-chair-row">
                    <button
                      className={`adm-chair-btn adm-chair-btn--${status}`}
                      onClick={() => toggleChair(chair.key)}
                      disabled={status === 'reserved'}
                    >
                      {chair.label}
                      {' · '}
                      {status === 'free' ? 'Свободно' : status === 'reserved' ? 'Бронь' : 'Заблок.'}
                    </button>
                    {status === 'blocked' && (
                      <input
                        type="color"
                        className="adm-color-pick"
                        value={blockColor}
                        title="Цвет блокировки"
                        onChange={(e) => setChairBlockColor(chair.key, e.target.value)}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
