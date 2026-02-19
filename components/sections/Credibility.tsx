import { credibilityPoints, storyInsights } from "../../lib/content";

interface CredibilityProps {
  onCta: () => void;
}

export function Credibility({ onCta }: CredibilityProps) {
  return (
    <section className="section" aria-labelledby="credibility-title">
      <div className="section-head" data-reveal="true">
        <p className="eyebrow">Built For</p>
        <h2 id="credibility-title">Authority grounded in operational reality, not launch theater</h2>
      </div>
      <div className="credibility-layout" data-reveal="true">
        <div className="credibility-panel">
          <ul>
            {credibilityPoints.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </div>
        <div className="insights-panel">
          <h3>What we&apos;re seeing in the field</h3>
          <div className="insight-cards">
            {storyInsights.map((insight) => (
              <article key={insight.title}>
                <h4>{insight.title}</h4>
                <p>{insight.summary}</p>
              </article>
            ))}
          </div>
          <button type="button" className="btn btn-primary" onClick={onCta}>
            Get design partner updates
          </button>
        </div>
      </div>
    </section>
  );
}
