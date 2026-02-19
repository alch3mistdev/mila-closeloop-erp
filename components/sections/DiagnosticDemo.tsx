"use client";

import { useMemo, useState } from "react";
import { runDiagnostic } from "../../lib/demoEngine";

interface DiagnosticDemoProps {
  onCta: () => void;
}

const SOURCE_OPTIONS = ["SAP ECC", "Oracle", "Microsoft Dynamics", "AS/400", "Custom SQL", "Spreadsheets"];

export function DiagnosticDemo({ onCta }: DiagnosticDemoProps) {
  const [selectedSources, setSelectedSources] = useState<string[]>(["SAP ECC", "Oracle", "Spreadsheets"]);
  const [plantCount, setPlantCount] = useState(22);

  const findings = useMemo(
    () => runDiagnostic({ sourceSystems: selectedSources, plantCount }),
    [plantCount, selectedSources]
  );

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

  return (
    <section className="section" aria-labelledby="diagnostic-title">
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
          <p className="diagnostic-summary">
            High-severity flags projected: <strong>{highSeverityCount}</strong>
          </p>
          <button type="button" className="btn btn-primary" onClick={onCta}>
            Request this for my environment
          </button>
        </article>

        <article className="findings-panel" aria-live="polite">
          <h3>Sample discrepancy report</h3>
          <ul className="findings-list">
            {findings.map((finding, index) => (
              <li key={`${finding.category}-${index}`} className={`finding ${finding.severity}`}>
                <p className="finding-meta">
                  <span className="severity-tag">{finding.severity}</span>
                  <span>{finding.category}</span>
                </p>
                <p>{finding.summary}</p>
              </li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  );
}
