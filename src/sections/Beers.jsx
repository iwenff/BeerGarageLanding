import { BEERS } from "../data";
import "./Beers.css";

export default function Beers() {
  return (
    <section className="section beers" id="beers">
      <div
        className="blob beers__blob"
        style={{ background: "var(--amber-deep)" }}
      />

      {/* decorative marquee */}
      <div className="beers__marquee" aria-hidden>
        <div className="beers__marquee-track">
          {Array.from({ length: 8 }).map((_, k) => (
            <span key={k}>
              Выпито до дна · Открой для себя новое · заглядывай чаще ·{" "}
            </span>
          ))}
        </div>
      </div>

      <div className="container">
        <div className="section-head beers__head">
          <div>
            <span className="eyebrow" data-reveal>
              Архив вкусов
            </span>
            <h2 className="heading" data-reveal>
              <span className="accent">Улетело</span>
            </h2>
            <p className="lead" data-reveal>
              Именно такой крафт мы любим. Следи за обновлениями, чтобы не
              пропустить следующий.
            </p>
          </div>
          <img
            className="beers__deco"
            src="/assets/hydration-guinness.jpg"
            alt=""
            aria-hidden
            data-reveal
          />
        </div>

        <div className="beers__grid">
          {BEERS.map((b, i) => (
            <article className="beercard" data-reveal key={b.id}>
              <div className="beercard__media">
                {b.video ? (
                  <video src={b.video} autoPlay loop muted playsInline />
                ) : (
                  <img
                    src={b.img}
                    alt={`${b.brewery ? b.brewery + " — " : ""}${b.name}`}
                    loading="lazy"
                  />
                )}
                <span className="beercard__stamp">Улетело</span>
                <span className="beercard__index">0{i + 1}</span>
              </div>
              <div className="beercard__body">
                {b.brewery && (
                  <span className="beercard__brewery">{b.brewery}</span>
                )}
                <h3 className="beercard__name">{b.name}</h3>
                <p className="beercard__desc">{b.desc}</p>
                <div className="beercard__specs">
                  <span className="spec spec--style">{b.style}</span>
                  {b.abv && <span className="spec">{b.abv}</span>}
                  {b.ibu && <span className="spec">{b.ibu}</span>}
                  {b.vol && <span className="spec">{b.vol}</span>}
                </div>
              </div>
            </article>
          ))}
        </div>

        <img
          className="beers__deco-2"
          src="/assets/hydration-radeberger.jpg"
          alt=""
          aria-hidden
          data-reveal
        />
      </div>
    </section>
  );
}
