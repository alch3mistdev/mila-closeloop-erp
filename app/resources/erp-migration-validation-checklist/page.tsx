"use client";

import { FormEvent, useEffect, useState } from "react";
import { isValidEmail } from "../../../lib/waitlist";
import { trackEvent } from "../../../lib/analytics";
import { sendNotification } from "../../../lib/notify";

const CHECKLIST_UNLOCK_KEY = "cl_checklist_unlocked";

const CHECKLIST_SECTIONS = [
  {
    title: "Scope and Source Integrity",
    items: [
      "Confirm source-system inventory by plant and legal entity.",
      "Verify each in-scope source field has a target mapping decision.",
      "Identify unmapped fields with financial materiality tags.",
      "Validate snapshot timestamp alignment across source and target extracts.",
      "Document excluded records and explicit business rationale."
    ]
  },
  {
    title: "Schema and Mapping Quality",
    items: [
      "Check data-type compatibility for each mapped field.",
      "Flag one-to-many or many-to-one mappings for controller review.",
      "Compare null-handling logic between legacy and SAP target.",
      "Validate currency and unit-of-measure conversion rules.",
      "Queue low-confidence mappings for dual sign-off (data + finance)."
    ]
  },
  {
    title: "Data Completeness and Reconciliation",
    items: [
      "Run record-count reconciliation by object class and location.",
      "Reconcile assets, vendors, and materials between source and target.",
      "Confirm no duplicate key collisions were introduced in migration.",
      "Validate opening balances against approved cutover baseline.",
      "Track exception inventory with named owners and due dates."
    ]
  },
  {
    title: "Cross-Plant Comparability",
    items: [
      "Compare cost allocation logic across plants for the same metric.",
      "Test margin comparability by product family and time window.",
      "Identify structurally divergent calculation conventions.",
      "Validate chart-of-accounts normalization across acquired entities.",
      "Escalate methodology mismatches before executive rollup."
    ]
  },
  {
    title: "Controls, Audit, and Post-Go-Live Readiness",
    items: [
      "Capture timestamped evidence for each validation run.",
      "Require controller acknowledgment on unresolved high-severity findings.",
      "Define remediation playbook steps per discrepancy category.",
      "Schedule regression cadence for post-go-live controls.",
      "Publish PMO dashboard with pass rates and open severity mix.",
      "Confirm SSO/RBAC policy and least-privilege access model.",
      "Mask or hash any identifiable fields before ingestion where required."
    ]
  }
];

function readUnlockState(): boolean {
  try {
    return window.localStorage.getItem(CHECKLIST_UNLOCK_KEY) !== null;
  } catch {
    return false;
  }
}

function writeUnlockState(email: string): void {
  try {
    window.localStorage.setItem(CHECKLIST_UNLOCK_KEY, JSON.stringify({ email, unlockedAt: new Date().toISOString() }));
  } catch {
    // storage unavailable — content still unlocks for this session
  }
}

export default function ValidationChecklistPage() {
  const [unlocked, setUnlocked] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (readUnlockState()) {
      setUnlocked(true);
    }

    trackEvent("checklist_view");
  }, []);

  function handleUnlock(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = email.trim();

    if (!isValidEmail(trimmed)) {
      setError("Enter a valid work email to continue.");
      return;
    }

    writeUnlockState(trimmed);
    sendNotification({ type: "checklist", email: trimmed });
    trackEvent("checklist_unlock", { email: trimmed });
    setUnlocked(true);
    setError("");
  }

  return (
    <main className="site-shell">
      <section className="section legal-page checklist-page">
        <p className="eyebrow">Resource</p>
        <h1>ERP Migration Validation Checklist: 27 Things Your SI Won&apos;t Catch</h1>
        <p>
          Built for design-partner teams managing heterogeneous-to-SAP migrations where cross-plant
          comparability and post-go-live integrity are business-critical.
        </p>
        <div className="checklist-content-wrapper">
          <div className={unlocked ? "checklist-grid" : "checklist-grid checklist-blurred"}>
            {CHECKLIST_SECTIONS.map((section) => (
              <article key={section.title} className="checklist-card">
                <h2>{section.title}</h2>
                <ol>
                  {section.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ol>
              </article>
            ))}
          </div>
          {!unlocked && (
            <div className="checklist-gate">
              <div className="checklist-gate-card">
                <h2>Unlock the full 27-point checklist</h2>
                <p>Enter your work email to access every validation check — no cost, no commitment.</p>
                <form onSubmit={handleUnlock}>
                  <div className="form-row">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      autoComplete="email"
                      required
                    />
                    <button type="submit" className="btn btn-primary">Unlock Checklist</button>
                  </div>
                  {error && <p className="error">{error}</p>}
                </form>
                <p className="gate-note">We&apos;ll send design partner updates. No spam.</p>
              </div>
            </div>
          )}
        </div>
        {unlocked && (
          <p className="support-copy">
            Want this run against your environment?{" "}
            <a href="/#final-waitlist">Return to the homepage and request a migration diagnostic.</a>
          </p>
        )}
      </section>
    </main>
  );
}
