interface TrustCenterProps {
  onJumpToWaitlist: () => void;
}

const EVIDENCE_NOW = [
  "Interactive scenario-to-output traceability (diagnostic, AI workflow, process flow, and savings all linked).",
  "Anonymized operator voice from migration controllers and PMO stakeholders.",
  "No fabricated logos, testimonials, certifications, or benchmark claims."
];

const SECURITY_POSTURE = [
  "Deployment options: customer-hosted (on-prem/VPC) or managed SaaS with data-residency controls.",
  "Data minimization: snapshot-first operation or sandbox connectivity, with no production write access required.",
  "PII handling: structural and financial validation data only; identifiable fields can be masked or hashed.",
  "Access controls: SSO/SAML readiness, role-based access, and immutable validation audit logs."
];

const OPERATING_GUARDRAILS = [
  "Snapshot-first diagnostic mode with no production write access required.",
  "Controller sign-off workflow is explicit for low-confidence mapping and discrepancy closure.",
  "Cross-plant discrepancy ownership and remediation accountability are surfaced by stage.",
  "Compliance roadmap transparency: SOC 2-ready controls in place; certification is planned post design-partner phase."
];

const TRUST_PACKET = [
  "Architecture and data-flow walkthrough for technical due diligence.",
  "Sample discrepancy evidence pack and remediation ownership format.",
  "Design-partner operating cadence, scope boundaries, and onboarding checklist.",
  "Diagnostic qualification criteria: active S/4 program, 5+ plants, and extract-access readiness."
];

export function TrustCenter({ onJumpToWaitlist }: TrustCenterProps) {
  return (
    <section className="section trust-center" id="trust-center" aria-labelledby="trust-center-title">
      <div className="section-head" data-reveal="true">
        <p className="eyebrow">Trust & Security</p>
        <h2 id="trust-center-title">What we can verify today, and how we secure design-partner rollout</h2>
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
          <h3>Security posture</h3>
          <ul>
            {SECURITY_POSTURE.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
        <article className="trust-card trust-card-highlight">
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
