"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CopilotAudience,
  CopilotResponsePayload,
  buildPmoDraft,
  parseSourceFields,
  suggestMappings
} from "../../lib/aiCopilot";
import { DiagnosticFinding } from "../../lib/demoEngine";
import { SharedScenario } from "../../lib/scenarioModel";

const TARGET_FIELDS = [
  "Plant",
  "CostCenter",
  "StandardUnitCost",
  "G_L_Account",
  "AssetMasterId",
  "VendorPaymentTerms",
  "CurrencyCode",
  "MaterialNumber",
  "PostingDate"
];

const DEFAULT_SOURCE_FIELDS = [
  "LEGACY_PLNT_ID",
  "MATL_CST_CENTER",
  "STD_UCOST",
  "GL_ACCT_NUM",
  "ASSET_ID_LOCAL",
  "VENDR_TERM_CODE",
  "CURR_KEY",
  "MTRL_NO",
  "POSTING_DT"
].join("\n");

interface AICopilotDemoProps {
  scenario: SharedScenario;
  findings: DiagnosticFinding[];
  readinessScore: number;
  projectedAnnualValue: number;
  projectedMonthlyValue: number;
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

export function AICopilotDemo({
  scenario,
  findings,
  readinessScore,
  projectedAnnualValue,
  projectedMonthlyValue
}: AICopilotDemoProps) {
  const [sourceInput, setSourceInput] = useState(DEFAULT_SOURCE_FIELDS);
  const [reviewThreshold, setReviewThreshold] = useState(80);
  const [selectedSuggestion, setSelectedSuggestion] = useState(0);
  const [showDraft, setShowDraft] = useState(false);
  const [audience, setAudience] = useState<CopilotAudience>("CFO");
  const [liveResult, setLiveResult] = useState<CopilotResponsePayload | null>(null);
  const [liveError, setLiveError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const sourceFields = useMemo(() => parseSourceFields(sourceInput), [sourceInput]);
  const suggestions = useMemo(() => suggestMappings(sourceFields, TARGET_FIELDS), [sourceFields]);

  const flaggedCount = suggestions.filter((suggestion) => suggestion.confidence < reviewThreshold).length;
  const manualMinutesPerCycle = suggestions.length * 18 + findings.length * 24;
  const copilotMinutesPerCycle = suggestions.length * 6 + findings.length * 9;
  const cycleHoursSaved = Math.max(0, (manualMinutesPerCycle - copilotMinutesPerCycle) / 60);
  const cycleReductionPercent = manualMinutesPerCycle
    ? Math.round(((manualMinutesPerCycle - copilotMinutesPerCycle) / manualMinutesPerCycle) * 100)
    : 0;
  const selected = suggestions[selectedSuggestion];
  const pmoDraft = useMemo(
    () => buildPmoDraft(suggestions, findings, reviewThreshold),
    [reviewThreshold, suggestions, findings]
  );

  useEffect(() => {
    setSelectedSuggestion((current) => Math.min(current, Math.max(0, suggestions.length - 1)));
  }, [suggestions.length]);

  async function generateLiveNarrative() {
    setIsGenerating(true);
    setLiveError(null);

    try {
      const response = await fetch("/api/copilot/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          audience,
          reviewThreshold,
          suggestions,
          findings,
          scenario: {
            plantCount: scenario.plantCount,
            sourceSystems: scenario.sourceSystems,
            validationCadence: scenario.validationCadence,
            strictness: scenario.strictness,
            readinessScore,
            projectedAnnualValue,
            projectedMonthlyValue
          }
        })
      });

      const payload = (await response.json()) as CopilotResponsePayload;

      if (!response.ok) {
        throw new Error(payload.warning ?? "Failed to generate AI narrative.");
      }

      setLiveResult(payload);
      setShowDraft(false);
    } catch (error) {
      setLiveError(error instanceof Error ? error.message : "Failed to generate AI narrative.");
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <section className="section" aria-labelledby="ai-copilot-title" id="ai-copilot-demo">
      <div className="section-head" data-reveal="true">
        <p className="eyebrow">AI Copilot Demo</p>
        <h2 id="ai-copilot-title">See how AI removes manual mapping and status-update busywork</h2>
        <p className="support-copy">
          Typical workflow: teams reconcile field mappings in spreadsheets, then manually rewrite
          governance updates. This demo shows what AI automates versus what still requires controller
          sign-off.
        </p>
      </div>
      <div className="scenario-compact" data-reveal="true">
        <p className="label">Using shared scenario</p>
        <p>
          {scenario.plantCount} plants | {scenario.sourceSystems.length} source systems |{" "}
          {cadenceLabel(scenario.validationCadence)} | Readiness {readinessScore}/100 | Annual value at stake{" "}
          {currency(projectedAnnualValue)}
        </p>
      </div>
      <div className="ai-onramp" data-reveal="true">
        <article>
          <p className="label">Without copilot</p>
          <p>
            Analysts map legacy fields one-by-one, escalate uncertainty by email, and craft PMO
            updates from scratch.
          </p>
        </article>
        <article>
          <p className="label">With copilot</p>
          <p>
            AI proposes mappings, flags low-confidence items for expert review, and drafts
            audience-specific narratives from the same discrepancy context.
          </p>
        </article>
      </div>
      <div className="ai-impact-strip" data-reveal="true">
        <article>
          <p className="label">AI workflow impact (demo model)</p>
          <h3>{cycleHoursSaved.toFixed(1)} hours saved per validation cycle</h3>
          <p>
            Estimated {cycleReductionPercent}% reduction in mapping triage and PMO status-draft effort for the
            current discrepancy set.
          </p>
        </article>
        <article>
          <p className="label">High-focus queue</p>
          <h3>{flaggedCount} mappings need controller review</h3>
          <p>
            Copilot narrows attention to low-confidence matches so teams spend expert review time where risk is
            concentrated.
          </p>
        </article>
      </div>
      <div className="ai-demo-grid" data-reveal="true">
        <article className="ai-panel">
          <h3>1. Paste legacy field names</h3>
          <p className="support-copy">
            Local heuristic mapping runs in-browser. Live OpenAI mode sends this simulated field list plus
            active scenario context to your server-side API route for generation.
          </p>
          <textarea
            className="field-input"
            value={sourceInput}
            onChange={(event) => {
              setSourceInput(event.target.value);
              setSelectedSuggestion(0);
              setShowDraft(false);
              setLiveResult(null);
              setLiveError(null);
            }}
            aria-label="Legacy source fields"
          />
          <label htmlFor="review-threshold" className="mono-label">
            Controller review threshold: {reviewThreshold}%
          </label>
          <input
            id="review-threshold"
            type="range"
            min={60}
            max={95}
            value={reviewThreshold}
            onChange={(event) => setReviewThreshold(Number(event.target.value))}
          />
          <p className="diagnostic-meta">
            <strong>{flaggedCount}</strong> field mapping(s) require sign-off at current threshold.
          </p>
        </article>

        <article className="ai-panel">
          <h3>2. AI-suggested mapping output</h3>
          <ul className="mapping-list" aria-label="AI mapping suggestions">
            {suggestions.map((suggestion, index) => {
              const needsReview = suggestion.confidence < reviewThreshold;

              return (
                <li key={`${suggestion.sourceField}-${suggestion.targetField}`}>
                  <button
                    type="button"
                    className={`mapping-row ${selectedSuggestion === index ? "active" : ""}`}
                    onClick={() => setSelectedSuggestion(index)}
                  >
                    <span className="mapping-source">{suggestion.sourceField}</span>
                    <span className="mapping-arrow">{"->"}</span>
                    <span className="mapping-target">{suggestion.targetField}</span>
                    <span className={`confidence-chip ${suggestion.risk}`}>{suggestion.confidence}%</span>
                    {needsReview ? <span className="review-flag">Review</span> : null}
                  </button>
                </li>
              );
            })}
          </ul>
          {selected ? (
            <div className="mapping-detail">
              <p className="label">Selected mapping rationale</p>
              <p>{selected.rationale}</p>
              <p>
                <strong>Workflow impact:</strong> {selected.reviewNote}
              </p>
            </div>
          ) : null}
          <div className="target-reference">
            <p className="label">Target schema reference</p>
            <p>{TARGET_FIELDS.join(", ")}</p>
          </div>
        </article>

        <article className="ai-panel pmo-panel">
          <h3>3. Generate persuasive AI stakeholder narrative</h3>
          <p className="support-copy">
            Live generation uses your current scenario and findings to produce audience-specific messaging and
            action language.
          </p>
          <div className="audience-row">
            {(["CFO", "PMO", "Plant Controller"] as CopilotAudience[]).map((candidate) => (
              <button
                key={candidate}
                type="button"
                className={`audience-chip ${audience === candidate ? "active" : ""}`}
                onClick={() => setAudience(candidate)}
              >
                {candidate}
              </button>
            ))}
          </div>
          <div className="generation-actions">
            <button type="button" className="btn btn-primary" onClick={generateLiveNarrative} disabled={isGenerating}>
              {isGenerating ? "Generating..." : "Generate with OpenAI"}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => setShowDraft((state) => !state)}>
              {showDraft ? "Hide baseline draft" : "Show baseline heuristic draft"}
            </button>
          </div>
          {liveError ? <p className="live-error">{liveError}</p> : null}
          {liveResult ? (
            <div className="live-output">
              <p className={`live-badge ${liveResult.mode}`}>
                {liveResult.mode === "live"
                  ? `Live OpenAI${liveResult.model ? ` (${liveResult.model})` : ""}`
                  : "Fallback mode"}
              </p>
              {liveResult.warning ? <p className="support-copy">{liveResult.warning}</p> : null}
              <p className="label">{liveResult.narrative.headline}</p>
              <p>{liveResult.narrative.executiveSummary}</p>
              <ul>
                {liveResult.narrative.persuasivePoints.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
              <p>
                <strong>Objection handling:</strong> {liveResult.narrative.objectionHandling}
              </p>
              <p>
                <strong>Recommended CTA language:</strong> {liveResult.narrative.cta}
              </p>
              <p>
                <strong>Suggested subject line:</strong> {liveResult.narrative.subjectLine}
              </p>
            </div>
          ) : null}
          {showDraft ? (
            <div className="pmo-draft">
              <p className="label">{pmoDraft.headline}</p>
              <p>{pmoDraft.summary}</p>
              <ul>
                {pmoDraft.actions.map((action) => (
                  <li key={action}>{action}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </article>
      </div>
    </section>
  );
}
