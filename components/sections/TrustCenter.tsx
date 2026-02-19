interface TrustCenterProps {
  onJumpToWaitlist: () => void;
}

const EVIDENCE_NOW = [
  "Interactive scenario-to-output traceability (diagnostic, AI workflow, process flow, and savings all linked).",
  "Anonymized operator voice from migration controllers and PMO stakeholders.",
  "No fabricated logos, testimonials, certifications, or benchmark claims."
];

const OPERATING_GUARDRAILS = [
  "Snapshot-first diagnostic mode with no production write access required.",
  "Controller sign-off workflow is explicit for low-confidence mapping and discrepancy closure.",
  "Cross-plant discrepancy ownership and remediation accountability are surfaced by stage."
];

const TRUST_PACKET = [
  "Architecture and data-flow walkthrough for technical due diligence.",
  "Sample discrepancy evidence pack and remediation ownership format.",
  "Design-partner operating cadence, scope boundaries, and onboarding checklist."
];

export function TrustCenter({ onJumpToWaitlist }: TrustCenterProps) {
  return (
    <section className="section trust-center" id="trust-center" aria-labelledby="trust-center-title">
      <div className="section-head" data-reveal="true">
        <p className="eyebrow">Enterprise Trust Snapshot</p>
        <h2 id="trust-center-title">What we can verify today, and how we de-risk design-partner rollout</h2>
      </div>
      <div className="trust-grid" data-reveal="true">
        <article className="trust-card">
          <h3>Evidence available now</h3>
          <ul>
            {EVIDENCE_NOW.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
        <article className="trust-card">
          <h3>Operating guardrails</h3>
          <ul>
            {OPERATING_GUARDRAILS.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
        <article className="trust-card trust-card-highlight">
          <h3>Trust packet for qualified teams</h3>
          <ul>
            {TRUST_PACKET.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <button type="button" className="btn btn-secondary" onClick={onJumpToWaitlist}>
            Request trust packet
          </button>
        </article>
      </div>
    </section>
  );
}
