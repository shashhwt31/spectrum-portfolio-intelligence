# Spectrum — Portfolio Health & Diversification Intelligence

**A transparent portfolio-analytics experience for Indian investors.** Spectrum consolidates source-labelled holdings, diagnoses diversification quality, estimates fund overlap, and lets users test allocation changes before acting.

> [!IMPORTANT]
> This repository is a front-end product prototype with deterministic demo analytics. It does not connect to brokers, provide financial advice, use live market data, or place trades.

## Highlights

- Explainable **0–100 Portfolio Health Score** with component weights and confidence cues
- Unified holdings view across manual and local CSV imports, with source-labelled demo statement workflows
- Holdings management with source account attribution and local remove actions
- Fund-name autocomplete for curated, real scheme identifiers (for example, UTI Nifty schemes)
- Concentration, asset allocation, sector, geography, fund-overlap, fee, liquidity, and fixed-income diagnostics
- Portfolio-fit recommendation cards that explain the gap addressed and trade-offs
- Interactive what-if simulator for illustrative contribution scenarios
- Investor-context form that adjusts transparent analytical target allocations
- Device-local demo sign-in/profile flow with display name, optional email, goal, and clear-data sign-out
- Responsive, accessibility-conscious fintech UI with source freshness and provenance visible throughout
- Explicit provider status and a strict no-scraping/no-passwords/no-OTP policy

## Preview

Public static preview: **[shashhwt31.github.io/spectrum-portfolio-intelligence](https://shashhwt31.github.io/spectrum-portfolio-intelligence/)**

The GitHub Pages preview runs the client-side experience and stores manual entries/imports in that browser. The local Node API and its JSON development store are intentionally not deployed to GitHub Pages.

## Quick start

```bash
git clone https://github.com/<your-github-username>/spectrum-portfolio-intelligence.git
cd spectrum-portfolio-intelligence
npm test
npm run check
```

## Deployment

Pushing to `main` triggers `.github/workflows/deploy-pages.yml`, which publishes the static client to GitHub Pages. In GitHub, open **Settings → Pages** and select **GitHub Actions** as the build and deployment source if it is not already enabled. The first deployment appears at the public preview URL above after the workflow completes.

For the complete local development experience—including the local Node API—run `npm start` instead.

## Tech stack

Vanilla HTML, CSS, and modern ES modules on the client; a zero-dependency Node HTTP API with local development persistence on the server; and Node’s built-in test runner. This keeps the scoring logic inspectable while creating a clean API boundary for a future database and provider-adapter service.

## Architecture

```text
Browser UI (index.html + app.js)
        │
        ▼
Local Node API (server.mjs)
        │
        ├── Local development portfolio store
        ├── Audit-event trail
        └── Deterministic analytics (analytics.js)
```

| Area | Current implementation | Production direction |
| --- | --- | --- |
| Holdings | API-backed local development store + normalized demo records | PostgreSQL canonical model and database migrations |
| Imports | Local CSV parsing, manual entry, browser-local persistence | Reconciled, provider-specific CSV/PDF import parsers |
| Analytics | Deterministic client-side functions | Versioned service with source-data snapshots |
| Connections | Intentionally not connected | Approved OAuth/token adapters only, encrypted at rest |
| Recommendations | Explainable illustrative ideas | Compliance-reviewed portfolio-fit engine |

See [architecture notes](docs/ARCHITECTURE.md) and the [provider support matrix](docs/PROVIDER_SUPPORT.md).

## Portfolio Health formula

The score is a weighted, configurable analytical indicator—not opaque AI judgement or personalized advice.

| Component | Weight |
| --- | ---: |
| Asset allocation | 18% |
| Concentration | 15% |
| Diversification | 12% |
| Risk alignment | 10% |
| Correlation & look-through overlap | 10% |
| Sector allocation | 9% |
| Geographic allocation | 8% |
| Cost efficiency | 7% |
| Fixed-income quality | 6% |
| Liquidity | 5% |

Inputs missing, stale, estimated, or manually entered should lower confidence and be shown to the user. Details and current simplifications are in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Safety, data, and compliance boundaries

- No credentials, passwords, PINs, OTPs, TPINs, or trade authorizations are requested or stored.
- The deployed sign-in is a browser-local demo profile, not authentication. It must not be used for production access control.
- No provider website scraping or automated login is used.
- All provider rows accurately distinguish import/manual demo support from any future official integration.
- Portfolio outputs are educational analytics. They should not be treated as a buy, sell, hold, or suitability recommendation.
- Any production build needs licensed market/fund-holdings data, legal review, security controls, and jurisdiction-specific compliance review.

### Fund search catalogue

The add-holding search is a small curated identifier catalogue for quicker manual entry. It is **not** a live fund master, NAV feed, availability check, recommendation, or investment advice. Scheme names are based on public AMFI/AMC disclosures and should be refreshed from an approved data source before production use.

## Test and quality checks

```bash
npm test       # analytics tests
npm run check  # JavaScript syntax checks
```

Current coverage verifies score bounds, allocation arithmetic, and scenario totals. Expand test coverage alongside future import parsers, deduplication, transaction reconstruction, and adapter workflows.

## Repository layout

```text
.
├── analytics.js                 # transparent scoring and simulation logic
├── app.js                       # UI behavior
├── server.mjs                   # local API and development persistence
├── domain/                      # transaction reconstruction and deduplication rules
├── providers/                   # approved-integration adapter contracts
├── db/migrations/               # PostgreSQL production-target schema
├── index.html / style.css        # responsive product interface
├── tests/                        # Node built-in test runner tests
├── docs/                         # architecture and provider boundaries
├── .github/workflows/ci.yml      # GitHub Actions quality gate
├── CONTRIBUTING.md
├── SECURITY.md
└── LICENSE
```

## Resume-ready project description

> Built Spectrum, an explainable portfolio-health and diversification intelligence prototype for Indian investors. Designed a responsive fintech dashboard, deterministic 0–100 scoring model, look-through overlap estimates, source/freshness disclosures, and interactive what-if allocation simulations using vanilla JavaScript and modular normalized data models.

## Roadmap

1. Add validated CSV parsers, reconciliation, transaction reconstruction, and a secure backend data model.
2. Integrate only approved provider APIs/OAuth flows, with encrypted token storage and audit logs.
3. License market and fund-holdings data; make every analytic traceable to a source snapshot.
4. Add richer tests, accessibility audit, authentication, account export/deletion, and observability.
5. Obtain compliance review before offering personalized, actionable recommendations.

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) and [SECURITY.md](SECURITY.md) before opening a pull request or sharing a vulnerability.
