import { useEffect, useRef, useState } from 'react'
import { LINKS } from '../data'
import { WhatsAppIcon, PersonIcon } from './icons'
import './MobileBar.css'

function MobileProfilePopup({ onClose }) {
  return (
    <div className="mbar__profile-popup">
      <p className="mbar__profile-title">Личный кабинет</p>
      <p className="mbar__profile-text">
        Регистрация для гостей появится совсем скоро.
        Сейчас вход доступен только для администраторов.
      </p>
      <a href="/admin/login" className="mbar__profile-btn" onClick={onClose}>
        Войти как администратор
      </a>
      <button className="mbar__profile-close" onClick={onClose} type="button">
        Закрыть
      </button>
    </div>
  )
}

export default function MobileBar({ onMenuClick }) {
  const [profileOpen, setProfileOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!profileOpen) return
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setProfileOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [profileOpen])

  return (
    <div className="mbar">
      <button className="mbar__btn mbar__btn--menu" onClick={onMenuClick} type="button">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        Меню
      </button>

      {/* Кнопка профиля */}
      <div ref={ref} style={{ position: 'relative' }}>
        <button
          className={`mbar__btn mbar__btn--profile${profileOpen ? ' is-open' : ''}`}
          onClick={() => setProfileOpen((o) => !o)}
          aria-label="Личный кабинет"
          type="button"
        >
          <PersonIcon />
        </button>
        {profileOpen && <MobileProfilePopup onClose={() => setProfileOpen(false)} />}
      </div>

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
