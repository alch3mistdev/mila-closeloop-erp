import { BrandLockup } from "../brand/BrandLockup";

interface HeroProps {
  onPrimaryCta: () => void;
  onExploreSimulator: () => void;
}

export function Hero({ onPrimaryCta, onExploreSimulator }: HeroProps) {
  return (
    <section className="section hero" aria-label="Hero">
      <div className="hero-grid" data-reveal="true">
        <div>
          <BrandLockup />
          <p className="eyebrow">Pre-Launch Design Partner Phase</p>
          <h1 className="hero-title">Your ERP migration passed go-live. Your data didn&apos;t.</h1>
          <p className="hero-subtitle">
            Automated validation for heterogeneous-to-SAP migrations. Connect legacy and target
            environments, surface discrepancies across plants before they become board-level reporting
            errors, and track remediation to close.
          </p>
          <div className="cta-row">
            <button type="button" className="btn btn-primary" onClick={onPrimaryCta}>
              Request a Migration Diagnostic
            </button>
            <button type="button" className="text-link" onClick={onExploreSimulator}>
              Explore the interactive simulation first
            </button>
          </div>
          <p className="support-line">
            Free diagnostic scope: up to 3 source systems. No production-system write access required.
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
