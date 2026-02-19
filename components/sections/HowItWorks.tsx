const STEPS = [
  {
    name: "Connect",
    copy:
      "Ingest snapshots from SAP ECC, Oracle, Dynamics, AS/400, and custom sources without touching production write paths."
  },
  {
    name: "Diagnose",
    copy:
      "Run automated checks for mapping completeness, record completeness, value range integrity, and cross-plant methodology consistency."
  },
  {
    name: "Remediate",
    copy:
      "Prioritize discrepancies by severity and operational impact, then track closure by location for PMO-level accountability."
  }
];

export function HowItWorks() {
  return (
    <section className="section" aria-labelledby="how-it-works-title">
      <div className="section-head" data-reveal="true">
        <p className="eyebrow">How It Works</p>
        <h2 id="how-it-works-title">Connect, diagnose, remediate before defects calcify</h2>
      </div>
      <div className="steps-grid" data-reveal="true">
        {STEPS.map((step, index) => (
          <article className="step-card" key={step.name}>
            <p className="step-index">0{index + 1}</p>
            <h3>{step.name}</h3>
            <p>{step.copy}</p>
          </article>
        ))}
      </div>
      <div className="dashboard-note" data-reveal="true">
        <p>
          Dashboard visibility includes migration status by location, validation pass rates, discrepancy severity
          distribution, and convergence trends toward go-live readiness.
        </p>
      </div>
    </section>
  );
}
