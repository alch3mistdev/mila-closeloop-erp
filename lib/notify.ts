export interface WaitlistNotifyData {
  type: "waitlist";
  email: string;
  source: string;
  plantCount?: number;
  companySize?: string;
  migrationTimeline?: string;
  scenarioSnapshot?: {
    plantCount: number;
    sourceSystems: string[];
    validationCadence: string;
    strictness: number;
    highSeverityFindings: number;
    readinessScore: number;
    projectedAnnualValue: number;
    projectedMonthlyValue: number;
  };
}

export interface ChecklistNotifyData {
  type: "checklist";
  email: string;
}

export type NotifyData = WaitlistNotifyData | ChecklistNotifyData;

export function sendNotification(data: NotifyData): void {
  try {
    fetch("/api/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    }).catch(() => {});
  } catch {
    // fire and forget
  }
}
