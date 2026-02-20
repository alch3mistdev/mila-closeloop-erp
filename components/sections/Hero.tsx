import { BrandLockup } from "../brand/BrandLockup";

interface HeroProps {
  onPrimaryCta: () => void;
  onExploreSimulator: () => void;
  onChecklistClick?: () => void;
}

export function Hero({ onPrimaryCta, onExploreSimulator, onChecklistClick }: HeroProps) {
  return (
    <section className="section hero" aria-label="Hero">
      <div className="hero-grid" data-reveal="true">
        <div>
          <BrandLockup />
          <p className="eyebrow">Early Access - Design Partner Cohort</p>
          <h1 className="hero-title">Your ERP migration passed go-live. Your data didn&apos;t.</h1>
          <p className="hero-subtitle">
            Automated validation for heterogeneous-to-SAP migrations.
          </p>
          <p className="hero-subtitle hero-subtitle-secondary">
            Connect source and target environments, surface cross-plant discrepancies early, and track
            remediation before reporting confidence breaks. Full platform capabilities are available to
            design partners.
          </p>
          <div className="cta-row">
            <button type="button" className="btn btn-primary" onClick={onPrimaryCta}>
              Request a Migration Diagnostic
            </button>
            <a className="btn btn-secondary hero-secondary" href="/resources/erp-migration-validation-checklist" onClick={onChecklistClick}>
              Download the Validation Checklist
            </a>
          </div>
          <button type="button" className="text-link hero-tertiary" onClick={onExploreSimulator}>
            Explore the interactive simulation first
          </button>
          <p className="support-line">
            Free diagnostic scope: one source system + one key data domain. Target turnaround: 10 business
            days after receiving extracts. No production-system write access required.
          </p>
        </div>
        <aside className="hero-aside" aria-label="Migration pressure indicators">
          <div className="metric-card">
            <p className="metric-label">Forcing Function</p>
            <p className="metric-value">ECC EOL 2027</p>
            <p className="metric-copy">Timelines are compressing. Validation cannot be deferred.</p>
          </div>
          <div className="metric-card">
            <p className="metric-label">Hidden Cost</p>
            <p className="metric-value">Years of Workarounds</p>
            <p className="metric-copy">Post-go-live defects often become permanent operating behavior.</p>
          </div>
          <div className="metric-card">
            <p className="metric-label">Primary Persona</p>
            <p className="metric-value">Plant Controller + PMO</p>
            <p className="metric-copy">Built for teams reconciling cross-plant comparability under pressure.</p>
          </div>
        </aside>
      </div>
      <div className="urgency-strip" data-reveal="true">
        <article>
          <h2>Silent defects are strategic defects</h2>
          <p>
            If two plants calculate margin differently, board-level capital allocation can be wrong even when
            reports look complete.
          </p>
        </article>
        <article>
          <h2>Validation is the missing phase gate</h2>
          <p>
            Most programs track migration tasks. Fewer validate comparability, completeness, and methodology.
          </p>
        </article>
        <article>
          <h2>Design partner diagnostic available</h2>
          <p>
            See a sample discrepancy report before your next governance checkpoint.
          </p>
        </article>
      </div>
    </section>
  );
}
