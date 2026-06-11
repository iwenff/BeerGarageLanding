import { useState, useEffect, useCallback } from 'react'
import AdminHeader from '../components/AdminHeader'
import ReservationCard from '../components/ReservationCard'
import { api } from '../../shared/api'
import '../admin.css'

type TabType    = 'today' | 'all'
type StatusType = 'ALL' | 'PENDING' | 'CONFIRMED' | 'CANCELLED'

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

const STATUS_FILTERS: { value: StatusType; label: string }[] = [
  { value: 'ALL',       label: 'Все'          },
  { value: 'PENDING',   label: 'Ожидает'      },
  { value: 'CONFIRMED', label: 'Подтверждено' },
  { value: 'CANCELLED', label: 'Отменено'     },
]

const STATUS_ORDER: Record<string, number> = { PENDING: 0, CONFIRMED: 1, CANCELLED: 2 }

export default function AdminReservations() {
  const [tab, setTab]             = useState<TabType>('today')
  const [filter, setFilter]       = useState<StatusType>('ALL')
  const [reservations, setRes]    = useState<Reservation[]>([])
  const [loading, setLoading]     = useState(true)
  const name = localStorage.getItem('name') || 'Администратор'

  const fetchData = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (tab === 'today') params.set('date', 'today')
      if (filter !== 'ALL') params.set('status', filter)
      const res  = await api.get(`/admin/reservations?${params}`)
      const data = await res.json()
      const list: Reservation[] = Array.isArray(data) ? data : []
      list.sort((a, b) => (STATUS_ORDER[a.status] ?? 99) - (STATUS_ORDER[b.status] ?? 99))
      setRes(list)
    } catch {
      /* keep current */
    } finally {
      setLoading(false)
    }
  }, [tab, filter])

  useEffect(() => {
    setLoading(true)
    fetchData()
  }, [fetchData])

  // Автообновление каждые 30 секунд
  useEffect(() => {
    const id = setInterval(fetchData, 30_000)
    return () => clearInterval(id)
  }, [fetchData])

  return (
    <div className="admin-app">
      <AdminHeader />

      <div className="adm-page">
        <div className="adm-page__head">
          <h1 className="adm-page__greeting">Привет, {name}!</h1>

          <div className="adm-tabs">
            <button
              className={`adm-tab${tab === 'today' ? ' active' : ''}`}
              onClick={() => setTab('today')}
            >
              Сегодня
            </button>
            <button
              className={`adm-tab${tab === 'all' ? ' active' : ''}`}
              onClick={() => setTab('all')}
            >
              Все брони
            </button>
          </div>
        </div>

        {/* Status filters */}
        <div className="adm-filters" style={{ marginBottom: 20 }}>
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              className={`adm-filter-btn${filter === f.value ? ' active' : ''}`}
              onClick={() => setFilter(f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Cards */}
        {loading ? (
          <p className="adm-empty">Загрузка…</p>
        ) : reservations.length === 0 ? (
          <p className="adm-empty">Броней не найдено</p>
        ) : (
          <div className="adm-cards">
            {reservations.map((r) => (
              <ReservationCard key={r.id} reservation={r} onRefresh={fetchData} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
