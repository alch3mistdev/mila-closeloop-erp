import { valuePillars } from "../../lib/content";

export function ValuePillars() {
  return (
    <section className="section" aria-labelledby="pillar-title">
      <div className="section-head" data-reveal="true">
        <p className="eyebrow">Value Framework</p>
        <h2 id="pillar-title">Four validation pillars built for multi-plant migrations</h2>
      </div>
      <div className="pillar-grid" data-reveal="true">
        {valuePillars.map((pillar) => (
          <article className="pillar-card" key={pillar.title}>
            <h3>{pillar.title}</h3>
            <p className="pillar-description">{pillar.description}</p>
            <div className="before-after">
              <div>
                <p className="label">Before</p>
                <p>{pillar.before}</p>
              </div>
              <div>
                <p className="label">After</p>
                <p>{pillar.after}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
