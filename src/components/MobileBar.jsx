import { LINKS } from '../data'
import { WhatsAppIcon } from './icons'
import './MobileBar.css'

export default function MobileBar({ onMenuClick }) {
  return (
    <div className="mbar">
      <button className="mbar__btn mbar__btn--menu" onClick={onMenuClick} type="button">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        Меню
      </button>
      <a
        className="mbar__btn mbar__btn--wa"
        href={LINKS.whatsapp}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Написать в WhatsApp"
      >
        <WhatsAppIcon />
      </a>
    </div>
  )
}
