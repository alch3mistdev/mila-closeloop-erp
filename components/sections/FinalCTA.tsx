import { WaitlistScenarioSnapshot, WaitlistSource } from "../../lib/waitlist";
import { WaitlistInlineForm } from "../waitlist/WaitlistInlineForm";

interface FinalCTAProps {
  inlineSource: WaitlistSource;
  scenarioSnapshot?: WaitlistScenarioSnapshot;
}

export function FinalCTA({ inlineSource, scenarioSnapshot }: FinalCTAProps) {
  return (
    <section className="section final-cta" aria-labelledby="final-cta-title" id="final-waitlist">
      <div className="final-cta-grid" data-reveal="true">
        <div>
          <p className="eyebrow">Early Access</p>
          <h2 id="final-cta-title">Request a migration diagnostic</h2>
          <p>
            Free assessment scope: one source system + one key data domain (material master, asset register,
            or cost data). Designed for active S/4 migration programs.
          </p>
          {scenarioSnapshot ? (
            <p>
              Your current simulation assumptions are attached: {scenarioSnapshot.plantCount} plants,{" "}
              {scenarioSnapshot.sourceSystems.length} source systems, readiness {scenarioSnapshot.readinessScore}/100.
            </p>
          ) : null}
          <ul className="final-cta-points">
            <li>Qualification focus: active S/4 program, 5+ plants, and extract-access readiness.</li>
            <li>Deliverable: standardized discrepancy report with remediation guidance.</li>
            <li>Target SLA: 10 business days after validated extracts are received.</li>
          </ul>
        </div>
        <WaitlistInlineForm
          source={inlineSource}
          scenarioSnapshot={scenarioSnapshot}
          formTitle="Apply for design partner diagnostic"
          buttonLabel="Request diagnostic"
          compact={false}
        />
      </div>
    </section>
  );
}
