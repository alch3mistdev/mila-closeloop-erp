import { DiagnosticFinding } from "./demoEngine";
import { SharedScenario } from "./scenarioModel";

export type WorkflowStageId =
  | "extract"
  | "mapping"
  | "triage"
  | "signoff"
  | "remediate"
  | "revalidate";

interface WorkflowStageConfig {
  id: WorkflowStageId;
  label: string;
  description: string;
  automationLever: string;
  baseDays: number;
  baseQueue: number;
  lagWeight: number;
  withMultiplier: number;
}

export interface WorkflowStageMetrics {
  id: WorkflowStageId;
  label: string;
  description: string;
  automationLever: string;
  withoutDays: number;
  withDays: number;
  withoutQueue: number;
  withQueue: number;
  withoutLagCost: number;
  withLagCost: number;
}

export interface WorkflowSimulationTotals {
  withoutCycleDays: number;
  withCycleDays: number;
  cycleDaysSaved: number;
  withoutRemediationLagDays: number;
  withRemediationLagDays: number;
  remediationLagDaysSaved: number;
  withoutLagCost: number;
  withLagCost: number;
  lagCostAvoided: number;
  withoutBacklog: number;
  withBacklog: number;
  backlogReduction: number;
}

export interface WorkflowSimulationResult {
  stages: WorkflowStageMetrics[];
  totals: WorkflowSimulationTotals;
  bottleneckWithout: WorkflowStageId;
  bottleneckWith: WorkflowStageId;
  maxStageDays: number;
}

const STAGE_CONFIGS: WorkflowStageConfig[] = [
  {
    id: "extract",
    label: "Extract",
    description: "Collect source and target snapshots across sites and ensure scope completeness.",
    automationLever: "Automated extract checklists and ingestion integrity checks.",
    baseDays: 4.5,
    baseQueue: 16,
    lagWeight: 0.08,
    withMultiplier: 0.76
  },
  {
    id: "mapping",
    label: "Mapping",
    description: "Reconcile legacy fields and calculation logic to target ERP schema.",
    automationLever: "AI-assisted crosswalk suggestions with confidence scoring and review queue.",
    baseDays: 11.5,
    baseQueue: 48,
    lagWeight: 0.2,
    withMultiplier: 0.42
  },
  {
    id: "triage",
    label: "Discrepancy Triage",
    description: "Classify discrepancies by severity, ownership, and financial materiality.",
    automationLever: "Severity clustering and owner assignment from discrepancy context.",
    baseDays: 8.3,
    baseQueue: 36,
    lagWeight: 0.16,
    withMultiplier: 0.49
  },
  {
    id: "signoff",
    label: "Controller Sign-off",
    description: "Route ambiguous findings for financial controls review and approval.",
    automationLever: "Risk-based sign-off queue with threshold-driven prioritization.",
    baseDays: 7.4,
    baseQueue: 29,
    lagWeight: 0.12,
    withMultiplier: 0.58
  },
  {
    id: "remediate",
    label: "Remediation",
    description: "Execute fixes across plants and source systems while preserving audit trail.",
    automationLever: "Playbook-guided remediation tasks tied to stage-level evidence.",
    baseDays: 14.8,
    baseQueue: 58,
    lagWeight: 0.32,
    withMultiplier: 0.6
  },
  {
    id: "revalidate",
    label: "Revalidation",
    description: "Confirm discrepancy closure and maintain converging readiness prior to go-live.",
    automationLever: "Automated re-check loops and unresolved-finding alerts.",
    baseDays: 6.2,
    baseQueue: 24,
    lagWeight: 0.12,
    withMultiplier: 0.53
  }
];

const REMEDIATION_WINDOW_STAGES: WorkflowStageId[] = ["signoff", "remediate", "revalidate"];

function clamp(min: number, max: number, value: number): number {
  return Math.min(max, Math.max(min, value));
}

function roundToTenths(value: number): number {
  return Math.round(value * 10) / 10;
}

function cadenceMultiplier(cadence: SharedScenario["validationCadence"]): number {
  if (cadence === "parallel_plus_post") {
    return 0.88;
  }

  if (cadence === "go_live_only") {
    return 1.2;
  }

  return 1;
}

function sum(values: number[]): number {
  return values.reduce((accumulator, value) => accumulator + value, 0);
}

function maxStageIdBy<T extends { id: WorkflowStageId }>(items: T[], valueSelector: (item: T) => number): WorkflowStageId {
  return items.reduce((currentMax, candidate) =>
    valueSelector(candidate) > valueSelector(currentMax) ? candidate : currentMax
  ).id;
}

function remediationLagDays(stages: WorkflowStageMetrics, stageId: WorkflowStageId, mode: "without" | "with"): number {
  if (!REMEDIATION_WINDOW_STAGES.includes(stageId)) {
    return 0;
  }

  return mode === "without" ? stages.withoutDays : stages.withDays;
}

export function runWorkflowSimulation(
  scenario: SharedScenario,
  findings: DiagnosticFinding[],
  projectedAnnualValue: number
): WorkflowSimulationResult {
  const highSeverityCount = findings.filter((finding) => finding.severity === "high").length;
  const mediumSeverityCount = findings.filter((finding) => finding.severity === "medium").length;
  const lowSeverityCount = findings.filter((finding) => finding.severity === "low").length;

  const strictnessFactor = clamp(0.9, 1.14, 1 + (scenario.strictness - 100) / 460);
  const cadenceFactor = cadenceMultiplier(scenario.validationCadence);
  const plantFactor = 0.82 + scenario.plantCount / 72;
  const sourceFactor = 0.86 + scenario.sourceSystems.length / 8.6;
  const severityFactor = 0.95 + highSeverityCount * 0.11 + mediumSeverityCount * 0.045 + lowSeverityCount * 0.02;

  const complexityFactor = clamp(
    0.95,
    2.7,
    plantFactor * sourceFactor * strictnessFactor * cadenceFactor * severityFactor
  );

  const dailyValueAtRisk = Math.max(0, projectedAnnualValue) / 365;
  const cadenceAcceleration = scenario.validationCadence === "parallel_plus_post" ? 0.96 : 1.03;

  const stages: WorkflowStageMetrics[] = STAGE_CONFIGS.map((stage) => {
    const withoutDays = roundToTenths(stage.baseDays * complexityFactor);
    const withDays = roundToTenths(Math.max(1.2, withoutDays * stage.withMultiplier * cadenceAcceleration + 0.7));
    const withoutQueue = Math.max(
      2,
      Math.round(stage.baseQueue * complexityFactor * (1 + highSeverityCount * 0.08))
    );
    const withQueue = Math.max(1, Math.round(withoutQueue * stage.withMultiplier * 0.78));

    const withoutLagCost = Math.round(
      dailyValueAtRisk * withoutDays * stage.lagWeight * (1 + highSeverityCount * 0.04)
    );
    const withLagCost = Math.round(dailyValueAtRisk * withDays * stage.lagWeight * 0.44);

    return {
      id: stage.id,
      label: stage.label,
      description: stage.description,
      automationLever: stage.automationLever,
      withoutDays,
      withDays,
      withoutQueue,
      withQueue,
      withoutLagCost,
      withLagCost
    };
  });

  const withoutCycleDays = roundToTenths(sum(stages.map((stage) => stage.withoutDays)));
  const withCycleDays = roundToTenths(sum(stages.map((stage) => stage.withDays)));
  const cycleDaysSaved = roundToTenths(withoutCycleDays - withCycleDays);

  const withoutRemediationLagDays = roundToTenths(
    sum(stages.map((stage) => remediationLagDays(stage, stage.id, "without")))
  );
  const withRemediationLagDays = roundToTenths(
    sum(stages.map((stage) => remediationLagDays(stage, stage.id, "with")))
  );
  const remediationLagDaysSaved = roundToTenths(withoutRemediationLagDays - withRemediationLagDays);

  const withoutLagCost = sum(stages.map((stage) => stage.withoutLagCost));
  const withLagCost = sum(stages.map((stage) => stage.withLagCost));
  const lagCostAvoided = Math.max(0, withoutLagCost - withLagCost);

  const withoutBacklog = sum(stages.map((stage) => stage.withoutQueue));
  const withBacklog = sum(stages.map((stage) => stage.withQueue));
  const backlogReduction = Math.max(0, withoutBacklog - withBacklog);

  const bottleneckWithout = maxStageIdBy(stages, (stage) => stage.withoutDays);
  const bottleneckWith = maxStageIdBy(stages, (stage) => stage.withDays);
  const maxStageDays = Math.max(
    1,
    ...stages.map((stage) => stage.withoutDays),
    ...stages.map((stage) => stage.withDays)
  );

  return {
    stages,
    totals: {
      withoutCycleDays,
      withCycleDays,
      cycleDaysSaved,
      withoutRemediationLagDays,
      withRemediationLagDays,
      remediationLagDaysSaved,
      withoutLagCost,
      withLagCost,
      lagCostAvoided,
      withoutBacklog,
      withBacklog,
      backlogReduction
    },
    bottleneckWithout,
    bottleneckWith,
    maxStageDays
  };
}
