import { NextResponse } from "next/server";
import {
  CopilotNarrative,
  CopilotRequestPayload,
  CopilotResponsePayload,
  buildFallbackNarrative
} from "../../../../lib/aiCopilot";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const DEFAULT_MODEL = process.env.OPENAI_MODEL ?? "gpt-4.1-mini";
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 18;

interface RateBucket {
  count: number;
  resetAt: number;
}

const rateBuckets = new Map<string, RateBucket>();

function stripCodeFences(text: string): string {
  return text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
}

function parseNarrativeResponse(raw: string, fallback: CopilotNarrative): CopilotNarrative {
  try {
    const parsed = JSON.parse(stripCodeFences(raw)) as Partial<CopilotNarrative>;
    const persuasivePoints = Array.isArray(parsed.persuasivePoints)
      ? parsed.persuasivePoints.filter((point): point is string => typeof point === "string").slice(0, 4)
      : [];

    if (
      typeof parsed.headline !== "string" ||
      typeof parsed.executiveSummary !== "string" ||
      typeof parsed.objectionHandling !== "string" ||
      typeof parsed.cta !== "string" ||
      typeof parsed.subjectLine !== "string" ||
      persuasivePoints.length < 2
    ) {
      return fallback;
    }

    return {
      headline: parsed.headline,
      executiveSummary: parsed.executiveSummary,
      persuasivePoints,
      objectionHandling: parsed.objectionHandling,
      cta: parsed.cta,
      subjectLine: parsed.subjectLine
    };
  } catch {
    return fallback;
  }
}

function normalizeRequestPayload(payload: CopilotRequestPayload): CopilotRequestPayload {
  return {
    audience: payload.audience,
    reviewThreshold: payload.reviewThreshold,
    suggestions: payload.suggestions.slice(0, 14),
    findings: payload.findings.slice(0, 8),
    scenario: {
      ...payload.scenario,
      sourceSystems: payload.scenario.sourceSystems.slice(0, 10)
    }
  };
}

function isValidPayload(payload: unknown): payload is CopilotRequestPayload {
  if (!payload || typeof payload !== "object") {
    return false;
  }

  const candidate = payload as Partial<CopilotRequestPayload>;

  if (!["CFO", "PMO", "Plant Controller"].includes(candidate.audience ?? "")) {
    return false;
  }

  if (typeof candidate.reviewThreshold !== "number") {
    return false;
  }

  if (!Array.isArray(candidate.suggestions) || !Array.isArray(candidate.findings)) {
    return false;
  }

  if (!candidate.scenario || typeof candidate.scenario !== "object") {
    return false;
  }

  const scenario = candidate.scenario as Partial<CopilotRequestPayload["scenario"]>;

  if (
    typeof scenario.plantCount !== "number" ||
    !Array.isArray(scenario.sourceSystems) ||
    typeof scenario.strictness !== "number" ||
    typeof scenario.readinessScore !== "number" ||
    typeof scenario.projectedAnnualValue !== "number" ||
    typeof scenario.projectedMonthlyValue !== "number"
  ) {
    return false;
  }

  if (scenario.sourceSystems.some((item) => typeof item !== "string")) {
    return false;
  }

  if (!["phase_gates", "parallel_plus_post", "go_live_only"].includes(scenario.validationCadence ?? "")) {
    return false;
  }

  return true;
}

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");

  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }

  const realIp = request.headers.get("x-real-ip");
  return realIp?.trim() || "unknown";
}

function checkRateLimit(ip: string): { allowed: boolean; retryAfterSeconds: number } {
  const now = Date.now();

  for (const [key, bucket] of rateBuckets.entries()) {
    if (bucket.resetAt <= now) {
      rateBuckets.delete(key);
    }
  }

  const current = rateBuckets.get(ip);

  if (!current || current.resetAt <= now) {
    rateBuckets.set(ip, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS
    });

    return {
      allowed: true,
      retryAfterSeconds: Math.ceil(RATE_LIMIT_WINDOW_MS / 1000)
    };
  }

  if (current.count >= RATE_LIMIT_MAX) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000))
    };
  }

  current.count += 1;
  rateBuckets.set(ip, current);

  return {
    allowed: true,
    retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000))
  };
}

function buildUserPrompt(payload: CopilotRequestPayload): string {
  return [
    "Generate persuasive B2B migration messaging as JSON only.",
    "Context:",
    JSON.stringify(
      {
        audience: payload.audience,
        reviewThreshold: payload.reviewThreshold,
        scenario: payload.scenario,
        flaggedMappings: payload.suggestions.filter(
          (suggestion) => suggestion.confidence < payload.reviewThreshold
        ).length,
        topMappings: payload.suggestions.slice(0, 8),
        topFindings: payload.findings.slice(0, 5)
      },
      null,
      2
    ),
    "Return strict JSON with keys:",
    'headline, executiveSummary, persuasivePoints (3 bullets), objectionHandling, cta, subjectLine.',
    "No markdown. No extra keys."
  ].join("\n");
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const rateLimit = checkRateLimit(ip);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        warning: "Rate limit reached for AI generation. Please retry shortly."
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(rateLimit.retryAfterSeconds)
        }
      }
    );
  }

  let payload: CopilotRequestPayload;

  try {
    const json = (await request.json()) as unknown;

    if (!isValidPayload(json)) {
      return NextResponse.json(
        { warning: "Invalid copilot payload." },
        { status: 400 }
      );
    }

    payload = normalizeRequestPayload(json);
  } catch {
    return NextResponse.json(
      { warning: "Could not parse request payload." },
      { status: 400 }
    );
  }

  const fallbackNarrative = buildFallbackNarrative(payload);
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    const fallbackResponse: CopilotResponsePayload = {
      mode: "fallback",
      narrative: fallbackNarrative,
      warning: "OPENAI_API_KEY is not configured. Showing fallback narrative."
    };

    return NextResponse.json(fallbackResponse);
  }

  try {
    const systemPrompt = [
      "You are an enterprise ERP migration GTM copy strategist.",
      "Write concise, credible, persuasive messaging for senior finance and PMO audiences.",
      "No hype. No fake customer claims. No fabricated metrics.",
      "Output JSON only."
    ].join(" ");

    const completionResponse = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        temperature: 0.55,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: buildUserPrompt(payload)
          }
        ]
      })
    });

    if (!completionResponse.ok) {
      const fallbackResponse: CopilotResponsePayload = {
        mode: "fallback",
        narrative: fallbackNarrative,
        warning: `OpenAI request failed (${completionResponse.status}). Showing fallback narrative.`
      };

      return NextResponse.json(fallbackResponse);
    }

    const completionJson = (await completionResponse.json()) as {
      choices?: Array<{
        message?: {
          content?: string | Array<{ text?: string; type?: string }>;
        };
      }>;
    };

    const content = completionJson.choices?.[0]?.message?.content;
    const text =
      typeof content === "string"
        ? content
        : Array.isArray(content)
          ? content
              .map((item) => (typeof item?.text === "string" ? item.text : ""))
              .join("\n")
              .trim()
          : "";

    const parsedNarrative = text ? parseNarrativeResponse(text, fallbackNarrative) : fallbackNarrative;

    const liveResponse: CopilotResponsePayload = {
      mode: "live",
      model: DEFAULT_MODEL,
      narrative: parsedNarrative
    };

    return NextResponse.json(liveResponse);
  } catch {
    const fallbackResponse: CopilotResponsePayload = {
      mode: "fallback",
      narrative: fallbackNarrative,
      warning: "OpenAI request errored. Showing fallback narrative."
    };

    return NextResponse.json(fallbackResponse);
  }
}
