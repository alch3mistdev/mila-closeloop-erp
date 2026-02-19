import { SharedScenario } from "../../lib/scenarioModel";

interface ScenarioThreadProps {
  scenario: SharedScenario;
  readinessScore: number;
  highSeverityCount: number;
  projectedAnnualValue: number;
  onJump: (sectionId: string) => void;
}

function currency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value);
}

function cadenceLabel(value: SharedScenario["validationCadence"]): string {
  if (value === "parallel_plus_post") {
    return "Parallel + Post";
  }

  if (value === "go_live_only") {
    return "Go-live Only";
  }

  return "Phase Gates";
}

export function ScenarioThread({
  scenario,
  readinessScore,
  highSeverityCount,
  projectedAnnualValue,
  onJump
}: ScenarioThreadProps) {
  return (
    <section className="section scenario-thread" aria-label="Unified scenario">
      <div className="scenario-grid" data-reveal="true">
        <article>
          <p className="label">Live shared scenario</p>
          <h3>{scenario.plantCount} plants across {scenario.sourceSystems.length} source systems</h3>
          <p>
            Cadence: <strong>{cadenceLabel(scenario.validationCadence)}</strong> | Detection strictness:{" "}
            <strong>{scenario.strictness}%</strong>
          </p>
          <p className="scenario-note">
            Any changes in the demo below update this scenario and all downstream AI + savings outputs.
          </p>
        </article>
        <article>
          <p className="label">Current projection</p>
          <h3>Readiness {readinessScore}/100</h3>
          <p>
            High-severity clusters: <strong>{highSeverityCount}</strong> | Value at stake:{" "}
            <strong>{currency(projectedAnnualValue)}</strong>
          </p>
        </article>
        <div className="thread-actions">
          <button type="button" className="text-link" onClick={() => onJump("diagnostic-simulator")}>
            Open diagnostic
          </button>
          <button type="button" className="text-link" onClick={() => onJump("workflow-comparator")}>
            Compare process flow
          </button>
          <button type="button" className="text-link" onClick={() => onJump("savings-simulator")}>
            Stress-test economics
          </button>
        </div>
      </div>
    </section>
  );
}
