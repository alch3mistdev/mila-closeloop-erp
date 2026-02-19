import { DiagnosticFinding } from "./demoEngine";

export interface MappingSuggestion {
  sourceField: string;
  targetField: string;
  confidence: number;
  risk: "low" | "medium" | "high";
  rationale: string;
  reviewNote: string;
}

export interface PmoDraft {
  headline: string;
  summary: string;
  actions: string[];
}

const TOKEN_MAP: Record<string, string> = {
  acct: "account",
  account: "account",
  amt: "amount",
  amount: "amount",
  asset: "asset",
  cc: "costcenter",
  center: "costcenter",
  cost: "cost",
  cst: "cost",
  curr: "currency",
  currency: "currency",
  date: "date",
  dt: "date",
  gl: "account",
  id: "id",
  item: "material",
  location: "plant",
  loc: "plant",
  margin: "margin",
  material: "material",
  matl: "material",
  number: "id",
  num: "id",
  plant: "plant",
  plnt: "plant",
  qty: "quantity",
  quantity: "quantity",
  std: "standard",
  term: "term",
  terms: "term",
  ucost: "unitcost",
  unit: "unit",
  uom: "unit"
};

function normalizeToken(token: string): string {
  const lowered = token.toLowerCase().replace(/[^a-z0-9]/g, "");

  if (!lowered) {
    return "";
  }

  return TOKEN_MAP[lowered] ?? lowered;
}

function splitTokens(field: string): string[] {
  const expanded = field
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_\-.]/g, " ")
    .toLowerCase();

  return expanded
    .split(/\s+/)
    .map(normalizeToken)
    .filter(Boolean);
}

function tokenScore(sourceField: string, targetField: string): number {
  const sourceTokens = new Set(splitTokens(sourceField));
  const targetTokens = new Set(splitTokens(targetField));

  if (sourceTokens.size === 0 || targetTokens.size === 0) {
    return 0;
  }

  let intersection = 0;
  sourceTokens.forEach((token) => {
    if (targetTokens.has(token)) {
      intersection += 1;
    }
  });

  const union = new Set([...sourceTokens, ...targetTokens]).size;
  return intersection / union;
}

function orderedSimilarity(sourceField: string, targetField: string): number {
  const source = sourceField.toLowerCase().replace(/[^a-z0-9]/g, "");
  const target = targetField.toLowerCase().replace(/[^a-z0-9]/g, "");

  if (!source || !target) {
    return 0;
  }

  const limit = Math.min(source.length, target.length);
  let aligned = 0;

  for (let index = 0; index < limit; index += 1) {
    if (source[index] === target[index]) {
      aligned += 1;
    }
  }

  return aligned / limit;
}

function buildRationale(sourceField: string, targetField: string, confidence: number): string {
  const sourceTokens = splitTokens(sourceField);
  const targetTokens = splitTokens(targetField);
  const shared = sourceTokens.filter((token) => targetTokens.includes(token));

  if (shared.length > 0) {
    return `Matched semantic tokens: ${shared.join(", ")}. Confidence adjusted for naming and ordering similarity.`;
  }

  if (confidence < 70) {
    return "Low token overlap detected. Suggested by pattern proximity, but requires human validation.";
  }

  return "Suggested from field-shape similarity and naming conventions observed across ERP schemas.";
}

function buildReviewNote(confidence: number): string {
  if (confidence >= 86) {
    return "Low review risk";
  }

  if (confidence >= 70) {
    return "Controller sign-off recommended";
  }

  return "High risk: finance + data steward review required";
}

function toRisk(confidence: number): "low" | "medium" | "high" {
  if (confidence >= 86) {
    return "low";
  }

  if (confidence >= 70) {
    return "medium";
  }

  return "high";
}

export function parseSourceFields(input: string): string[] {
  return input
    .split(/[\n,;]+/)
    .map((field) => field.trim())
    .filter(Boolean)
    .slice(0, 14);
}

export function suggestMappings(sourceFields: string[], targetFields: string[]): MappingSuggestion[] {
  const usedTargets = new Set<string>();

  return sourceFields.map((sourceField) => {
    let bestTarget = targetFields[0];
    let bestScore = -1;

    targetFields.forEach((targetField) => {
      const score = tokenScore(sourceField, targetField) * 0.7 + orderedSimilarity(sourceField, targetField) * 0.3;

      if (score > bestScore) {
        bestScore = score;
        bestTarget = targetField;
      }
    });

    let confidence = Math.round(Math.max(48, Math.min(97, 44 + bestScore * 62)));

    if (usedTargets.has(bestTarget)) {
      confidence = Math.max(52, confidence - 8);
    } else {
      usedTargets.add(bestTarget);
    }

    return {
      sourceField,
      targetField: bestTarget,
      confidence,
      risk: toRisk(confidence),
      rationale: buildRationale(sourceField, bestTarget, confidence),
      reviewNote: buildReviewNote(confidence)
    };
  });
}

export function buildPmoDraft(
  mappings: MappingSuggestion[],
  findings: DiagnosticFinding[],
  reviewThreshold: number
): PmoDraft {
  const highRiskMappings = mappings.filter((mapping) => mapping.confidence < reviewThreshold).length;
  const highSeverityFindings = findings.filter((finding) => finding.severity === "high").length;
  const firstFinding = findings[0];

  const actions: string[] = [
    `Escalate ${highRiskMappings} low-confidence mapping(s) for controller sign-off before cutover.`,
    `Run focused remediation sprint for ${highSeverityFindings} high-severity discrepancy cluster(s).`,
    `Attach evidence package for ${firstFinding ? firstFinding.category : "schema mapping"} to next PMO checkpoint.`
  ];

  return {
    headline: "AI-generated PMO checkpoint draft",
    summary:
      "Copilot analysis indicates unresolved mapping ambiguity and discrepancy pressure that should be closed before migration sign-off.",
    actions
  };
}
