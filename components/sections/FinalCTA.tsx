import { WaitlistSource } from "../../lib/waitlist";
import { WaitlistInlineForm } from "../waitlist/WaitlistInlineForm";

interface FinalCTAProps {
  inlineSource: WaitlistSource;
}

export function FinalCTA({ inlineSource }: FinalCTAProps) {
  return (
    <section className="section final-cta" aria-labelledby="final-cta-title">
      <div className="final-cta-grid" data-reveal="true">
        <div>
          <p className="eyebrow">Early Access</p>
          <h2 id="final-cta-title">Get into the next design partner cohort</h2>
          <p>
            We are working directly with finance and migration teams to validate heterogeneous-source
            environments before defects reach executive reporting. Join the waitlist for first-access diagnostic
            slots.
          </p>
          <p>
            No pitch deck gatekeeping. Drop your email and we will send diagnostic slot availability and sample
            discrepancy output.
          </p>
        </div>
        <WaitlistInlineForm
          source={inlineSource}
          formTitle="Join the waitlist"
          buttonLabel="Join now"
          compact={false}
        />
      </div>
    </section>
  );
}
