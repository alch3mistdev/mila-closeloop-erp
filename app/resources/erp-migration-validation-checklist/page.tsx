const CHECKLIST_SECTIONS = [
  {
    title: "Scope and Source Integrity",
    items: [
      "Confirm source-system inventory by plant and legal entity.",
      "Verify each in-scope source field has a target mapping decision.",
      "Identify unmapped fields with financial materiality tags.",
      "Validate snapshot timestamp alignment across source and target extracts.",
      "Document excluded records and explicit business rationale."
    ]
  },
  {
    title: "Schema and Mapping Quality",
    items: [
      "Check data-type compatibility for each mapped field.",
      "Flag one-to-many or many-to-one mappings for controller review.",
      "Compare null-handling logic between legacy and SAP target.",
      "Validate currency and unit-of-measure conversion rules.",
      "Queue low-confidence mappings for dual sign-off (data + finance)."
    ]
  },
  {
    title: "Data Completeness and Reconciliation",
    items: [
      "Run record-count reconciliation by object class and location.",
      "Reconcile assets, vendors, and materials between source and target.",
      "Confirm no duplicate key collisions were introduced in migration.",
      "Validate opening balances against approved cutover baseline.",
      "Track exception inventory with named owners and due dates."
    ]
  },
  {
    title: "Cross-Plant Comparability",
    items: [
      "Compare cost allocation logic across plants for the same metric.",
      "Test margin comparability by product family and time window.",
      "Identify structurally divergent calculation conventions.",
      "Validate chart-of-accounts normalization across acquired entities.",
      "Escalate methodology mismatches before executive rollup."
    ]
  },
  {
    title: "Controls, Audit, and Post-Go-Live Readiness",
    items: [
      "Capture timestamped evidence for each validation run.",
      "Require controller acknowledgment on unresolved high-severity findings.",
      "Define remediation playbook steps per discrepancy category.",
      "Schedule regression cadence for post-go-live controls.",
      "Publish PMO dashboard with pass rates and open severity mix.",
      "Confirm SSO/RBAC policy and least-privilege access model.",
      "Mask or hash any identifiable fields before ingestion where required."
    ]
  }
];

export default function ValidationChecklistPage() {
  return (
    <main className="site-shell">
      <section className="section legal-page checklist-page">
        <p className="eyebrow">Resource</p>
        <h1>ERP Migration Validation Checklist: 27 Things Your SI Won&apos;t Catch</h1>
        <p>
          Built for design-partner teams managing heterogeneous-to-SAP migrations where cross-plant
          comparability and post-go-live integrity are business-critical.
        </p>
        <div className="checklist-grid">
          {CHECKLIST_SECTIONS.map((section) => (
            <article key={section.title} className="checklist-card">
              <h2>{section.title}</h2>
              <ol>
                {section.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ol>
            </article>
          ))}
        </div>
        <p className="support-copy">
          Want this run against your environment? Return to the homepage and request a migration
          diagnostic.
        </p>
      </section>
    </main>
  );
}
