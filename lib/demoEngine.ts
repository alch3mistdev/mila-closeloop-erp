export interface DiagnosticInput {
  sourceSystems: string[];
  plantCount: number;
}

export interface DiagnosticFinding {
  severity: "high" | "medium" | "low";
  category: string;
  summary: string;
}

const FINDING_LIBRARY = {
  high: [
    {
      category: "Cross-Plant Methodology",
      summary:
        "Unit cost logic differs across plants, creating structurally incomparable operating margin figures."
    },
    {
      category: "Schema Mapping",
      summary:
        "Critical source fields have no target mapping in S/4HANA, increasing risk of silent data loss at consolidation."
    },
    {
      category: "Record Completeness",
      summary:
        "Asset and vendor snapshots show missing records between source and target extracts."
    }
  ],
  medium: [
    {
      category: "Value Range Drift",
      summary:
        "Inventory valuation ranges in one location are statistically outside expected distribution after migration."
    },
    {
      category: "Reference Data",
      summary:
        "Chart-of-accounts alignment is partially inconsistent across acquired entities and legacy systems."
    },
    {
      category: "Confidence Scoring",
      summary:
        "NLP-assisted field matches include low-confidence pairs that require controller sign-off."
    }
  ],
  low: [
    {
      category: "Governance",
      summary:
        "Validation ownership is not consistently assigned for post-go-live defect closure."
    },
    {
      category: "Regression Cadence",
      summary:
        "Post-cutover regression checks are defined but not fully automated across all locations."
    },
    {
      category: "Audit Trail",
      summary:
        "Discrepancy documentation format varies by location, reducing PMO-level visibility."
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

export function runDiagnostic(input: DiagnosticInput): DiagnosticFinding[] {
  const normalizedPlants = Math.max(1, Math.min(input.plantCount, 250));
  const systemCount = Math.max(1, input.sourceSystems.length);
  const pressureIndex = normalizedPlants * 1.4 + systemCount * 12;

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
