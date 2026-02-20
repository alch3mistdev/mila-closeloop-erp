# Mila ERP — Migration Integrity Platform

A B2B SaaS marketing site for **CloseLoop**, an ERP Migration Validation Engine. The platform targets plant controllers, finance leads, and migration PMs at large manufacturers undergoing ERP consolidation — especially heterogeneous-source-to-SAP S/4HANA migrations.

## What It Does

CloseLoop is a "connect → diagnose → remediate" platform that:

- Connects to source and target ERP environments
- Runs automated schema comparison, data completeness, and cross-plant consistency checks
- Generates prioritized discrepancy reports with step-by-step remediation guidance
- Tracks resolution status across locations

The real pain it addresses: **heterogeneous-source-to-SAP migration**, where acquired companies run different ERPs, schemas, and calculation methodologies — a gap SAP's own tools don't solve well.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **UI:** React 19, TypeScript
- **Deployment:** Static/SSR via Next.js

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm

### Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run typecheck` | Run TypeScript check |

## Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── page.tsx            # Home page
│   ├── terms/              # Terms of service
│   ├── privacy/            # Privacy policy
│   └── resources/          # Gated resources (e.g. checklist)
├── components/             # React components
│   ├── sections/           # Page sections (Hero, HowItWorks, etc.)
│   ├── waitlist/           # Waitlist / lead capture
│   └── brand/              # Brand assets
├── lib/                    # Utilities & integrations
│   ├── aiCopilot.ts        # AI copilot demo
│   ├── content.ts          # Site content
│   └── waitlist.ts         # Waitlist API
├── linkedin-ads/           # LinkedIn ad campaign assets
│   ├── CAMPAIGN-BRIEF.md   # Campaign strategy & specs
│   └── ad-01..ad-07/       # Ad creatives (SVG) + copy
└── public/                 # Static assets
```

## Resources

- **[ERP Migration Validation Checklist](/resources/erp-migration-validation-checklist)** — Gated lead magnet (27 things your SI won't catch)
- **LinkedIn Ads** — 7 ad variants for design partner acquisition; see `linkedin-ads/CAMPAIGN-BRIEF.md`

## Environment

Copy `.env.example` to `.env.local` and configure any required keys (e.g. for AI copilot, waitlist, analytics).

## License

Private. All rights reserved.
