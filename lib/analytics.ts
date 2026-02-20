const SESSION_CAMPAIGN_KEY = "cl_campaign";
const SESSION_EVENTS_KEY = "cl_events";
const MAX_EVENTS = 200;

const UTM_PARAMS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const;

export interface CampaignContext {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
}

export interface TrackedEvent {
  event: string;
  properties?: Record<string, unknown>;
  timestamp: string;
  page: string;
  campaign: CampaignContext;
}

function readSession<T>(key: string): T | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.sessionStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function writeSession(key: string, value: unknown): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage full or unavailable — silently ignore
  }
}

export function parseCampaignParams(): CampaignContext {
  if (typeof window === "undefined") {
    return {};
  }

  const params = new URLSearchParams(window.location.search);
  const campaign: CampaignContext = {};

  for (const key of UTM_PARAMS) {
    const value = params.get(key);

    if (value) {
      campaign[key] = value.trim();
    }
  }

  return campaign;
}

export function initCampaign(): CampaignContext {
  const incoming = parseCampaignParams();
  const hasUtm = Object.keys(incoming).length > 0;

  if (hasUtm) {
    writeSession(SESSION_CAMPAIGN_KEY, incoming);
    return incoming;
  }

  return readSession<CampaignContext>(SESSION_CAMPAIGN_KEY) ?? {};
}

export function getCampaign(): CampaignContext {
  return readSession<CampaignContext>(SESSION_CAMPAIGN_KEY) ?? {};
}

export function trackEvent(event: string, properties?: Record<string, unknown>): void {
  const campaign = getCampaign();
  const entry: TrackedEvent = {
    event,
    properties,
    timestamp: new Date().toISOString(),
    page: typeof window !== "undefined" ? window.location.pathname : "",
    campaign
  };

  if (process.env.NODE_ENV === "development") {
    console.debug("[analytics]", entry.event, entry.properties ?? "", entry.campaign);
  }

  const events = readSession<TrackedEvent[]>(SESSION_EVENTS_KEY) ?? [];
  events.push(entry);

  if (events.length > MAX_EVENTS) {
    events.splice(0, events.length - MAX_EVENTS);
  }

  writeSession(SESSION_EVENTS_KEY, events);
}

export function getSessionEvents(): TrackedEvent[] {
  return readSession<TrackedEvent[]>(SESSION_EVENTS_KEY) ?? [];
}
