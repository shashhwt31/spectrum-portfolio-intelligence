# Architecture and analytics notes

## Current prototype

The browser renders a normalized set of holding records. Each record has an instrument identity, account attribution, source type, timestamp, asset/sector/geographic classifications, fee, liquidity marker, and a simplified look-through exposure map. `analytics.js` derives the portfolio total, allocation groups, concentration, estimated overlap, weighted fee, ten component scores, and contribution scenarios.

The UI never derives an unsupported real-time number. It labels the portfolio as demo data and identifies the source/freshness of every account row.

## Production target model

```text
ProviderAdapter
  ├── authorize / sync / import
  └── normalize → Account, Holding, Transaction, Instrument, Price,
                  CorporateAction, CashBalance, SourceMetadata

PortfolioAnalyticsService
  ├── reconciliation and duplicate-confidence checks
  ├── transaction-to-position reconstruction
  ├── look-through exposure service
  ├── versioned score engine
  └── recommendation / simulation inputs
```

An adapter must retain source-account attribution. Instruments may be matched by ISIN, exchange symbol, scheme code, or a controlled match-confidence process. Positions must never be merged solely because their instruments match: equivalent securities at different brokers are legitimate separate positions.

## Health-score assumptions in this prototype

The current scoring rules are intentionally simple and inspectable:

- Allocation compares equity, debt, and gold weights to a moderate-growth illustrative reference of 65% / 25% / 10%.
- Concentration applies a penalty to the largest holding weight.
- Diversification rewards the number of holdings and represented asset classes.
- Sector and geography penalize dominant sector exposure and absent international representation.
- Correlation/overlap uses a simplified supplied look-through map; it is an estimate, not a correlation matrix.
- Cost uses a value-weighted displayed expense ratio; liquidity and risk alignment use fixed prototype assumptions.

This is sufficient to demonstrate explainability, but it is not investment, tax, legal, or regulatory advice. A production score must version rules, retain source snapshots, and expose data-quality confidence for every component.
