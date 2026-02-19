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
          <h2 id="final-cta-title">Get your scenario into the next design partner cohort</h2>
          <p>
            We are working directly with finance and migration teams to validate heterogeneous-source
            environments before defects reach executive reporting. Join the waitlist for first-access diagnostic
            slots.
          </p>
          {scenarioSnapshot ? (
            <p>
              Your current simulation assumptions are attached: {scenarioSnapshot.plantCount} plants,{" "}
              {scenarioSnapshot.sourceSystems.length} source systems, readiness {scenarioSnapshot.readinessScore}/100.
            </p>
          ) : null}
          <p>
            No pitch deck gatekeeping. Drop your email and we will send diagnostic slot availability and sample
            discrepancy output.
          </p>
        </div>
        <WaitlistInlineForm
          source={inlineSource}
          scenarioSnapshot={scenarioSnapshot}
          formTitle="Join the waitlist"
          buttonLabel="Join now"
          compact={false}
        />
      </div>
    </section>
  );
}
