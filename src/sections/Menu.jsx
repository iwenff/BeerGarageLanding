import { BURGERS } from '../data'
import './Menu.css'

export default function Menu({ onMenuClick }) {
  return (
    <section className="section menu" id="menu">
      <div className="blob menu__blob" style={{ background: 'var(--amber)' }} />
      <div className="container">
        <div className="section-head">
          <span className="eyebrow" data-reveal>Кухня гаража</span>
          <h2 className="heading" data-reveal>Бургеры <span className="accent">к пиву</span></h2>
          <p className="lead" data-reveal>
            Говяжьи котлеты, свежие булки, фирменные соусы.
            Без лишнего — просто вкусно под хорошее пиво.
          </p>
        </div>

        <div className="menu__grid">
          {BURGERS.map((b, i) => (
            <article className="burger" data-reveal key={b.id}>
              <div className="burger__media">
                <img src={b.img} alt={b.name} loading="lazy" />
                <span className="burger__tag">{b.tag}</span>
              </div>
              <div className="burger__body">
                <div className="burger__row">
                  <h3>{b.name}</h3>
                  <span className="burger__num">0{i + 1}</span>
                </div>
                <p>{b.desc}</p>
              </div>
            </article>
          ))}
        </div>

        <button className="menu__more-btn" onClick={onMenuClick} type="button" data-reveal>
          <div className="menu__more-text">
            <span>Закуски, салаты, морепродукты, коктейли и многое другое</span>
            <strong>Открыть полное меню</strong>
          </div>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>
      </div>
    </section>
  )
}
