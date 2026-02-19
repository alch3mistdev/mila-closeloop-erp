"use client";

import { useEffect, useMemo, useState } from "react";
import {
  calculateRiskPressure,
  getCadenceProfile,
  runDiagnostic,
  ValidationCadence
} from "../../lib/demoEngine";

interface DiagnosticDemoProps {
  onCta: () => void;
}

const SOURCE_OPTIONS = ["SAP ECC", "Oracle", "Microsoft Dynamics", "AS/400", "Custom SQL", "Spreadsheets"];

const CADENCE_OPTIONS: ValidationCadence[] = [
  "phase_gates",
  "parallel_plus_post",
  "go_live_only"
];

export function DiagnosticDemo({ onCta }: DiagnosticDemoProps) {
  const [selectedSources, setSelectedSources] = useState<string[]>(["SAP ECC", "Oracle", "Spreadsheets"]);
  const [plantCount, setPlantCount] = useState(22);
  const [strictness, setStrictness] = useState(95);
  const [validationCadence, setValidationCadence] = useState<ValidationCadence>("phase_gates");
  const [selectedFindingIndex, setSelectedFindingIndex] = useState(0);

  const findings = useMemo(
    () =>
      runDiagnostic({
        sourceSystems: selectedSources,
        plantCount,
        strictness: strictness / 100,
        validationCadence
      }),
    [plantCount, selectedSources, strictness, validationCadence]
  );

  useEffect(() => {
    setSelectedFindingIndex((current) => Math.min(current, Math.max(findings.length - 1, 0)));
  }, [findings.length]);

  function toggleSource(source: string) {
    setSelectedSources((prev) => {
      if (prev.includes(source)) {
        if (prev.length === 1) {
          return prev;
        }

        return prev.filter((item) => item !== source);
      }

      return [...prev, source];
    });
  }

  const highSeverityCount = findings.filter((finding) => finding.severity === "high").length;
  const mediumSeverityCount = findings.filter((finding) => finding.severity === "medium").length;
  const readinessScore = Math.max(
    41,
    Math.round(
      92 -
        highSeverityCount * 11 -
        mediumSeverityCount * 4 -
        selectedSources.length * 1.5 -
        (validationCadence === "go_live_only" ? 8 : 0) +
        (validationCadence === "parallel_plus_post" ? 5 : 0)
    )
  );

  const activeCadence = getCadenceProfile(validationCadence);
  const activePressure = calculateRiskPressure({
    sourceSystems: selectedSources,
    plantCount,
    strictness: strictness / 100,
    validationCadence
  });
  const baselinePressure = calculateRiskPressure({
    sourceSystems: selectedSources,
    plantCount,
    strictness: strictness / 100,
    validationCadence: "phase_gates"
  });
  const deltaVsBaseline = Math.round(((activePressure - baselinePressure) / baselinePressure) * 100);
  const selectedFinding = findings[selectedFindingIndex];

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
            {SOURCE_OPTIONS.map((source) => {
              const selected = selectedSources.includes(source);

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
            {plantCount} plants
          </label>
          <input
            id="plant-count-range"
            type="range"
            min={5}
            max={100}
            value={plantCount}
            onChange={(event) => setPlantCount(Number(event.target.value))}
          />
          <h3>3. Pick validation cadence</h3>
          <div className="cadence-grid" role="group" aria-label="Validation cadence">
            {CADENCE_OPTIONS.map((cadence) => {
              const profile = getCadenceProfile(cadence);

              return (
                <button
                  key={cadence}
                  type="button"
                  className={`cadence-card ${validationCadence === cadence ? "selected" : ""}`}
                  onClick={() => setValidationCadence(cadence)}
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
                {deltaVsBaseline >= 0 ? "+" : ""}
                {deltaVsBaseline}%
              </strong>{" "}
              projected unresolved risk pressure.
            </p>
          </div>
          <label htmlFor="strictness-range" className="mono-label">
            Detection strictness: {strictness}%
          </label>
          <input
            id="strictness-range"
            type="range"
            min={70}
            max={130}
            value={strictness}
            onChange={(event) => setStrictness(Number(event.target.value))}
          />
          <p className="diagnostic-summary">
            High-severity flags projected: <strong>{highSeverityCount}</strong> | Readiness score:{" "}
            <strong>{readinessScore}</strong>/100
          </p>
          <p className="diagnostic-meta">
            Current risk pressure index: <strong>{Math.round(activePressure)}</strong>
          </p>
          <button type="button" className="btn btn-primary" onClick={onCta}>
            Convert this into my diagnostic
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
