import { useRef, useState } from 'react'
import gsap from 'gsap'
import { EVENTS, LINKS } from '../data'
import { ArrowIcon, ChatIcon } from '../components/icons'
import './Events.css'

export default function Events() {
  const slideRef = useRef(null)
  const [index, setIndex] = useState(0)
  const ev = EVENTS[index]
  const multiple = EVENTS.length > 1

  const go = (dir) => {
    if (!multiple) return
    const next = (index + dir + EVENTS.length) % EVENTS.length
    gsap.fromTo(
      slideRef.current,
      { autoAlpha: 1, x: 0 },
      { autoAlpha: 0, x: dir > 0 ? -40 : 40, duration: 0.25, ease: 'power2.in',
        onComplete: () => {
          setIndex(next)
          gsap.fromTo(slideRef.current, { autoAlpha: 0, x: dir > 0 ? 40 : -40 }, { autoAlpha: 1, x: 0, duration: 0.4, ease: 'power3.out' })
        } }
    )
  }

  return (
    <section className="section events" id="events">
      <div className="container">
        <div className="section-head events__head">
          <div>
            <span className="eyebrow" data-reveal>Афиша гаража</span>
            <h2 className="heading" data-reveal>Ивенты <span className="accent">и движ</span></h2>
          </div>
          <p className="lead" data-reveal>
            В Beer Garage всегда что-то происходит. Турниры, тематические вечера и игры —
            следи за афишей, чтобы не пропустить своё.
          </p>
        </div>

        <div className="events__card" data-reveal>
          <div className="events__slide" ref={slideRef}>
            <div className="events__media">
              <img src={ev.img} alt={ev.title} />
            </div>
            <div className="events__content">
              <span className="events__kicker">{ev.kicker}</span>
              <h3 className="events__title">{ev.title}</h3>
              <p className="events__desc">{ev.desc}</p>
              <div className="events__tags">
                {ev.tags.map((t) => <span key={t}>{t}</span>)}
              </div>
              <a className="btn btn--primary" href={LINKS.whatsapp} target="_blank" rel="noopener noreferrer">
                <ChatIcon /> Записаться на ивент
              </a>
            </div>
          </div>

          <div className="events__controls">
            <button className="events__arrow" onClick={() => go(-1)} disabled={!multiple} aria-label="Назад">
              <ArrowIcon style={{ transform: 'rotate(180deg)' }} />
            </button>
            <div className="events__dots">
              {EVENTS.map((_, i) => (
                <span key={i} className={i === index ? 'is-active' : ''} />
              ))}
              {!multiple && <em>Скоро добавим ещё</em>}
            </div>
            <button className="events__arrow" onClick={() => go(1)} disabled={!multiple} aria-label="Вперёд">
              <ArrowIcon />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
