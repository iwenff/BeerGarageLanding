import { LINKS } from '../data'
import { WhatsAppIcon, MaxIcon } from './icons'
import './MobileBar.css'

export default function MobileBar({ onMaxClick }) {
  return (
    <div className="mbar">
      <a className="mbar__btn mbar__btn--wa" href={LINKS.whatsapp} target="_blank" rel="noopener noreferrer">
        <WhatsAppIcon /> Вацап
      </a>
      <button className="mbar__btn mbar__btn--max" onClick={onMaxClick} type="button">
        <MaxIcon /> Макс
      </button>
    </div>
  )
}
