import { painCards } from "../../lib/content";

export function PainNarrative() {
  return (
    <section className="section" aria-labelledby="pain-narrative-title">
      <div className="section-head" data-reveal="true">
        <p className="eyebrow">What Breaks In Real Programs</p>
        <h2 id="pain-narrative-title">The migration risks your rollout plan usually underestimates</h2>
      </div>
      <div className="pain-grid" data-reveal="true">
        {painCards.map((card) => (
          <article className="pain-card" key={card.title}>
            <p className="eyebrow small">{card.eyebrow}</p>
            <h3>{card.title}</h3>
            <p>{card.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
