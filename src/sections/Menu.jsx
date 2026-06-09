import { BURGERS } from '../data'
import './Menu.css'

export default function Menu() {
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

        <div className="menu__note" data-reveal>
          <img src="/assets/hydration-burger.jpg" alt="" aria-hidden />
          <div>
            <b>Это лишь часть меню.</b>
            <span>Полный список бургеров, закусок и сетов — на месте и по QR в баре.</span>
          </div>
        </div>
      </div>
    </section>
  )
}
