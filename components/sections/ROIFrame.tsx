"use client";

import { useMemo, useState } from "react";

interface ROIFrameProps {
  onCta: () => void;
}

interface Scenario {
  label: string;
  plants: number;
  sourceSystems: number;
  controllerRate: number;
  monthlyManualHours: number;
  defectDelayMonths: number;
}

const SCENARIOS: Scenario[] = [
  {
    label: "Regional Program",
    plants: 18,
    sourceSystems: 4,
    controllerRate: 96,
    monthlyManualHours: 12,
    defectDelayMonths: 14
  },
  {
    label: "Global Rollout",
    plants: 48,
    sourceSystems: 7,
    controllerRate: 110,
    monthlyManualHours: 18,
    defectDelayMonths: 20
  },
  {
    label: "Post-M&A Integration",
    plants: 30,
    sourceSystems: 9,
    controllerRate: 102,
    monthlyManualHours: 16,
    defectDelayMonths: 24
  }
];

function currency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value);
}

export function ROIFrame({ onCta }: ROIFrameProps) {
  const [plants, setPlants] = useState(24);
  const [sourceSystems, setSourceSystems] = useState(5);
  const [controllerRate, setControllerRate] = useState(98);
  const [monthlyManualHours, setMonthlyManualHours] = useState(14);
  const [defectDelayMonths, setDefectDelayMonths] = useState(18);

  const model = useMemo(() => {
    const annualManualHours = plants * monthlyManualHours * 12;
    const annualManualCost = annualManualHours * controllerRate;
    const automatedHours = annualManualHours * 0.38;
    const automatedCost = automatedHours * controllerRate;
    const laborSavings = Math.max(0, annualManualCost - automatedCost);

    const lateDefectExposure = plants * sourceSystems * defectDelayMonths * 1150;
    const riskAvoidanceValue = lateDefectExposure * 0.42;
    const totalSavings = laborSavings + riskAvoidanceValue;
    const monthlySavings = totalSavings / 12;
    const manualShare = (annualManualCost / (annualManualCost + riskAvoidanceValue)) * 100;
    const validatedShare = (automatedCost / (annualManualCost + riskAvoidanceValue)) * 100;

    return {
      annualManualCost,
      automatedCost,
      laborSavings,
      lateDefectExposure,
      riskAvoidanceValue,
      totalSavings,
      monthlySavings,
      manualShare,
      validatedShare
    };
  }, [controllerRate, defectDelayMonths, monthlyManualHours, plants, sourceSystems]);

  function applyScenario(scenario: Scenario) {
    setPlants(scenario.plants);
    setSourceSystems(scenario.sourceSystems);
    setControllerRate(scenario.controllerRate);
    setMonthlyManualHours(scenario.monthlyManualHours);
    setDefectDelayMonths(scenario.defectDelayMonths);
  }

  return (
    <section className="section" aria-labelledby="roi-title" id="savings-simulator">
      <div className="section-head" data-reveal="true">
        <p className="eyebrow">Savings Simulator</p>
        <h2 id="roi-title">Play with your own assumptions and pressure-test migration economics</h2>
      </div>
      <div className="scenario-row" data-reveal="true">
        {SCENARIOS.map((scenario) => (
          <button
            key={scenario.label}
            type="button"
            className="scenario-chip"
            onClick={() => applyScenario(scenario)}
          >
            {scenario.label}
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
            value={plants}
            onChange={(event) => setPlants(Number(event.target.value))}
          />
          <p>{plants} plants</p>

          <label htmlFor="entity-range">Source systems</label>
          <input
            id="entity-range"
            type="range"
            min={2}
            max={12}
            value={sourceSystems}
            onChange={(event) => setSourceSystems(Number(event.target.value))}
          />
          <p>{sourceSystems} source environments</p>

          <label htmlFor="hours-range">Manual validation hours per plant/month</label>
          <input
            id="hours-range"
            type="range"
            min={6}
            max={40}
            value={monthlyManualHours}
            onChange={(event) => setMonthlyManualHours(Number(event.target.value))}
          />
          <p>{monthlyManualHours} hours</p>

          <label htmlFor="rate-range">Controller blended hourly rate (USD)</label>
          <input
            id="rate-range"
            type="range"
            min={55}
            max={220}
            value={controllerRate}
            onChange={(event) => setControllerRate(Number(event.target.value))}
          />
          <p>{currency(controllerRate)} / hour</p>

          <label htmlFor="delay-range">Average months to detect late defects</label>
          <input
            id="delay-range"
            type="range"
            min={6}
            max={36}
            value={defectDelayMonths}
            onChange={(event) => setDefectDelayMonths(Number(event.target.value))}
          />
          <p>{defectDelayMonths} months</p>
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
            <p className="support-copy">Manual process load drops as automated validation absorbs reconciliation work.</p>
          </div>
          <button type="button" className="btn btn-primary roi-cta" onClick={onCta}>
            Use my assumptions in a diagnostic
          </button>
        </article>
      </div>
    </section>
  );
}
