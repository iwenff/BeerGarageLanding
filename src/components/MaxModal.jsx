import { useEffect } from 'react'
import { MaxIcon } from './icons'
import { LINKS } from '../data'
import './MaxModal.css'

export default function MaxModal({ onClose }) {
  const phone = LINKS.max
  const formatted = phone.replace(/(\+7)(\d{3})(\d{3})(\d{2})(\d{2})/, '$1 $2 $3-$4-$5')

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const copy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(phone)
    }
  }

  return (
    <div className="mmodal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="mmodal" onClick={e => e.stopPropagation()}>
        <button className="mmodal__close" onClick={onClose} aria-label="Закрыть">✕</button>

        <div className="mmodal__icon">
          <MaxIcon />
        </div>

        <h3 className="mmodal__title">Найдите нас в Макс</h3>
        <p className="mmodal__sub">Добавьте номер в мессенджере — ответим быстро на любой вопрос</p>

        <button className="mmodal__phone" onClick={copy} title="Нажмите, чтобы скопировать">
          <span>{formatted}</span>
          <span className="mmodal__copy-hint">Скопировать</span>
        </button>

        <div className="mmodal__actions">
          <a className="mmodal__btn mmodal__btn--call" href={`tel:${phone}`}>
            Позвонить
          </a>
          <a className="mmodal__btn mmodal__btn--wa" href={LINKS.whatsapp} target="_blank" rel="noopener noreferrer">
            Или в WhatsApp
          </a>
        </div>
      </div>
    </div>
  )
}
