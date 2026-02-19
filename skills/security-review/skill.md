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

## Automated Security Testing

### Static Analysis (SAST)

```bash
# Python
pip-audit                              # Dependency vulnerabilities
bandit -r apps/ -f json                # Code-level security issues
safety check --full-report             # Known CVEs in installed packages

# Go
govulncheck ./...                      # Dependency vulnerabilities
gosec ./...                            # Code-level security issues
```

Run SAST in CI on every PR. Block merges on critical/high findings.

### Dependency Scanning

```yaml
# .github/workflows/security.yml (example CI step)
- name: Audit Python deps
  run: pip-audit --strict --desc

- name: Audit Go deps
  run: govulncheck ./...
```

Pin dependencies and audit before every release. Subscribe to security advisories for direct dependencies.

### Dynamic Analysis (DAST)

For staging/pre-production environments:
- OWASP ZAP baseline scan against staging API endpoints.
- Run after deployment, before promotion to production.
- Focus on auth bypass, injection, and header misconfiguration.

### Security Test Patterns

```python
# Test for horizontal privilege escalation
def test_user_cannot_access_other_users_data(auth_client, user):
    other_user = UserFactory()
    response = auth_client.get(f"/api/users/{other_user.id}/")
    assert response.status_code == 404  # or 403

# Test for missing auth
def test_endpoint_requires_authentication(api_client):
    response = api_client.get("/api/private/")
    assert response.status_code == 401
```

## Output Format

| Severity | Location | Finding | Recommendation |
|----------|----------|---------|----------------|
| Critical | file:line | Description | Fix |
| High | file:line | Description | Fix |
| Medium | file:line | Description | Fix |
| Low | file:line | Description | Fix |
