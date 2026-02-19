# Security

- Never hardcode secrets, tokens, passwords, or API keys. Use env vars or secret managers.
- Validate and sanitize all external input at system boundaries.
- Use parameterized queries — never string-interpolate SQL.
- Set minimal file permissions. No world-writable files in production.
- Pin dependencies. Audit with `govulncheck` (Go) or `pip-audit` (Python) before releases.
- HTTPS everywhere. Reject plaintext in production configs.
- Log security events (auth failures, permission denials) but never log secrets or PII.
- Rotate secrets on exposure. Automate rotation where possible.
- Apply principle of least privilege to service accounts, API tokens, and container capabilities.
- Use CSP headers, CORS allowlists, and rate limiting on all public endpoints.
