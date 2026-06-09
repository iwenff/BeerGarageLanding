import { useEffect, useState } from 'react'
import { LINKS } from '../data'
import { WhatsAppIcon } from './icons'
import './Navbar.css'

const NAV = [
  { label: 'Меню', href: '#menu' },
  { label: 'Уже улетели', href: '#beers' },
  { label: 'Ивенты', href: '#events' },
  { label: 'Атмосфера', href: '#interior' },
  { label: 'Контакты', href: '#connect' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`nav ${scrolled ? 'nav--solid' : ''}`}>
      <div className="container nav__inner">
        <a href="#top" className="nav__brand" onClick={() => setOpen(false)}>
          <img src="/assets/BarLogo.JPG" alt="Beer Garage" />
          <span>BEER<b>GARAGE</b></span>
        </a>

        <nav className={`nav__links ${open ? 'is-open' : ''}`}>
          {NAV.map((n) => (
            <a key={n.href} href={n.href} onClick={() => setOpen(false)}>{n.label}</a>
          ))}
          <a className="nav__cta-mobile btn btn--primary" href={LINKS.whatsapp} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)}>
            <WhatsAppIcon /> Написать
          </a>
        </nav>

        <a className="nav__cta btn btn--primary" href={LINKS.whatsapp} target="_blank" rel="noopener noreferrer">
          <WhatsAppIcon /> Руководителю
        </a>

        <button className={`nav__burger ${open ? 'is-open' : ''}`} onClick={() => setOpen((o) => !o)} aria-label="Меню">
          <span></span><span></span><span></span>
        </button>
      </div>
    </header>
  )
}
