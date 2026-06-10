import { useRef, useState, useEffect } from 'react'
import { EVENTS, LINKS } from '../data'
import { WhatsAppIcon, MaxIcon } from '../components/icons'
import './Events.css'

/* ============================================================
   MODAL
   ============================================================ */
function EventModal({ event, onClose, onMaxClick }) {
  const [mediaMode, setMediaMode] = useState('photo')
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

  const isVideo    = event.type === 'video'
  const isGradient = event.type === 'gradient'
  const isImage    = event.type === 'image'
  const photoShown = isImage || (isVideo && mediaMode === 'photo')

  return (
    <div className="emodal-overlay" onClick={onClose}>
      <div className="emodal" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">

        {/* Крестик — position:absolute, привязан к модалке, не к вьюпорту */}
        <button className="emodal__close" onClick={onClose} type="button" aria-label="Закрыть">✕</button>

        {/* ---- Media ---- */}
        <div className="emodal__media">
          {(isImage || (isVideo && mediaMode === 'photo')) && (
            <img
              src={event.img}
              alt={event.title}
              className="emodal__media--zoomable"
              onClick={e => { e.stopPropagation(); setPhotoZoomed(true) }}
            />
          )}
          {isVideo && mediaMode === 'video' && (
            <video src={event.video} poster={event.img} autoPlay controls playsInline className="emodal__media--video" />
          )}
          {isGradient && (
            <div className={`emodal__media-grad emodal__media-grad--${event.gradient}`}>
              <span>{event.decoIcon}</span>
            </div>
          )}
          {photoShown && (
            <div className="emodal__zoom-hint" aria-hidden>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35M11 8v6M8 11h6"/>
              </svg>
              Нажмите для увеличения
            </div>
          )}
          {isVideo && (
            <div className="emodal__media-tabs" onClick={e => e.stopPropagation()}>
              <button className={mediaMode === 'photo' ? 'active' : ''} onClick={() => setMediaMode('photo')} type="button">📷 Фото</button>
              <button className={mediaMode === 'video' ? 'active' : ''} onClick={() => setMediaMode('video')} type="button">▶ Видео</button>
            </div>
          )}
        </div>

        {/* ---- Content ---- */}
        <div className="emodal__content">
          {event.decoration === 'pong'  && <div className="emodal__deco emodal__deco--pong">{event.decoIcon}</div>}
          {event.decoration === 'f1'    && <div className="emodal__deco emodal__deco--f1">{event.decoIcon}</div>}
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
                  <WhatsAppIcon /> Написать в WhatsApp
                </a>
                <button className="ecard__mini-btn ecard__mini-btn--max" onClick={() => { onClose(); onMaxClick() }} type="button">
                  <MaxIcon /> Написать в Макс
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Фото fullscreen поверх модалки */}
      {photoZoomed && (
        <div className="emodal__lb" onClick={e => { e.stopPropagation(); setPhotoZoomed(false) }}>
          <button className="emodal__lb-close" onClick={() => setPhotoZoomed(false)} type="button" aria-label="Закрыть">✕</button>
          <img src={event.img} alt={event.title} className="emodal__lb-img" onClick={e => e.stopPropagation()} />
        </div>
      )}
    </div>
  )
}

/* ============================================================
   EVENT CARD
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
        {event.type === 'image'    && <img src={event.img} alt={event.title} loading="lazy" />}
        {event.type === 'video'    && <video src={event.video} poster={event.img} autoPlay muted loop playsInline className="ecard__video" />}
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
const FRICTION    = 0.93   // momentum decay per frame (~iOS feel)
const MIN_VEL     = 0.25   // velocity below which momentum stops
const AUTO_SPEED  = 0.55   // px/frame for auto-scroll

export default function Events({ onMaxClick }) {
  const trackRef      = useRef(null)
  const wrapRef       = useRef(null)   // outer wrap — for hover arrow state
  const posRef        = useRef(0)
  const rafRef        = useRef(null)
  const halfWRef      = useRef(0)
  const pausedRef     = useRef(false)
  const modalOpenRef  = useRef(false)
  const velocityRef   = useRef(0)      // momentum velocity

  // drag state
  const isDraggingRef = useRef(false)
  const didDragRef    = useRef(false)
  const dragLastXRef  = useRef(0)

  const [activeEvent, setActiveEvent] = useState(null)
  const doubled = [...EVENTS, ...EVENTS]

  /* --- RAF: auto-scroll + momentum --- */
  useEffect(() => {
    const track = trackRef.current
    if (!track) return

    const measure = () => { halfWRef.current = track.scrollWidth / 2 }

    const tick = () => {
      if (!isDraggingRef.current) {
        const vel = velocityRef.current
        if (Math.abs(vel) > MIN_VEL) {
          // momentum phase — continue with friction
          posRef.current   += vel
          velocityRef.current = vel * FRICTION
        } else {
          velocityRef.current = 0
          // resume auto-scroll once momentum exhausted
          if (!pausedRef.current && !modalOpenRef.current) {
            posRef.current -= AUTO_SPEED
          }
        }
      }

      // infinite wrap
      if (halfWRef.current > 0) {
        if (posRef.current <= -halfWRef.current) posRef.current += halfWRef.current
        if (posRef.current >  0)                 posRef.current -= halfWRef.current
      }
      track.style.transform = `translateX(${posRef.current}px)`
      rafRef.current = requestAnimationFrame(tick)
    }

    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(track)
    rafRef.current = requestAnimationFrame(tick)
    return () => { cancelAnimationFrame(rafRef.current); ro.disconnect() }
  }, [])

  /* --- Drag / swipe + momentum --- */
  const onPointerDown = (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    isDraggingRef.current = true
    didDragRef.current    = false
    dragLastXRef.current  = e.clientX
    velocityRef.current   = 0
    wrapRef.current?.classList.add('is-dragging')
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e) => {
    if (!isDraggingRef.current) return
    const dx = e.clientX - dragLastXRef.current
    dragLastXRef.current = e.clientX
    if (Math.abs(dx) > 2) didDragRef.current = true
    posRef.current += dx
    // EMA — blends raw input into a smooth velocity estimate
    velocityRef.current = velocityRef.current * 0.5 + dx * 0.5
  }

  const onPointerUp = () => {
    if (!isDraggingRef.current) return
    isDraggingRef.current = false
    wrapRef.current?.classList.remove('is-dragging')
    // velocityRef keeps its value → tick picks up momentum immediately
  }

  const onClickCapture = (e) => {
    if (didDragRef.current) {
      e.stopPropagation()
      didDragRef.current = false
    }
  }

  const openModal = (ev) => {
    isDraggingRef.current = false
    velocityRef.current   = 0
    wrapRef.current?.classList.remove('is-dragging')
    pausedRef.current    = true
    modalOpenRef.current = true
    setActiveEvent(ev)
  }
  const closeModal = () => {
    setActiveEvent(null)
    modalOpenRef.current = false
    pausedRef.current    = false
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

      {/*
        Wrapper sits OUTSIDE the masked gallery so arrows aren't
        affected by mask-image fade. Hover on wrapper → show arrows.
      */}
      <div className="events__wrap" ref={wrapRef}>
        {/* Desktop-only drag arrow hints */}
        <button
          className="events__arrow events__arrow--left"
          aria-hidden="true"
          tabIndex={-1}
          type="button"
          onClick={() => { velocityRef.current = 10 }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <button
          className="events__arrow events__arrow--right"
          aria-hidden="true"
          tabIndex={-1}
          type="button"
          onClick={() => { velocityRef.current = -10 }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="9 6 15 12 9 18"/>
          </svg>
        </button>

        <div
          className="events__gallery"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
          onClickCapture={onClickCapture}
          onMouseEnter={() => { if (!modalOpenRef.current) pausedRef.current = true }}
          onMouseLeave={() => { if (!modalOpenRef.current) pausedRef.current = false }}
        >
          <div className="events__track" ref={trackRef}>
            {doubled.map((ev, i) => (
              <EventCard key={`${ev.id}-${i}`} event={ev} onOpenModal={openModal} />
            ))}
          </div>
        </div>
      </div>

      {activeEvent && (
        <EventModal event={activeEvent} onClose={closeModal} onMaxClick={onMaxClick} />
      )}
    </section>
  )
}
