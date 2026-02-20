export type WaitlistSource =
  | "hero"
  | "sticky"
  | "diagnostic"
  | "midpage"
  | "footer"
  | "query_param";

export interface WaitlistScenarioSnapshot {
  plantCount: number;
  sourceSystems: string[];
  validationCadence: "phase_gates" | "parallel_plus_post" | "go_live_only";
  strictness: number;
  highSeverityFindings: number;
  readinessScore: number;
  projectedAnnualValue: number;
  projectedMonthlyValue: number;
}

export interface WaitlistEntry {
  email: string;
  source: WaitlistSource;
  submittedAt: string;
  reportedPlantCount?: number;
  companySize?: string;
  migrationTimeline?: string;
  scenarioSnapshot?: WaitlistScenarioSnapshot;
}

export const WAITLIST_STORAGE_KEY = "erp_migration_waitlist_v1";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_PATTERN.test(email.trim());
}

export function normalizeSource(input: string | null): WaitlistSource | null {
  if (!input) {
    return null;
  }

  const normalized = input.toLowerCase().trim();
  const validSources: WaitlistSource[] = [
    "hero",
    "sticky",
    "diagnostic",
    "midpage",
    "footer",
    "query_param"
  ];

  if (validSources.includes(normalized as WaitlistSource)) {
    return normalized as WaitlistSource;
  }

  return "query_param";
}

function readEntriesFromStorage(): WaitlistEntry[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(WAITLIST_STORAGE_KEY);

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(
      (item): item is WaitlistEntry =>
        typeof item?.email === "string" &&
        typeof item?.source === "string" &&
        typeof item?.submittedAt === "string"
    );
  } catch {
    return [];
  }
}

function writeEntriesToStorage(entries: WaitlistEntry[]): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    window.localStorage.setItem(WAITLIST_STORAGE_KEY, JSON.stringify(entries));
    return true;
  } catch {
    return false;
  }
}

export interface UpsertWaitlistResult {
  entry: WaitlistEntry;
  persisted: boolean;
  duplicateUpdated: boolean;
}

export interface WaitlistIntakeDetails {
  scenarioSnapshot?: WaitlistScenarioSnapshot;
  reportedPlantCount?: number;
  companySize?: string;
  migrationTimeline?: string;
}

export function upsertWaitlistEntry(
  email: string,
  source: WaitlistSource,
  details?: WaitlistIntakeDetails
): UpsertWaitlistResult {
  const entry: WaitlistEntry = {
    email: email.trim().toLowerCase(),
    source,
    submittedAt: new Date().toISOString(),
    reportedPlantCount: details?.reportedPlantCount,
    companySize: details?.companySize,
    migrationTimeline: details?.migrationTimeline,
    scenarioSnapshot: details?.scenarioSnapshot
  };

  const entries = readEntriesFromStorage();
  const existingIndex = entries.findIndex((item) => item.email === entry.email);
  const duplicateUpdated = existingIndex >= 0;

  if (existingIndex >= 0) {
    entries[existingIndex] = entry;
  } else {
    entries.push(entry);
  }

  const persisted = writeEntriesToStorage(entries);

  return {
    entry,
    persisted,
    duplicateUpdated
  };
}
