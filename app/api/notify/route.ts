import { NextResponse } from "next/server";
import { createTransport, type Transporter } from "nodemailer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface WaitlistPayload {
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

interface ChecklistPayload {
  type: "checklist";
  email: string;
}

type NotifyPayload = WaitlistPayload | ChecklistPayload;

let transporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass || !port) return null;

  transporter = createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass }
  });

  return transporter;
}

function isValidPayload(payload: unknown): payload is NotifyPayload {
  if (!payload || typeof payload !== "object") return false;

  const p = payload as Record<string, unknown>;

  if (typeof p.email !== "string" || !EMAIL_PATTERN.test(p.email)) return false;

  if (p.type === "checklist") return true;

  if (p.type === "waitlist") {
    if (typeof p.source !== "string" || p.source.length === 0) return false;
    if (p.plantCount !== undefined && typeof p.plantCount !== "number") return false;
    if (p.companySize !== undefined && typeof p.companySize !== "string") return false;
    if (p.migrationTimeline !== undefined && typeof p.migrationTimeline !== "string") return false;
    return true;
  }

  return false;
}

function esc(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

const cellStyle = 'style="padding:8px 12px;border-bottom:1px solid #e5e5e5;"';
const labelStyle = 'style="padding:8px 12px;border-bottom:1px solid #e5e5e5;font-weight:bold;width:40%;"';

function row(label: string, value: string): string {
  return `<tr><td ${labelStyle}>${label}</td><td ${cellStyle}>${esc(value)}</td></tr>`;
}

function buildWaitlistHtml(p: WaitlistPayload): string {
  const rows = [row("Email", p.email), row("Source", p.source)];

  if (p.plantCount !== undefined) rows.push(row("Plant Count", String(p.plantCount)));
  if (p.companySize) rows.push(row("Company Size", p.companySize));
  if (p.migrationTimeline) rows.push(row("Migration Timeline", p.migrationTimeline));

  if (p.scenarioSnapshot) {
    const s = p.scenarioSnapshot;
    rows.push(
      row("Scenario — Plants", String(s.plantCount)),
      row("Scenario — Source Systems", s.sourceSystems.join(", ")),
      row("Scenario — Cadence", s.validationCadence),
      row("Scenario — Readiness", `${s.readinessScore}/100`),
      row("Scenario — High-Severity Findings", String(s.highSeverityFindings)),
      row("Scenario — Projected Annual Value", `$${s.projectedAnnualValue.toLocaleString()}`)
    );
  }

  return `
<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:600px;margin:0 auto;">
  <h2 style="color:#1a1a1a;border-bottom:2px solid #005E66;padding-bottom:8px;">New Waitlist Submission</h2>
  <p style="color:#555;font-size:14px;">Submitted at ${new Date().toISOString()}</p>
  <table style="width:100%;border-collapse:collapse;">${rows.join("")}</table>
</div>`;
}

function buildChecklistHtml(p: ChecklistPayload): string {
  return `
<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:600px;margin:0 auto;">
  <h2 style="color:#1a1a1a;border-bottom:2px solid #E84E1B;padding-bottom:8px;">Checklist Unlocked</h2>
  <p style="color:#555;font-size:14px;">Submitted at ${new Date().toISOString()}</p>
  <table style="width:100%;border-collapse:collapse;">${row("Email", p.email)}</table>
  <p style="color:#777;font-size:13px;margin-top:16px;">This visitor unlocked the 27-point ERP Migration Validation Checklist.</p>
</div>`;
}

export async function POST(request: Request) {
  let payload: NotifyPayload;

  try {
    const json = (await request.json()) as unknown;

    if (!isValidPayload(json)) {
      return NextResponse.json({ error: "Invalid notification payload." }, { status: 400 });
    }

    payload = json;
  } catch {
    return NextResponse.json({ error: "Could not parse request body." }, { status: 400 });
  }

  const mailer = getTransporter();

  if (!mailer) {
    console.error("[notify] SMTP not configured.");
    return NextResponse.json({ error: "Mail service is not configured." }, { status: 503 });
  }

  const subject =
    payload.type === "waitlist"
      ? `[CloseLoop] Waitlist: ${payload.email}`
      : `[CloseLoop] Checklist Unlock: ${payload.email}`;

  const html =
    payload.type === "waitlist" ? buildWaitlistHtml(payload) : buildChecklistHtml(payload);

  try {
    await mailer.sendMail({
      from: process.env.SMTP_USER,
      to: "hello@close-loop.app",
      subject,
      html
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[notify] Failed to send email:", err);
    return NextResponse.json({ error: "Failed to send notification." }, { status: 502 });
  }
}
