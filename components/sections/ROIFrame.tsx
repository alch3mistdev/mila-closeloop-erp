"use client";

import {
  calculateSavingsModel,
  deriveSourceSystemsByCount,
  SharedScenario
} from "../../lib/scenarioModel";

interface ROIFrameProps {
  scenario: SharedScenario;
  onScenarioChange: (changes: Partial<SharedScenario>) => void;
  onContinue: () => void;
}

interface ScenarioPreset {
  label: string;
  scenario: Partial<SharedScenario>;
}

const SCENARIO_PRESETS: ScenarioPreset[] = [
  {
    label: "Regional Program",
    scenario: {
      plantCount: 18,
      sourceSystems: ["SAP ECC", "Oracle", "Spreadsheets"],
      controllerRate: 96,
      monthlyManualHours: 12,
      defectDelayMonths: 14,
      validationCadence: "phase_gates",
      strictness: 90
    }
  },
  {
    label: "Global Rollout",
    scenario: {
      plantCount: 48,
      sourceSystems: ["SAP ECC", "Oracle", "Microsoft Dynamics", "AS/400", "Custom SQL", "Spreadsheets"],
      controllerRate: 110,
      monthlyManualHours: 18,
      defectDelayMonths: 20,
      validationCadence: "parallel_plus_post",
      strictness: 102
    }
  },
  {
    label: "Post-M&A Integration",
    scenario: {
      plantCount: 30,
      sourceSystems: ["Oracle", "Microsoft Dynamics", "AS/400", "Custom SQL", "Spreadsheets"],
      controllerRate: 102,
      monthlyManualHours: 16,
      defectDelayMonths: 24,
      validationCadence: "go_live_only",
      strictness: 98
    }
  }
];

function currency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value);
}

export function ROIFrame({ scenario, onScenarioChange, onContinue }: ROIFrameProps) {
  const model = calculateSavingsModel(scenario);

  const sourceSystemCount = scenario.sourceSystems.length;

  function applyPreset(preset: ScenarioPreset) {
    onScenarioChange(preset.scenario);
  }

  return (
    <section className="section" aria-labelledby="roi-title" id="savings-simulator">
      <div className="section-head" data-reveal="true">
        <p className="eyebrow">Savings Simulator</p>
        <h2 id="roi-title">Play with your own assumptions and pressure-test migration economics</h2>
      </div>
      <div className="scenario-row" data-reveal="true">
        {SCENARIO_PRESETS.map((preset) => (
          <button key={preset.label} type="button" className="scenario-chip" onClick={() => applyPreset(preset)}>
            {preset.label}
          </button>
        ))}
      </div>
      <div className="roi-grid" data-reveal="true">
        <article className="roi-controls">
          <label htmlFor="plant-range">Plant count</label>
          <input
            id="plant-range"
            type="range"
            min={8}
            max={120}
            value={scenario.plantCount}
            onChange={(event) => onScenarioChange({ plantCount: Number(event.target.value) })}
          />
          <p>{scenario.plantCount} plants</p>

          <label htmlFor="entity-range">Source systems</label>
          <input
            id="entity-range"
            type="range"
            min={1}
            max={6}
            value={sourceSystemCount}
            onChange={(event) =>
              onScenarioChange({
                sourceSystems: deriveSourceSystemsByCount(
                  scenario.sourceSystems,
                  Number(event.target.value)
                )
              })
            }
          />
          <p>{sourceSystemCount} source environments</p>

          <label htmlFor="hours-range">Manual validation hours per plant/month</label>
          <input
            id="hours-range"
            type="range"
            min={6}
            max={40}
            value={scenario.monthlyManualHours}
            onChange={(event) => onScenarioChange({ monthlyManualHours: Number(event.target.value) })}
          />
          <p>{scenario.monthlyManualHours} hours</p>

          <label htmlFor="rate-range">Controller blended hourly rate (USD)</label>
          <input
            id="rate-range"
            type="range"
            min={55}
            max={220}
            value={scenario.controllerRate}
            onChange={(event) => onScenarioChange({ controllerRate: Number(event.target.value) })}
          />
          <p>{currency(scenario.controllerRate)} / hour</p>

          <label htmlFor="delay-range">Average months to detect late defects</label>
          <input
            id="delay-range"
            type="range"
            min={6}
            max={36}
            value={scenario.defectDelayMonths}
            onChange={(event) => onScenarioChange({ defectDelayMonths: Number(event.target.value) })}
          />
          <p>{scenario.defectDelayMonths} months</p>
        </article>

        <article className="roi-results">
          <div className="roi-result-card emphatic">
            <p className="label">Projected annual value at stake</p>
            <p className="roi-value highlight">{currency(model.totalSavings)}</p>
            <p className="support-copy">{currency(model.monthlySavings)} potential value preserved per month.</p>
          </div>
          <div className="roi-result-card">
            <p className="label">Annual manual validation cost</p>
            <p className="roi-value">{currency(model.annualManualCost)}</p>
          </div>
          <div className="roi-result-card">
            <p className="label">Annual validated operating cost</p>
            <p className="roi-value">{currency(model.automatedCost)}</p>
          </div>
          <div className="roi-result-card">
            <p className="label">Potential late-defect exposure</p>
            <p className="roi-value">{currency(model.lateDefectExposure)}</p>
          </div>
          <div className="roi-result-card">
            <p className="label">Modeled labor savings</p>
            <p className="roi-value">{currency(model.laborSavings)}</p>
          </div>
          <div className="roi-result-card">
            <p className="label">Modeled risk avoidance value</p>
            <p className="roi-value">{currency(model.riskAvoidanceValue)}</p>
          </div>
          <div className="comparison-bars">
            <p className="label">Relative burden: manual vs validated flow</p>
            <div className="bar-track">
              <span className="bar manual" style={{ width: `${Math.max(model.manualShare, 8)}%` }} />
              <span className="bar validated" style={{ width: `${Math.max(model.validatedShare, 4)}%` }} />
            </div>
            <p className="support-copy">
              Assumption model for demo purposes. Replace with customer benchmarks during discovery.
            </p>
          </div>
          <button type="button" className="btn btn-secondary roi-cta" onClick={onContinue}>
            Continue to waitlist with this scenario
          </button>
        </article>
      </div>
    </section>
  );
}
