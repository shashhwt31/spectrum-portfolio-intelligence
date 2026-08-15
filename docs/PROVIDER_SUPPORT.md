# Provider-support matrix

| Provider | Current project support | Data source shown | Live connection? |
| --- | --- | --- | --- |
| Zerodha | Demo CSV import experience | CSV statement | No |
| Groww | Demo manual holding entry | User-entered | No |
| Wint Wealth | Demo statement import experience | PDF / statement | No |
| ICICI Direct | Demo manual holding entry | User-entered | No |
| Upstox | Import/manual-only placeholder | None | No |
| Angel One | Import/manual-only placeholder | None | No |

## Integration policy

Future integrations may use only official APIs/OAuth or authorized aggregation methods that are legally and technically supported. They must not scrape websites, automate login, or request passwords, PINs, OTPs, TPINs, or similarly sensitive brokerage credentials.

Before marking a provider as connected, document the approved method, authorization scope, sync behaviour, rate limits, failure/retry behaviour, source freshness, data retention, and disconnect/revocation flow.
