import { credibilityPoints, socialProofQuotes, storyInsights } from "../../lib/content";

export function Credibility() {
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
          <p className="proof-note">
            No public logos at pre-launch. Design-partner references are shared privately during
            qualified discovery. Current intake focus is on 2026-2027 cutover programs.
          </p>
          <div className="proof-quotes" aria-label="Anonymized operator voice">
            {socialProofQuotes.map((item) => (
              <blockquote key={item.quote} className="proof-quote">
                <p>&ldquo;{item.quote}&rdquo;</p>
                <cite>{item.role}</cite>
              </blockquote>
            ))}
          </div>
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
        </div>
      </div>
    </section>
  );
}
