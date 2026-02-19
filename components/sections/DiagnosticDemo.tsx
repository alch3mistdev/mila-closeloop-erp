"use client";

import { useEffect, useMemo, useState } from "react";
import {
  calculateReadinessScore,
  calculateRiskPressure,
  DiagnosticFinding,
  getCadenceProfile,
  runDiagnostic,
  ValidationCadence
} from "../../lib/demoEngine";
import { SCENARIO_SOURCE_OPTIONS, SharedScenario } from "../../lib/scenarioModel";

interface DiagnosticDemoProps {
  scenario: SharedScenario;
  findings: DiagnosticFinding[];
  onScenarioChange: (changes: Partial<SharedScenario>) => void;
  onContinue: () => void;
}

const CADENCE_OPTIONS: ValidationCadence[] = [
  "phase_gates",
  "parallel_plus_post",
  "go_live_only"
];

export function DiagnosticDemo({ scenario, findings, onScenarioChange, onContinue }: DiagnosticDemoProps) {
  const [selectedFindingIndex, setSelectedFindingIndex] = useState(0);

  useEffect(() => {
    setSelectedFindingIndex((current) => Math.min(current, Math.max(findings.length - 1, 0)));
  }, [findings.length]);

  function toggleSource(source: string) {
    if (scenario.sourceSystems.includes(source)) {
      if (scenario.sourceSystems.length === 1) {
        return;
      }

      onScenarioChange({
        sourceSystems: scenario.sourceSystems.filter((item) => item !== source)
      });
      return;
    }

    onScenarioChange({
      sourceSystems: [...scenario.sourceSystems, source]
    });
  }

  const highSeverityCount = findings.filter((finding) => finding.severity === "high").length;
  const baselineHighSeverity = useMemo(
    () =>
      runDiagnostic({
        sourceSystems: scenario.sourceSystems,
        plantCount: scenario.plantCount,
        strictness: scenario.strictness / 100,
        validationCadence: "phase_gates"
      }).filter((finding) => finding.severity === "high").length,
    [scenario.plantCount, scenario.sourceSystems, scenario.strictness]
  );
  const readinessScore = calculateReadinessScore(
    findings,
    scenario.sourceSystems.length,
    scenario.validationCadence
  );

  const activeCadence = getCadenceProfile(scenario.validationCadence);
  const activePressure = calculateRiskPressure({
    sourceSystems: scenario.sourceSystems,
    plantCount: scenario.plantCount,
    strictness: scenario.strictness / 100,
    validationCadence: scenario.validationCadence
  });
  const baselinePressure = calculateRiskPressure({
    sourceSystems: scenario.sourceSystems,
    plantCount: scenario.plantCount,
    strictness: scenario.strictness / 100,
    validationCadence: "phase_gates"
  });
  const deltaVsBaseline = Math.round(((activePressure - baselinePressure) / baselinePressure) * 100);
  const selectedFinding = findings[selectedFindingIndex];
  const highSeverityDelta = highSeverityCount - baselineHighSeverity;

  const normalizedDelta = useMemo(() => {
    if (!Number.isFinite(deltaVsBaseline)) {
      return 0;
    }

    return deltaVsBaseline;
  }, [deltaVsBaseline]);

  return (
    <section className="section" aria-labelledby="diagnostic-title" id="diagnostic-simulator">
      <div className="section-head" data-reveal="true">
        <p className="eyebrow">Interactive Mini Diagnostic</p>
        <h2 id="diagnostic-title">Simulate what your discrepancy report can expose in minutes</h2>
      </div>
      <div className="diagnostic-grid" data-reveal="true">
        <article className="diagnostic-controls">
          <h3>1. Select source stack</h3>
          <div className="source-pills" role="group" aria-label="Source systems">
            {SCENARIO_SOURCE_OPTIONS.map((source) => {
              const selected = scenario.sourceSystems.includes(source);

              return (
                <button
                  key={source}
                  type="button"
                  className={`source-pill ${selected ? "selected" : ""}`}
                  onClick={() => toggleSource(source)}
                  aria-pressed={selected}
                >
                  {source}
                </button>
              );
            })}
          </div>
          <h3>2. Set plant scope</h3>
          <label htmlFor="plant-count-range" className="mono-label">
            {scenario.plantCount} plants
          </label>
          <input
            id="plant-count-range"
            type="range"
            min={5}
            max={100}
            value={scenario.plantCount}
            onChange={(event) => onScenarioChange({ plantCount: Number(event.target.value) })}
          />
          <h3>3. Pick validation cadence</h3>
          <div className="cadence-grid" role="group" aria-label="Validation cadence">
            {CADENCE_OPTIONS.map((cadence) => {
              const profile = getCadenceProfile(cadence);

              return (
                <button
                  key={cadence}
                  type="button"
                  className={`cadence-card ${scenario.validationCadence === cadence ? "selected" : ""}`}
                  onClick={() => onScenarioChange({ validationCadence: cadence })}
                >
                  <span className="cadence-name">{profile.label}</span>
                  <span className="cadence-effect">{profile.effectLabel}</span>
                  <span className="cadence-multiplier">
                    Risk multiplier: x{profile.multiplier.toFixed(2)}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="cadence-explainer" aria-live="polite">
            <p className="label">Cadence impact</p>
            <p>{activeCadence.summary}</p>
            <p className="cadence-delta">
              Relative to Phase Gates baseline:{" "}
              <strong>
                {normalizedDelta >= 0 ? "+" : ""}
                {normalizedDelta}%
              </strong>{" "}
              projected unresolved risk pressure, with{" "}
              <strong>
                {highSeverityDelta >= 0 ? "+" : ""}
                {highSeverityDelta}
              </strong>{" "}
              projected high-severity clusters.
            </p>
            <p className="support-copy">Cadence directly affects pressure index, severity mix, and readiness score.</p>
          </div>
          <label htmlFor="strictness-range" className="mono-label">
            Detection strictness: {scenario.strictness}%
          </label>
          <input
            id="strictness-range"
            type="range"
            min={70}
            max={130}
            value={scenario.strictness}
            onChange={(event) => onScenarioChange({ strictness: Number(event.target.value) })}
          />
          <p className="diagnostic-summary">
            High-severity flags projected: <strong>{highSeverityCount}</strong> | Readiness score:{" "}
            <strong>{readinessScore}</strong>/100
          </p>
          <p className="diagnostic-meta">
            Current risk pressure index: <strong>{Math.round(activePressure)}</strong>
          </p>
          <button type="button" className="btn btn-secondary" onClick={onContinue}>
            Continue to AI copilot with this scenario
          </button>
        </article>

        <article className="findings-panel" aria-live="polite">
          <h3>Sample discrepancy report</h3>
          <p className="finding-instruction">Click a discrepancy to inspect why it matters and how to remediate.</p>
          <ul className="findings-list" role="listbox" aria-label="Discrepancy findings">
            {findings.map((finding, index) => {
              const isSelected = index === selectedFindingIndex;

              return (
                <li key={`${finding.category}-${index}`} className={`finding ${finding.severity}`}>
                  <button
                    type="button"
                    className={`finding-button ${isSelected ? "active" : ""}`}
                    onClick={() => setSelectedFindingIndex(index)}
                    aria-pressed={isSelected}
                  >
                    <p className="finding-meta">
                      <span className="severity-tag">{finding.severity}</span>
                      <span>{finding.category}</span>
                    </p>
                    <p>{finding.summary}</p>
                  </button>
                </li>
              );
            })}
          </ul>

          {selectedFinding ? (
            <section className="drilldown-panel">
              <p className="label">Discrepancy drill-down</p>
              <h4>{selectedFinding.category}</h4>
              <p>
                <strong>Why it matters:</strong> {selectedFinding.whyItMatters}
              </p>
              <p>
                <strong>Likely root cause:</strong> {selectedFinding.likelyRootCause}
              </p>
              <p>
                <strong>Recommended owner:</strong> {selectedFinding.recommendedOwner} |{" "}
                <strong>Estimated effort:</strong> {selectedFinding.estimatedEffort}
              </p>
              <p className="label">Remediation steps</p>
              <ol>
                {selectedFinding.remediationSteps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </section>
          ) : null}
        </article>
      </div>
    </section>
  );
}
