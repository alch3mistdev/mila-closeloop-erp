export interface PainCard {
  eyebrow: string;
  title: string;
  body: string;
}

export interface Pillar {
  title: string;
  description: string;
  before: string;
  after: string;
}

export interface StoryInsight {
  title: string;
  summary: string;
}

export const painCards: PainCard[] = [
  {
    eyebrow: "Contrarian Truth",
    title: "SAP's migration tooling does not solve heterogeneous-source validation",
    body:
      "The hardest risk is not SAP-to-SAP movement. It is the Oracle instance from one acquisition, the custom plant system from another, and spreadsheet logic still running reporting in parallel."
  },
  {
    eyebrow: "Board-Level Risk",
    title: "Your consolidated report can be mathematically wrong while still looking clean",
    body:
      "If plants calculate cost and margin with different methodologies, your roll-up is an illusion of comparability."
  },
  {
    eyebrow: "Operational Scar Tissue",
    title: "Defects ignored at go-live become permanent operating behavior",
    body:
      "Teams normalize workarounds for years when nobody closes the validation loop after launch."
  },
  {
    eyebrow: "Deadline Pressure",
    title: "ECC end-of-life timelines compress decisions, not risk",
    body:
      "2027 urgency can force rushed cutovers. Validation discipline is what keeps urgency from turning into long-term defects."
  }
];

export const valuePillars: Pillar[] = [
  {
    title: "Cross-Plant Data Integrity",
    description:
      "Compare schema mappings, value ranges, and calculation conventions across all feeding systems before numbers hit executive reporting.",
    before:
      "Controllers manually reconcile incompatible structures across plants, leaning on tribal knowledge.",
    after:
      "Automated consistency checks expose methodology mismatches and produce confidence scoring for consolidated reporting."
  },
  {
    title: "Post-Migration Defect Prevention",
    description:
      "Validation at every gate catches defects during testing and parallel runs, when fixes are still cheap and auditable.",
    before:
      "Issues appear months or years later and harden into accepted workarounds.",
    after:
      "Prioritized discrepancy reports and remediation tracking keep critical defects visible until resolved."
  },
  {
    title: "Migration Project Visibility",
    description:
      "Give PMOs objective status by location and function instead of self-reported completion claims.",
    before:
      "Central teams cannot verify what has actually been validated across sites.",
    after:
      "A single dashboard shows pass rates, open severity, and location-level readiness trends."
  },
  {
    title: "Heterogeneous-Source Intelligence",
    description:
      "Use NLP-assisted field crosswalks for legacy systems where naming conventions and data structures diverge from SAP.",
    before:
      "Field-by-field mapping consumes weeks and often breaks under institutional knowledge gaps.",
    after:
      "Confidence-scored mapping suggestions reduce manual effort and isolate uncertain pairs for human review."
  }
];

export const credibilityPoints: string[] = [
  "Built for 50+ location migrations where plants carry distinct legacy systems and local calculation conventions.",
  "Designed around lessons from high-cost consolidation failures where closing validation was skipped.",
  "Purpose-built for heterogeneous-to-SAP environments, not SAP-to-SAP assumptions.",
  "Informed by direct conversations with plant controllers, finance leaders, and migration PM stakeholders."
];

export const storyInsights: StoryInsight[] = [
  {
    title: "Heterogeneous-source pain is still under-scoped",
    summary: "Most teams scope technical migration mechanics first and discover comparability risk too late."
  },
  {
    title: "The cost curve is nonlinear",
    summary: "A defect caught pre-go-live is a task. The same defect found years later is an organizational program."
  },
  {
    title: "PMO visibility gaps are systemic",
    summary: "Distributed ownership means status often reflects social reporting, not verified validation outcomes."
  }
];
