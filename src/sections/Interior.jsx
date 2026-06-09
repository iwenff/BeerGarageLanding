import { ROOMS, LINKS } from "../data";
import { ChatIcon } from "../components/icons";
import "./Interior.css";

export default function Interior() {
  return (
    <section className="section interior" id="interior">
      <div className="container">
        <div className="section-head interior__head">
          <div>
            <span className="eyebrow" data-reveal>
              Атмосфера
            </span>
            <h2 className="heading" data-reveal>
              Как выглядит <span className="accent">BEER GARAGE</span>
            </h2>
            <p className="lead" data-reveal>
              Бетон, металл и тёплый свет. Общий зал — для шумной компании,
              закрытый — для своих. Есть где развернуться.
            </p>
          </div>
          <a
            className="btn btn--primary"
            href={LINKS.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            data-reveal
          >
            <ChatIcon /> Забронировать стол
          </a>
        </div>

        <div className="interior__grid">
          {ROOMS.map((r) => (
            <article className="room" data-reveal key={r.id}>
              <img src={r.img} alt={r.name} loading="lazy" />
              <div className="room__overlay" />
              <div className="room__caption">
                <h3>{r.name}</h3>
                <p>{r.desc}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
