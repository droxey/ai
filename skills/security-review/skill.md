# Security Review

Systematic security audit workflow for web applications and APIs.

## Checklist

### Authentication & Authorization
- Verify auth on all endpoints. Test for missing auth middleware.
- Check JWT: expiration, algorithm pinning (no `alg: none`), refresh token rotation.
- Test horizontal privilege escalation: can user A access user B's resources?
- Verify role-based access. Test each role against endpoints it shouldn't reach.

### Injection
- SQL injection: test all query parameters, form fields, headers with `' OR 1=1--`.
- Command injection: test inputs that reach `os.system`, `subprocess`, `exec.Command`.
- Template injection: test `{{7*7}}` in user-controlled template strings.
- Path traversal: test `../../etc/passwd` in file path parameters.

### Secrets & Configuration
- Scan for hardcoded secrets: API keys, passwords, tokens in source code.
- Verify `.env` files are in `.gitignore`. Check git history for leaked secrets.
- Confirm secrets use env vars or secret managers in production.
- Check for debug mode, verbose errors, or stack traces in production config.

### Data Exposure
- Review API responses for over-fetching. Serializers should whitelist fields.
- Check error messages for internal details (paths, versions, stack traces).
- Verify PII handling: encryption at rest, minimal logging, GDPR compliance.
- Test for IDOR (Insecure Direct Object Reference) on all resource endpoints.

### Infrastructure
- HTTPS enforced. HSTS headers set. No mixed content.
- CORS restricted to known origins. No `Access-Control-Allow-Origin: *` with credentials.
- Rate limiting on auth endpoints, password reset, and public APIs.
- CSP headers configured. No `unsafe-inline` or `unsafe-eval` without justification.

## Output Format

| Severity | Location | Finding | Recommendation |
|----------|----------|---------|----------------|
| Critical | file:line | Description | Fix |
| High | file:line | Description | Fix |
| Medium | file:line | Description | Fix |
| Low | file:line | Description | Fix |
