"use client";

import { useMemo, useState } from "react";

interface ROIFrameProps {
  onCta: () => void;
}

export function ROIFrame({ onCta }: ROIFrameProps) {
  const [plants, setPlants] = useState(35);
  const [entities, setEntities] = useState(4);

  const model = useMemo(() => {
    const manualWeeks = Math.round((plants * entities * 0.45 + 14) / 2) * 2;
    const validatedWeeks = Math.max(4, Math.round(manualWeeks * 0.35));
    const riskEvents = Math.max(2, Math.round((plants * entities) / 18));
    const remediationLoad = Math.round(riskEvents * 2.8);

    return {
      manualWeeks,
      validatedWeeks,
      riskEvents,
      remediationLoad
    };
  }, [entities, plants]);

  return (
    <section className="section" aria-labelledby="roi-title">
      <div className="section-head" data-reveal="true">
        <p className="eyebrow">Cost Of Not Validating</p>
        <h2 id="roi-title">Price this by risk exposure, not by software line item</h2>
      </div>
      <div className="roi-grid" data-reveal="true">
        <article className="roi-controls">
          <label htmlFor="plant-range">Plant count</label>
          <input
            id="plant-range"
            type="range"
            min={5}
            max={120}
            value={plants}
            onChange={(event) => setPlants(Number(event.target.value))}
          />
          <p>{plants} locations</p>

          <label htmlFor="entity-range">Legacy source systems</label>
          <input
            id="entity-range"
            type="range"
            min={2}
            max={12}
            value={entities}
            onChange={(event) => setEntities(Number(event.target.value))}
          />
          <p>{entities} source environments</p>

          <button type="button" className="btn btn-primary" onClick={onCta}>
            Talk diagnostic scope
          </button>
        </article>

        <article className="roi-results">
          <div className="roi-result-card">
            <p className="label">Manual validation timeline</p>
            <p className="roi-value">{model.manualWeeks} weeks</p>
          </div>
          <div className="roi-result-card">
            <p className="label">Automated validation timeline</p>
            <p className="roi-value highlight">{model.validatedWeeks} weeks</p>
          </div>
          <div className="roi-result-card">
            <p className="label">Potential high-severity discrepancy clusters</p>
            <p className="roi-value">{model.riskEvents}</p>
          </div>
          <div className="roi-result-card">
            <p className="label">Estimated remediation workstreams if found late</p>
            <p className="roi-value">{model.remediationLoad}</p>
          </div>
        </article>
      </div>
    </section>
  );
}
