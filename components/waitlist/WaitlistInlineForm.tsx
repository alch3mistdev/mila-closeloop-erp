"use client";

import { FormEvent, useId, useState } from "react";
import {
  WaitlistScenarioSnapshot,
  WaitlistSource,
  isValidEmail,
  upsertWaitlistEntry
} from "../../lib/waitlist";

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
  const [status, setStatus] = useState<SubmissionState>({ type: "idle", message: "" });
  const generatedId = useId();
  const formId = `waitlist-${source}-${compact ? "compact" : "full"}-${generatedId}`;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedEmail = email.trim();

    if (!isValidEmail(trimmedEmail)) {
      setStatus({
        type: "error",
        message: "Enter a valid work email to continue."
      });
      return;
    }

    const result = upsertWaitlistEntry(trimmedEmail, source, scenarioSnapshot);

    setStatus({
      type: "success",
      message: result.duplicateUpdated
        ? "You were already on the waitlist. We refreshed your source tag and timestamp."
        : "You are in. We will send design partner cohort updates and next-step diagnostic details.",
      nonPersistent: !result.persisted
    });

    setEmail("");
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
      <div className="form-status" aria-live="polite">
        {status.type !== "idle" ? <p className={status.type}>{status.message}</p> : null}
        {status.nonPersistent ? (
          <p className="warning">
            Browser storage is unavailable, so this device could not retain your demo submission locally.
          </p>
        ) : null}
      </div>
    </form>
  );
}
