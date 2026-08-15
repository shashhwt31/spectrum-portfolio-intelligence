# Security policy

## Reporting a vulnerability

Do not post sensitive vulnerabilities in public issues. Until a dedicated reporting address is configured, contact the repository owner privately through GitHub and include a minimal reproduction and impact assessment.

## Security boundaries

- Never collect broker passwords, PINs, OTPs, TPINs, or trading credentials.
- Production connection tokens must remain server-side, encrypted at rest, scoped minimally, and revocable.
- Never commit `.env` files, API secrets, user statements, personally identifiable data, or account exports.
- Provider connections must use official, approved OAuth/API or legally supported aggregation methods only.

This prototype contains no authentication, real user data store, live provider connection, or secret. Those capabilities require security review before release.
