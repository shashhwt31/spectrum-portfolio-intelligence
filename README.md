# Spectrum — Portfolio Intelligence Platform

**An explainable portfolio-health and diversification analytics platform for Indian investors.**

Spectrum brings portfolio holdings into a unified view and analyzes **asset allocation, concentration, diversification, risk alignment, sector and geographic exposure, fund overlap, portfolio fit, and rebalancing opportunities**.

The platform is designed around transparent, deterministic analytics so that users can understand *why* a portfolio receives a particular assessment instead of relying on an opaque AI score.

> [!IMPORTANT]
> Spectrum is currently a functional portfolio-analytics prototype using local/demo data. It does not connect to live broker accounts, execute trades, use live market data, or request/store passwords, OTPs, TPINs, or trading credentials.

---

## ✨ Features

### Portfolio Intelligence

- **0–100 Portfolio Health Score**
- Explainable score components with configurable weights
- Asset allocation analysis
- Portfolio concentration analysis
- Diversification analysis
- Risk-alignment analysis
- Sector exposure analysis
- Geographic exposure analysis
- Fund look-through and overlap analysis
- Cost and fee analysis
- Liquidity analysis
- Fixed-income quality analysis

### Portfolio Planning

- Investor profile and preference context
- Transparent target-allocation generation
- Portfolio allocation gap analysis
- Interactive what-if scenarios
- Contributions-only rebalancing
- One-time illustrative target rebalancing
- Rebalancing guidance based on portfolio gaps

### Portfolio Data

- Normalized holding model
- CSV portfolio import
- Manual portfolio entry
- Source-labelled holdings
- Source/freshness awareness
- Transaction reconstruction
- Duplicate and repeated-position detection
- Confidence-aware position analysis

### Engineering

- Modular analytics engine
- Node.js HTTP API
- Local development persistence
- PostgreSQL production-target schema
- Provider adapter architecture
- Audit-event support
- Automated tests
- JavaScript syntax checks
- GitHub Actions CI

---

## 🧠 Portfolio Health Engine

Spectrum uses a deterministic weighted scoring model rather than an opaque AI-generated score.

| Component | Weight |
| --- | ---: |
| Asset Allocation | 18% |
| Concentration | 15% |
| Diversification | 12% |
| Risk Alignment | 10% |
| Correlation & Look-through Overlap | 10% |
| Sector Allocation | 9% |
| Geographic Allocation | 8% |
| Cost Efficiency | 7% |
| Fixed-income Quality | 6% |
| Liquidity | 5% |

### Score Pipeline

```text
Portfolio Holdings
       │
       ▼
Normalized Data Model
       │
       ▼
Portfolio Analytics
       │
 ┌─────┼──────────────────────────┐
 │     │          │               │
 ▼     ▼          ▼               ▼
Risk  Allocation  Concentration  Diversification
 │     │          │               │
 └─────┴──────────┴───────────────┘
                    │
                    ▼
          Portfolio Health Score
                    │
                    ▼
          Explainable Insights