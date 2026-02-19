"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  WaitlistSource,
  isValidEmail,
  upsertWaitlistEntry
} from "../../lib/waitlist";

interface WaitlistInlineFormProps {
  source: WaitlistSource;
  formTitle?: string;
  buttonLabel?: string;
  compact?: boolean;
}

interface SubmissionState {
  type: "idle" | "error" | "success";
  message: string;
  nonPersistent?: boolean;
}

export function WaitlistInlineForm({
  source,
  formTitle = "Join the design partner waitlist",
  buttonLabel = "Join waitlist",
  compact = false
}: WaitlistInlineFormProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<SubmissionState>({ type: "idle", message: "" });

  const formId = useMemo(
    () => `waitlist-${source}-${compact ? "compact" : "full"}`,
    [compact, source]
  );

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

    const result = upsertWaitlistEntry(trimmedEmail, source);

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
          required
        />
        <button type="submit" className="btn btn-primary">
          {buttonLabel}
        </button>
      </div>
      <p className="meta-line">Source tag: {source.replace("_", " ")}</p>
      <div className="form-status" aria-live="polite">
        {status.type !== "idle" ? <p className={status.type}>{status.message}</p> : null}
        {status.nonPersistent ? (
          <p className="warning">
            Browser storage is unavailable, so this device did not persist your entry. Your waitlist
            confirmation still went through in this demo flow.
          </p>
        ) : null}
      </div>
    </form>
  );
}
