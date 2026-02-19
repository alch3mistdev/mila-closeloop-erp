export type ValidationCadence = "phase_gates" | "parallel_plus_post" | "go_live_only";

export interface DiagnosticInput {
  sourceSystems: string[];
  plantCount: number;
  strictness?: number;
  validationCadence?: ValidationCadence;
}

export interface DiagnosticFinding {
  severity: "high" | "medium" | "low";
  category: string;
  summary: string;
  whyItMatters: string;
  likelyRootCause: string;
  remediationSteps: string[];
  recommendedOwner: string;
  estimatedEffort: string;
}

export interface CadenceProfile {
  id: ValidationCadence;
  label: string;
  multiplier: number;
  summary: string;
  effectLabel: string;
}

const CADENCE_PROFILES: Record<ValidationCadence, CadenceProfile> = {
  phase_gates: {
    id: "phase_gates",
    label: "Phase Gates",
    multiplier: 1,
    summary: "Validation at test, parallel run, and pre/post go-live checkpoints.",
    effectLabel: "Baseline coverage"
  },
  parallel_plus_post: {
    id: "parallel_plus_post",
    label: "Parallel + Post",
    multiplier: 0.78,
    summary: "Heavier parallel-run and post-go-live controls reduce unresolved discrepancy pressure.",
    effectLabel: "Lower projected risk"
  },
  go_live_only: {
    id: "go_live_only",
    label: "Go-live Only",
    multiplier: 1.28,
    summary: "Most checks occur at cutover, increasing late-discovery and remediation load.",
    effectLabel: "Higher projected risk"
  }
};

interface FindingTemplate {
  category: string;
  summary: string;
  whyItMatters: string;
  likelyRootCause: string;
  remediationSteps: string[];
  recommendedOwner: string;
  estimatedEffort: string;
}

const FINDING_LIBRARY: Record<"high" | "medium" | "low", FindingTemplate[]> = {
  high: [
    {
      category: "Cross-Plant Methodology",
      summary:
        "Unit cost logic differs across plants, creating structurally incomparable operating margin figures.",
      whyItMatters:
        "Board-level profitability comparisons can be directionally wrong even when all entities appear reconciled.",
      likelyRootCause:
        "Different allocation formulas and local costing assumptions were migrated without methodology harmonization.",
      remediationSteps: [
        "Isolate plants with outlier margin behavior by product family and period.",
        "Document and reconcile costing formula differences with finance controllers.",
        "Publish a unified costing rulebook and map it to SAP calculation logic.",
        "Re-run parallel validation and freeze go-live sign-off until variance thresholds are met."
      ],
      recommendedOwner: "Plant Controller + Global Finance Process Owner",
      estimatedEffort: "2-4 weeks"
    },
    {
      category: "Schema Mapping",
      summary:
        "Critical source fields have no target mapping in S/4HANA, increasing risk of silent data loss at consolidation.",
      whyItMatters:
        "Missing financial attributes can distort margin, asset valuation, and audit traceability across entities.",
      likelyRootCause:
        "Legacy field semantics were interpreted differently across migration teams and templates.",
      remediationSteps: [
        "Generate a field-level orphan report for all unmapped or low-confidence fields.",
        "Prioritize financially material fields and assign mapping decisions by domain.",
        "Implement mapping controls and confidence thresholds before full-load migration.",
        "Backfill affected records and rerun completeness checks with signed approval."
      ],
      recommendedOwner: "Data Migration Lead + Finance Systems Architect",
      estimatedEffort: "1-3 weeks"
    },
    {
      category: "Record Completeness",
      summary:
        "Asset and vendor snapshots show missing records between source and target extracts.",
      whyItMatters:
        "Record omissions can create downstream posting errors, reconciliation churn, and audit exceptions.",
      likelyRootCause:
        "Snapshot timing mismatches and extract filters excluded active records during cutover windows.",
      remediationSteps: [
        "Run source-versus-target record counts by legal entity and object class.",
        "Trace missing-record cohorts to extract timestamps and filtering logic.",
        "Patch extraction templates and execute controlled delta backfill.",
        "Lock reconciliation controls for final cutover with exception escalation."
      ],
      recommendedOwner: "Migration PMO + Master Data Owner",
      estimatedEffort: "1-2 weeks"
    }
  ],
  medium: [
    {
      category: "Value Range Drift",
      summary:
        "Inventory valuation ranges in one location are statistically outside expected distribution after migration.",
      whyItMatters:
        "Unexplained drift can mask valuation misstatements and inflate variance investigations after go-live.",
      likelyRootCause:
        "Currency conversion, unit-of-measure, or costing basis transformations were applied inconsistently.",
      remediationSteps: [
        "Segment drift by plant, valuation class, and effective date.",
        "Validate conversion rules against source-system lineage.",
        "Recalculate impacted cohorts and compare against tolerance bands.",
        "Add control checks for drift outliers in post-load QA."
      ],
      recommendedOwner: "Inventory Accounting Lead",
      estimatedEffort: "5-10 days"
    },
    {
      category: "Reference Data",
      summary:
        "Chart-of-accounts alignment is partially inconsistent across acquired entities and legacy systems.",
      whyItMatters:
        "Inconsistent account mapping undermines cross-entity comparability and close-cycle confidence.",
      likelyRootCause:
        "Acquired entities retained local account definitions that were not fully normalized.",
      remediationSteps: [
        "Flag non-standard account mappings and classify by reporting materiality.",
        "Define canonical account mapping with global finance sign-off.",
        "Update transformation rules and reclassify historical balances where required.",
        "Embed COA mapping checks into monthly post-go-live controls."
      ],
      recommendedOwner: "Group Controller + ERP Finance Lead",
      estimatedEffort: "1-2 weeks"
    },
    {
      category: "Confidence Scoring",
      summary:
        "NLP-assisted field matches include low-confidence pairs that require controller sign-off.",
      whyItMatters:
        "Unchecked low-confidence mappings become latent defects in reporting pipelines.",
      likelyRootCause:
        "Legacy naming conventions and sparse metadata lowered model confidence on semantically similar fields.",
      remediationSteps: [
        "Review low-confidence mapping queue by financial criticality tier.",
        "Approve or reject mappings with controller + data owner dual sign-off.",
        "Create reusable mapping templates for recurrent source systems.",
        "Track confidence drift over future ingestion cycles."
      ],
      recommendedOwner: "Data Steward + Plant Controller",
      estimatedEffort: "3-7 days"
    }
  ],
  low: [
    {
      category: "Governance",
      summary:
        "Validation ownership is not consistently assigned for post-go-live defect closure.",
      whyItMatters:
        "Unowned findings linger and evolve into long-term workaround behavior across plants.",
      likelyRootCause:
        "Project governance model emphasizes cutover completion over post-go-live control ownership.",
      remediationSteps: [
        "Assign named owners and SLA windows by discrepancy severity.",
        "Add closure accountability to weekly PMO governance cadence.",
        "Publish unresolved finding burn-down by location.",
        "Escalate overdue high-severity items to program steering committee."
      ],
      recommendedOwner: "PMO Lead",
      estimatedEffort: "2-5 days"
    },
    {
      category: "Regression Cadence",
      summary:
        "Post-cutover regression checks are defined but not fully automated across all locations.",
      whyItMatters:
        "Manual regression cadence slows detection and increases inconsistency in issue discovery.",
      likelyRootCause:
        "Location-level teams adopted different test run frequencies and checklists.",
      remediationSteps: [
        "Standardize regression schedule by location tier and risk class.",
        "Automate top financial controls and alerting thresholds.",
        "Track missed regression windows in PMO dashboard.",
        "Quarterly review regression coverage against prior incidents."
      ],
      recommendedOwner: "QA Lead + Finance Systems Manager",
      estimatedEffort: "1 week"
    },
    {
      category: "Audit Trail",
      summary:
        "Discrepancy documentation format varies by location, reducing PMO-level visibility.",
      whyItMatters:
        "Inconsistent evidence quality weakens audit defensibility and cross-site learning.",
      likelyRootCause:
        "No unified discrepancy template and sign-off workflow across rollout teams.",
      remediationSteps: [
        "Define standard discrepancy template with mandatory impact fields.",
        "Enforce a single closure workflow with approver roles.",
        "Backfill documentation for open high-severity discrepancies.",
        "Sample audit packs monthly for control quality assurance."
      ],
      recommendedOwner: "Internal Controls Manager",
      estimatedEffort: "3-6 days"
    }
  ]
};

function pick<T>(items: T[], seed: number, count: number): T[] {
  const selected: T[] = [];

  for (let i = 0; i < count; i += 1) {
    selected.push(items[(seed + i) % items.length]);
  }

  return selected;
}

export function getCadenceProfile(cadence: ValidationCadence = "phase_gates"): CadenceProfile {
  return CADENCE_PROFILES[cadence];
}

export function calculateRiskPressure(input: DiagnosticInput): number {
  const normalizedPlants = Math.max(1, Math.min(input.plantCount, 250));
  const systemCount = Math.max(1, input.sourceSystems.length);
  const strictnessFactor = Math.max(0.6, Math.min(input.strictness ?? 1, 1.45));
  const cadenceMultiplier = getCadenceProfile(input.validationCadence ?? "phase_gates").multiplier;
  return (normalizedPlants * 1.4 + systemCount * 12) * strictnessFactor * cadenceMultiplier;
}

export function runDiagnostic(input: DiagnosticInput): DiagnosticFinding[] {
  const normalizedPlants = Math.max(1, Math.min(input.plantCount, 250));
  const systemCount = Math.max(1, input.sourceSystems.length);
  const pressureIndex = calculateRiskPressure(input);

  const highCount = pressureIndex > 120 ? 3 : pressureIndex > 70 ? 2 : 1;
  const mediumCount = pressureIndex > 140 ? 3 : 2;
  const lowCount = 2;

  const high = pick(FINDING_LIBRARY.high, systemCount + normalizedPlants, highCount).map((item) => ({
    severity: "high" as const,
    ...item
  }));
  const medium = pick(FINDING_LIBRARY.medium, normalizedPlants, mediumCount).map((item) => ({
    severity: "medium" as const,
    ...item
  }));
  const low = pick(FINDING_LIBRARY.low, systemCount, lowCount).map((item) => ({
    severity: "low" as const,
    ...item
  }));

  return [...high, ...medium, ...low];
}
