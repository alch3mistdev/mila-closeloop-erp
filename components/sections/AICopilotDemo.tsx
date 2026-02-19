"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CopilotAudience,
  CopilotResponsePayload,
  buildPmoDraft,
  parseSourceFields,
  suggestMappings
} from "../../lib/aiCopilot";
import { runDiagnostic } from "../../lib/demoEngine";

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

export function AICopilotDemo() {
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
  const syntheticFindings = useMemo(
    () =>
      runDiagnostic({
        sourceSystems: ["Oracle", "Custom SQL", "Spreadsheets"],
        plantCount: 26,
        strictness: 1,
        validationCadence: "phase_gates"
      }),
    []
  );

  const flaggedCount = suggestions.filter((suggestion) => suggestion.confidence < reviewThreshold).length;
  const selected = suggestions[selectedSuggestion];
  const pmoDraft = useMemo(
    () => buildPmoDraft(suggestions, syntheticFindings, reviewThreshold),
    [reviewThreshold, suggestions, syntheticFindings]
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
          findings: syntheticFindings
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
      </div>
      <div className="ai-demo-grid" data-reveal="true">
        <article className="ai-panel">
          <h3>1. Paste legacy field names</h3>
          <p className="support-copy">
            Local heuristic mapping runs in-browser. Live OpenAI mode sends this simulated field list to your
            server-side API route for generation.
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
            Live generation turns technical mapping + discrepancy context into executive messaging, objection
            handling, and a CTA-ready storyline.
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
                {liveResult.mode === "live" ? `Live OpenAI${liveResult.model ? ` (${liveResult.model})` : ""}` : "Fallback mode"}
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
