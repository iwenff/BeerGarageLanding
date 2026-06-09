import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { LINKS } from '../data'
import { WhatsAppIcon, MaxIcon, ArrowIcon } from '../components/icons'
import './Hero.css'

export default function Hero() {
  const root = useRef(null)

  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
    tl.from('.hero__bg', { scale: 1.18, duration: 2.2, ease: 'power2.out' }, 0)
      .from('.hero__eyebrow', { y: 24, opacity: 0, duration: 0.7 }, 0.3)
      .from('.hero__title .line span', { yPercent: 120, duration: 1, stagger: 0.12, ease: 'power4.out' }, 0.35)
      .from('.hero__lead', { y: 24, opacity: 0, duration: 0.7 }, 0.9)
      .from('.hero__cta > *', { y: 26, opacity: 0, duration: 0.6, stagger: 0.12 }, 1.05)
      .from('.hero__stats .stat', { y: 20, opacity: 0, duration: 0.5, stagger: 0.1 }, 1.25)
      .from('.hero__scroll', { opacity: 0, duration: 0.6 }, 1.5)

    // parallax background on scroll
    gsap.to('.hero__bg', {
      yPercent: 18,
      ease: 'none',
      scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true },
    })
    // subtle pointer parallax (desktop)
    if (window.matchMedia('(pointer:fine)').matches) {
      const move = (e) => {
        const x = (e.clientX / window.innerWidth - 0.5)
        const y = (e.clientY / window.innerHeight - 0.5)
        gsap.to('.hero__bg', { x: x * -28, y: y * -28, duration: 0.8, ease: 'power2.out' })
        gsap.to('.hero__glass', { x: x * 22, y: y * 22, duration: 0.8, ease: 'power2.out' })
      }
      window.addEventListener('pointermove', move)
      return () => window.removeEventListener('pointermove', move)
    }
  }, { scope: root })

  return (
    <section className="hero" id="top" ref={root}>
      <img className="hero__bg" src="/assets/MainRoom.jpg" alt="Интерьер бара Beer Garage" />
      <div className="hero__overlay" />
      <div className="blob hero__blob-1" style={{ background: 'var(--amber)' }} />
      <div className="blob hero__blob-2" style={{ background: 'var(--red)' }} />

      <div className="container hero__inner">
        <span className="eyebrow hero__eyebrow">Крафтовый бар · заходи в гараж</span>

        <h1 className="hero__title">
          <span className="line"><span>BEER</span></span>
          <span className="line"><span className="accent">GARAGE</span></span>
        </h1>

        <p className="hero__lead">
          Редкий крафт на кранах, авторские бургеры и вечеринки, после которых
          возвращаются. Бетон, тёплый свет и янтарь в бокале — наша атмосфера.
        </p>

        <div className="hero__cta">
          <a className="btn btn--primary" href={LINKS.whatsapp} target="_blank" rel="noopener noreferrer">
            <WhatsAppIcon /> Руководителю в WhatsApp
          </a>
          <a className="btn btn--ghost" href={LINKS.max} target="_blank" rel="noopener noreferrer">
            <MaxIcon /> Руководителю в MAX
          </a>
        </div>

        <div className="hero__stats">
          <div className="stat"><b>30+</b><span>кранов крафта</span></div>
          <div className="stat"><b>4</b><span>авторских бургера</span></div>
          <div className="stat"><b>VIP</b><span>зал по брони</span></div>
        </div>
      </div>

      <a href="#menu" className="hero__scroll" aria-label="Листать вниз">
        <span>Листай</span>
        <ArrowIcon style={{ transform: 'rotate(90deg)' }} />
      </a>
      <img className="hero__glass" src="/assets/hydration-lightbear.jpg" alt="" aria-hidden />
    </section>
  )
}
