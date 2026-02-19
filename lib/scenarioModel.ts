import { ValidationCadence } from "./demoEngine";

export const SCENARIO_SOURCE_OPTIONS = [
  "SAP ECC",
  "Oracle",
  "Microsoft Dynamics",
  "AS/400",
  "Custom SQL",
  "Spreadsheets"
] as const;

export interface SharedScenario {
  sourceSystems: string[];
  plantCount: number;
  strictness: number;
  validationCadence: ValidationCadence;
  controllerRate: number;
  monthlyManualHours: number;
  defectDelayMonths: number;
}

export interface SavingsModel {
  annualManualCost: number;
  automatedCost: number;
  laborSavings: number;
  lateDefectExposure: number;
  riskAvoidanceValue: number;
  totalSavings: number;
  monthlySavings: number;
  manualShare: number;
  validatedShare: number;
}

export const DEFAULT_SHARED_SCENARIO: SharedScenario = {
  sourceSystems: ["SAP ECC", "Oracle", "Spreadsheets"],
  plantCount: 24,
  strictness: 95,
  validationCadence: "phase_gates",
  controllerRate: 98,
  monthlyManualHours: 14,
  defectDelayMonths: 18
};

export function deriveSourceSystemsByCount(current: string[], targetCount: number): string[] {
  const boundedCount = Math.max(1, Math.min(targetCount, SCENARIO_SOURCE_OPTIONS.length));
  const dedupedCurrent = current.filter((item, index) => current.indexOf(item) === index);
  const base = dedupedCurrent.filter((item) => SCENARIO_SOURCE_OPTIONS.includes(item as (typeof SCENARIO_SOURCE_OPTIONS)[number]));

  if (base.length >= boundedCount) {
    return base.slice(0, boundedCount);
  }

  const missing = SCENARIO_SOURCE_OPTIONS.filter((option) => !base.includes(option)).slice(
    0,
    boundedCount - base.length
  );

  return [...base, ...missing];
}

export function calculateSavingsModel(scenario: SharedScenario): SavingsModel {
  const annualManualHours = scenario.plantCount * scenario.monthlyManualHours * 12;
  const annualManualCost = annualManualHours * scenario.controllerRate;
  const automatedHours = annualManualHours * 0.38;
  const automatedCost = automatedHours * scenario.controllerRate;
  const laborSavings = Math.max(0, annualManualCost - automatedCost);

  const lateDefectExposure =
    scenario.plantCount * scenario.sourceSystems.length * scenario.defectDelayMonths * 1150;
  const riskAvoidanceValue = lateDefectExposure * 0.42;
  const totalSavings = laborSavings + riskAvoidanceValue;
  const monthlySavings = totalSavings / 12;
  const denominator = annualManualCost + riskAvoidanceValue || 1;
  const manualShare = (annualManualCost / denominator) * 100;
  const validatedShare = (automatedCost / denominator) * 100;

  return {
    annualManualCost,
    automatedCost,
    laborSavings,
    lateDefectExposure,
    riskAvoidanceValue,
    totalSavings,
    monthlySavings,
    manualShare,
    validatedShare
  };
}
