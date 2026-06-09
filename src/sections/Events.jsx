import { useRef, useState, useEffect } from 'react'
import { EVENTS, LINKS } from '../data'
import { WhatsAppIcon, MaxIcon } from '../components/icons'
import './Events.css'

/* ============================================================
   MODAL — detailed event info + inline media viewer
   ============================================================ */
function EventModal({ event, onClose, onMaxClick }) {
  const [mediaMode, setMediaMode] = useState('photo') // 'photo' | 'video' (sports only)
  const [photoZoomed, setPhotoZoomed] = useState(false)

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        if (photoZoomed) { setPhotoZoomed(false); return }
        onClose()
      }
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose, photoZoomed])

  const isVideo = event.type === 'video'
  const isGradient = event.type === 'gradient'
  const isImage = event.type === 'image'

  // показывать ли «нажмите для увеличения»
  const photoShown = isImage || (isVideo && mediaMode === 'photo')

  return (
    <div className="emodal-overlay" onClick={onClose}>
      <div className="emodal" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">
        <button className="emodal__close" onClick={onClose} type="button" aria-label="Закрыть">✕</button>

        {/* ---- Primary media ---- */}
        <div className="emodal__media">

          {/* Фото (image-тип или foto-tab спорта) */}
          {(isImage || (isVideo && mediaMode === 'photo')) && (
            <img
              src={event.img}
              alt={event.title}
              className="emodal__media--zoomable"
              onClick={e => { e.stopPropagation(); setPhotoZoomed(true) }}
            />
          )}

          {/* Видео (video-tab спорта) */}
          {isVideo && mediaMode === 'video' && (
            <video
              src={event.video}
              poster={event.img}
              autoPlay
              controls
              playsInline
              className="emodal__media--video"
            />
          )}

          {/* Градиент */}
          {isGradient && (
            <div className={`emodal__media-grad emodal__media-grad--${event.gradient}`}>
              <span>{event.decoIcon}</span>
            </div>
          )}

          {/* Подсказка «нажмите для увеличения» на фото */}
          {photoShown && (
            <div className="emodal__zoom-hint" aria-hidden>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35M11 8v6M8 11h6"/>
              </svg>
              Нажмите для увеличения
            </div>
          )}

          {/* Переключатель Фото / Видео для спорта */}
          {isVideo && (
            <div className="emodal__media-tabs" onClick={e => e.stopPropagation()}>
              <button
                className={mediaMode === 'photo' ? 'active' : ''}
                onClick={() => setMediaMode('photo')}
                type="button"
              >📷 Фото</button>
              <button
                className={mediaMode === 'video' ? 'active' : ''}
                onClick={() => setMediaMode('video')}
                type="button"
              >▶ Видео</button>
            </div>
          )}
        </div>

        {/* ---- Content ---- */}
        <div className="emodal__content">
          {event.decoration === 'pong' && (
            <div className="emodal__deco emodal__deco--pong">{event.decoIcon}</div>
          )}
          {event.decoration === 'f1' && (
            <div className="emodal__deco emodal__deco--f1">{event.decoIcon}</div>
          )}
          {event.decoration === 'cards' && (
            <div className="emodal__deco emodal__deco--ace">
              <span className="ace-rank">A</span>
              <span className="ace-suit">♠</span>
            </div>
          )}

          <span className="emodal__kicker">{event.kicker}</span>
          <h3 className="emodal__title">{event.title}</h3>
          <p className="emodal__desc">{event.desc}</p>
          <div className="emodal__tags">
            {event.tags.map(t => <span key={t}>{t}</span>)}
          </div>

          {event.booking && (
            <div className="emodal__booking">
              <span className="emodal__booking-label">Для бронирования обращайтесь</span>
              <div className="emodal__booking-btns">
                <a className="ecard__mini-btn ecard__mini-btn--wa" href={LINKS.whatsapp} target="_blank" rel="noopener noreferrer">
                  <WhatsAppIcon /> Написать в Вацап
                </a>
                <button className="ecard__mini-btn ecard__mini-btn--max" onClick={() => { onClose(); onMaxClick() }} type="button">
                  <MaxIcon /> Написать в Макс
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ---- Фото на весь экран поверх модалки ---- */}
      {photoZoomed && (
        <div className="emodal__lb" onClick={e => { e.stopPropagation(); setPhotoZoomed(false) }}>
          <button className="emodal__lb-close" onClick={() => setPhotoZoomed(false)} type="button" aria-label="Закрыть">✕</button>
          <img
            src={event.img}
            alt={event.title}
            className="emodal__lb-img"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  )
}

/* ============================================================
   EVENT CARD — только превью, без expand-кнопки
   ============================================================ */
function EventCard({ event, onOpenModal }) {
  return (
    <article
      className="ecard"
      onClick={() => onOpenModal(event)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onOpenModal(event)}
    >
      <div className="ecard__media">
        {event.type === 'image' && <img src={event.img} alt={event.title} loading="lazy" />}
        {event.type === 'video' && (
          <video src={event.video} poster={event.img} autoPlay muted loop playsInline className="ecard__video" />
        )}
        {event.type === 'gradient' && (
          <div className={`ecard__gradient ecard__gradient--${event.gradient}`}>
            <span className="ecard__gradient-icon">{event.decoIcon}</span>
          </div>
        )}
        <span className="ecard__kicker">{event.kicker}</span>
        <div className="ecard__hint">Нажми для деталей →</div>
      </div>

      <div className="ecard__body">
        <h3 className="ecard__title">{event.title}</h3>
        <p className="ecard__desc">{event.desc}</p>
        <div className="ecard__tags">
          {event.tags.map(t => <span key={t}>{t}</span>)}
        </div>
        <div className="ecard__tap-bar">Нажмите, чтобы узнать подробнее</div>
      </div>
    </article>
  )
}

/* ============================================================
   MAIN COMPONENT
   ============================================================ */
export default function Events({ onMaxClick }) {
  const trackRef = useRef(null)
  const posRef = useRef(0)
  const rafRef = useRef(null)
  const halfWRef = useRef(0)
  const pausedRef = useRef(false)
  const modalOpenRef = useRef(false)

  const [activeEvent, setActiveEvent] = useState(null)
  const doubled = [...EVENTS, ...EVENTS]

  useEffect(() => {
    const track = trackRef.current
    if (!track) return

    const measure = () => { halfWRef.current = track.scrollWidth / 2 }

    const tick = () => {
      if (!pausedRef.current && halfWRef.current > 0) {
        posRef.current -= 0.55
        if (posRef.current <= -halfWRef.current) posRef.current += halfWRef.current
        track.style.transform = `translateX(${posRef.current}px)`
      }
      rafRef.current = requestAnimationFrame(tick)
    }

    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(track)
    rafRef.current = requestAnimationFrame(tick)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      ro.disconnect()
    }
  }, [])

  const openModal = (ev) => {
    pausedRef.current = true
    modalOpenRef.current = true
    setActiveEvent(ev)
  }
  const closeModal = () => {
    setActiveEvent(null)
    modalOpenRef.current = false
    pausedRef.current = false
  }

  return (
    <section className="section events" id="events">
      <div className="container">
        <div className="section-head events__head">
          <div>
            <span className="eyebrow" data-reveal>Движ в гараже</span>
            <h2 className="heading" data-reveal>Развлечения <span className="accent">и ивенты</span></h2>
          </div>
          <p className="lead" data-reveal>
            Алко-понг, трансляции матчей и горы настолок.
            Приходи с компанией — что-нибудь да придумаем.
          </p>
        </div>
      </div>

      <div
        className="events__gallery"
        onMouseEnter={() => { if (!modalOpenRef.current) pausedRef.current = true }}
        onMouseLeave={() => { if (!modalOpenRef.current) pausedRef.current = false }}
      >
        <div className="events__track" ref={trackRef}>
          {doubled.map((ev, i) => (
            <EventCard key={`${ev.id}-${i}`} event={ev} onOpenModal={openModal} />
          ))}
        </div>
      </div>

      {activeEvent && (
        <EventModal event={activeEvent} onClose={closeModal} onMaxClick={onMaxClick} />
      )}
    </section>
  )
}
