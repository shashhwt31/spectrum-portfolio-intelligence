# Contributing to Spectrum

Thanks for helping improve the project.

## Before opening a pull request

1. Keep financial calculations deterministic and add a test for every scoring or simulation change.
2. Preserve visible data provenance, freshness, and confidence limitations in the UI.
3. Do not add scraping, credential collection, password/PIN/OTP/TPIN handling, or unapproved broker automation.
4. Do not describe demo, import-only, or mocked provider support as live connectivity.
5. Run `npm test` and `npm run check`.

## Pull request expectations

Explain the problem, implementation, relevant limitations, and how you tested it. Any production provider adapter must include documented authorization, least-privilege scope, token-handling, failure states, and an audit trail.

## Design principles

Spectrum is built for understandable portfolio analysis, not return chasing. Recommendations must identify a portfolio gap, their expected benefit, trade-offs, data source, confidence, and why recent returns were not the sole selection criterion.
