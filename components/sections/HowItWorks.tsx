"use client";

import { useEffect, useMemo, useState } from "react";
import { DiagnosticFinding } from "../../lib/demoEngine";
import { SharedScenario } from "../../lib/scenarioModel";
import {
  WorkflowStageId,
  WorkflowStageMetrics,
  runWorkflowSimulation
} from "../../lib/workflowSimulation";

interface HowItWorksProps {
  scenario: SharedScenario;
  findings: DiagnosticFinding[];
  projectedAnnualValue: number;
  onJumpToRoi: () => void;
}

function currency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value);
}

function percent(part: number, total: number): number {
  if (total <= 0) {
    return 0;
  }

  return Math.max(0, Math.round((part / total) * 100));
}

function formatStageMetric(stage: WorkflowStageMetrics, mode: "without" | "with"): string {
  const days = mode === "without" ? stage.withoutDays : stage.withDays;
  const queue = mode === "without" ? stage.withoutQueue : stage.withQueue;
  return `${days.toFixed(1)}d | ${queue} open`;
}

function bottleneckLabel(stage: WorkflowStageMetrics, bottleneckId: WorkflowStageId): string | null {
  if (stage.id !== bottleneckId) {
    return null;
  }

  return "Bottleneck";
}

export function HowItWorks({
  scenario,
  findings,
  projectedAnnualValue,
  onJumpToRoi
}: HowItWorksProps) {
  const simulation = useMemo(
    () => runWorkflowSimulation(scenario, findings, projectedAnnualValue),
    [findings, projectedAnnualValue, scenario]
  );
  const [selectedStage, setSelectedStage] = useState<WorkflowStageId>(simulation.bottleneckWithout);

  useEffect(() => {
    if (simulation.stages.some((stage) => stage.id === selectedStage)) {
      return;
    }

    setSelectedStage(simulation.bottleneckWithout);
  }, [selectedStage, simulation.bottleneckWithout, simulation.stages]);

  const currentStage =
    simulation.stages.find((stage) => stage.id === selectedStage) ?? simulation.stages[0];
  const cycleReduction = percent(simulation.totals.cycleDaysSaved, simulation.totals.withoutCycleDays);
  const lagReduction = percent(
    simulation.totals.remediationLagDaysSaved,
    simulation.totals.withoutRemediationLagDays
  );
  const backlogReduction = percent(simulation.totals.backlogReduction, simulation.totals.withoutBacklog);

  return (
    <section className="section workflow" aria-labelledby="how-it-works-title" id="workflow-comparator">
      <div className="section-head" data-reveal="true">
        <p className="eyebrow">Process Flow Comparator</p>
        <h2 id="how-it-works-title">A/B your validation workflow and expose where bottlenecks create lag cost</h2>
        <p className="support-copy">
          Process-mining-style simulation from your active scenario. Compare baseline flow vs. CloseLoop-assisted
          flow across queue pressure, remediation lag, and value leakage.
        </p>
      </div>

      <div className="workflow-kpis" data-reveal="true">
        <article className="workflow-kpi-card">
          <p className="label">Cycle-time compression</p>
          <h3>{cycleReduction}% faster</h3>
          <p>
            {simulation.totals.cycleDaysSaved.toFixed(1)} days saved across the full discrepancy lifecycle.
          </p>
        </article>
        <article className="workflow-kpi-card">
          <p className="label">Remediation lag reduction</p>
          <h3>{lagReduction}% lower</h3>
          <p>
            {simulation.totals.remediationLagDaysSaved.toFixed(1)} days removed from sign-off and remediation windows.
          </p>
        </article>
        <article className="workflow-kpi-card">
          <p className="label">Queue pressure</p>
          <h3>{backlogReduction}% less backlog</h3>
          <p>
            {simulation.totals.backlogReduction} fewer open stage-level items requiring manual coordination.
          </p>
        </article>
        <article className="workflow-kpi-card">
          <p className="label">Lag cost avoided</p>
          <h3>{currency(simulation.totals.lagCostAvoided)}</h3>
          <p>
            Modeled annualized value leakage avoided from faster discrepancy closure and revalidation.
          </p>
        </article>
      </div>

      <div className="workflow-lanes" data-reveal="true">
        <article className="workflow-lane without">
          <header className="workflow-lane-head">
            <p className="label">Without CloseLoop</p>
            <h3>{simulation.totals.withoutCycleDays.toFixed(1)} days to close</h3>
            <p>
              {simulation.totals.withoutBacklog} total open queue items |{" "}
              {currency(simulation.totals.withoutLagCost)} lag risk
            </p>
          </header>
          <ul className="workflow-stage-list">
            {simulation.stages.map((stage) => {
              const isActive = stage.id === currentStage.id;
              const bottleneck = bottleneckLabel(stage, simulation.bottleneckWithout);

              return (
                <li key={`without-${stage.id}`}>
                  <button
                    type="button"
                    className={`workflow-row without${isActive ? " active" : ""}`}
                    onClick={() => setSelectedStage(stage.id)}
                  >
                    <span className="workflow-stage-label">{stage.label}</span>
                    <span className="workflow-bar-shell">
                      <span
                        className="workflow-bar without"
                        style={{ width: `${Math.max((stage.withoutDays / simulation.maxStageDays) * 100, 9)}%` }}
                      />
                    </span>
                    <span className="workflow-stage-metric">{formatStageMetric(stage, "without")}</span>
                    {bottleneck ? <span className="workflow-stage-tag">{bottleneck}</span> : null}
                  </button>
                </li>
              );
            })}
          </ul>
        </article>

        <article className="workflow-lane with">
          <header className="workflow-lane-head">
            <p className="label">With CloseLoop</p>
            <h3>{simulation.totals.withCycleDays.toFixed(1)} days to close</h3>
            <p>
              {simulation.totals.withBacklog} total open queue items | {currency(simulation.totals.withLagCost)} lag risk
            </p>
          </header>
          <ul className="workflow-stage-list">
            {simulation.stages.map((stage) => {
              const isActive = stage.id === currentStage.id;
              const bottleneck = bottleneckLabel(stage, simulation.bottleneckWith);

              return (
                <li key={`with-${stage.id}`}>
                  <button
                    type="button"
                    className={`workflow-row with${isActive ? " active" : ""}`}
                    onClick={() => setSelectedStage(stage.id)}
                  >
                    <span className="workflow-stage-label">{stage.label}</span>
                    <span className="workflow-bar-shell">
                      <span
                        className="workflow-bar with"
                        style={{ width: `${Math.max((stage.withDays / simulation.maxStageDays) * 100, 9)}%` }}
                      />
                    </span>
                    <span className="workflow-stage-metric">{formatStageMetric(stage, "with")}</span>
                    {bottleneck ? <span className="workflow-stage-tag">{bottleneck}</span> : null}
                  </button>
                </li>
              );
            })}
          </ul>
        </article>
      </div>

      {currentStage ? (
        <div className="workflow-drilldown" data-reveal="true">
          <p className="label">Stage drill-down</p>
          <h3>{currentStage.label}</h3>
          <p>{currentStage.description}</p>
          <div className="workflow-detail-grid">
            <article className="workflow-detail-card without">
              <p className="label">Without CloseLoop</p>
              <p>
                {currentStage.withoutDays.toFixed(1)} days | {currentStage.withoutQueue} queue |{" "}
                {currency(currentStage.withoutLagCost)} lag cost
              </p>
            </article>
            <article className="workflow-detail-card with">
              <p className="label">With CloseLoop</p>
              <p>
                {currentStage.withDays.toFixed(1)} days | {currentStage.withQueue} queue |{" "}
                {currency(currentStage.withLagCost)} lag cost
              </p>
            </article>
          </div>
          <p className="workflow-lever">
            <strong>Automation lever:</strong> {currentStage.automationLever}
          </p>
          <button type="button" className="btn btn-secondary" onClick={onJumpToRoi}>
            Project this flow delta into savings
          </button>
        </div>
      ) : null}
    </section>
  );
}
