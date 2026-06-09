import { LINKS } from '../data'
import { WhatsAppIcon, MaxIcon } from './icons'
import './MobileBar.css'

export default function MobileBar() {
  return (
    <div className="mbar">
      <a className="mbar__btn mbar__btn--wa" href={LINKS.whatsapp} target="_blank" rel="noopener noreferrer">
        <WhatsAppIcon /> WhatsApp
      </a>
      <a className="mbar__btn mbar__btn--max" href={LINKS.max} target="_blank" rel="noopener noreferrer">
        <MaxIcon /> MAX
      </a>
    </div>
  )
}
