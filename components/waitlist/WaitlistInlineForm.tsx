"use client";

import { FormEvent, useEffect, useId, useState } from "react";
import {
  WaitlistScenarioSnapshot,
  WaitlistSource,
  isValidEmail,
  upsertWaitlistEntry
} from "../../lib/waitlist";
import { trackEvent } from "../../lib/analytics";
import { sendNotification } from "../../lib/notify";

interface WaitlistInlineFormProps {
  source: WaitlistSource;
  scenarioSnapshot?: WaitlistScenarioSnapshot;
  formTitle?: string;
  buttonLabel?: string;
  compact?: boolean;
  autoFocusEmail?: boolean;
}

interface SubmissionState {
  type: "idle" | "error" | "success";
  message: string;
  nonPersistent?: boolean;
}

export function WaitlistInlineForm({
  source,
  scenarioSnapshot,
  formTitle = "Join the design partner waitlist",
  buttonLabel = "Join waitlist",
  compact = false,
  autoFocusEmail = false
}: WaitlistInlineFormProps) {
  const [email, setEmail] = useState("");
  const [plantCount, setPlantCount] = useState(
    scenarioSnapshot ? String(scenarioSnapshot.plantCount) : ""
  );
  const [companySize, setCompanySize] = useState("");
  const [migrationTimeline, setMigrationTimeline] = useState("");
  const [status, setStatus] = useState<SubmissionState>({ type: "idle", message: "" });
  const generatedId = useId();
  const formId = `waitlist-${source}-${compact ? "compact" : "full"}-${generatedId}`;
  const plantCountId = `${formId}-plants`;
  const companySizeId = `${formId}-company-size`;
  const timelineId = `${formId}-timeline`;

  useEffect(() => {
    setPlantCount(scenarioSnapshot ? String(scenarioSnapshot.plantCount) : "");
    setCompanySize("");
    setMigrationTimeline("");
  }, [scenarioSnapshot, source]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedEmail = email.trim();
    const trimmedPlantCount = plantCount.trim();

    if (!isValidEmail(trimmedEmail)) {
      setStatus({
        type: "error",
        message: "Enter a valid work email to continue."
      });
      return;
    }

    let normalizedPlantCount: number | undefined;

    if (trimmedPlantCount) {
      const parsed = Number(trimmedPlantCount);

      if (!Number.isInteger(parsed) || parsed < 1 || parsed > 5000) {
        setStatus({
          type: "error",
          message: "Plant count must be a whole number between 1 and 5000."
        });
        return;
      }

      normalizedPlantCount = parsed;
    }

    const result = upsertWaitlistEntry(trimmedEmail, source, {
      scenarioSnapshot,
      reportedPlantCount: normalizedPlantCount,
      companySize: companySize || undefined,
      migrationTimeline: migrationTimeline || undefined
    });

    sendNotification({
      type: "waitlist",
      email: trimmedEmail,
      source,
      plantCount: normalizedPlantCount,
      companySize: companySize || undefined,
      migrationTimeline: migrationTimeline || undefined,
      scenarioSnapshot
    });

    trackEvent("waitlist_submit", { source, duplicate: result.duplicateUpdated });

    setStatus({
      type: "success",
      message: result.duplicateUpdated
        ? "You were already on the waitlist. We refreshed your source tag and timestamp."
        : "You are in. We will send design partner cohort updates and next-step diagnostic details.",
      nonPersistent: !result.persisted
    });

    setEmail("");
  }

  if (status.type === "success") {
    return (
      <div className={`waitlist-form waitlist-confirmation${compact ? " compact" : ""}`} role="status" aria-live="polite">
        <div className="confirmation-icon" aria-hidden="true">&#10003;</div>
        <h3 className="confirmation-heading">You&apos;re on the list</h3>
        <p className="confirmation-message">{status.message}</p>
        {status.nonPersistent ? (
          <p className="warning">
            Browser storage is unavailable, so this device could not retain your submission locally.
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <form className={`waitlist-form${compact ? " compact" : ""}`} onSubmit={handleSubmit}>
      <div className="form-head">
        <p className="eyebrow small">Waitlist intake</p>
        <h3>{formTitle}</h3>
      </div>
      <label htmlFor={formId}>Work email</label>
      <div className="form-row">
        <input
          id={formId}
          name="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="name@company.com"
          autoComplete="email"
          autoFocus={autoFocusEmail}
          required
        />
        <button type="submit" className="btn btn-primary">
          {buttonLabel}
        </button>
      </div>
      <p className="meta-line">Source tag: {source.replace("_", " ")}</p>
      {scenarioSnapshot ? (
        <p className="meta-line">
          Scenario attached: {scenarioSnapshot.plantCount} plants | {scenarioSnapshot.sourceSystems.length} systems
          | readiness {scenarioSnapshot.readinessScore}/100
        </p>
      ) : null}
      <label htmlFor={plantCountId}>How many plants are in your migration? (Optional)</label>
      <input
        id={plantCountId}
        name="plantCount"
        type="number"
        min={1}
        max={5000}
        value={plantCount}
        onChange={(event) => setPlantCount(event.target.value)}
        placeholder="e.g. 24"
        inputMode="numeric"
      />
      <label htmlFor={companySizeId}>Company size (Optional)</label>
      <select
        id={companySizeId}
        name="companySize"
        value={companySize}
        onChange={(event) => setCompanySize(event.target.value)}
      >
        <option value="">Select size</option>
        <option value="1000-4999">1,000-4,999 employees</option>
        <option value="5000-9999">5,000-9,999 employees</option>
        <option value="10000-plus">10,000+ employees</option>
      </select>
      <label htmlFor={timelineId}>Migration timeline (Optional)</label>
      <select
        id={timelineId}
        name="migrationTimeline"
        value={migrationTimeline}
        onChange={(event) => setMigrationTimeline(event.target.value)}
      >
        <option value="">Select timeline</option>
        <option value="active-now">Active S/4 program now</option>
        <option value="0-6-months">Starting in 0-6 months</option>
        <option value="6-18-months">Starting in 6-18 months</option>
        <option value="exploratory">Exploring / assessing</option>
      </select>
      <div className="form-status" aria-live="polite">
        {status.type === "error" ? <p className="error">{status.message}</p> : null}
      </div>
    </form>
  );
}
