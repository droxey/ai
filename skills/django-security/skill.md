# Django Security

CSRF, authentication, injection prevention, and Django-specific security patterns.

## Authentication

```python
# Use Django's built-in auth with DRF token or JWT
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
}

# JWT settings
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=15),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=1),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "ALGORITHM": "HS256",  # Pin algorithm, never allow none
}
```

## CSRF Protection

- Never disable CSRF middleware. Use `@csrf_exempt` only on webhook endpoints with signature verification.
- DRF with JWT is CSRF-exempt by design (no cookies). Session auth requires CSRF tokens.
- Set `CSRF_COOKIE_HTTPONLY = True` and `CSRF_COOKIE_SECURE = True` in production.

## SQL Injection Prevention

```python
# Always use ORM or parameterized queries
User.objects.filter(email=user_input)           # Safe
User.objects.raw("SELECT * FROM users WHERE email = %s", [user_input])  # Safe

# NEVER do this
User.objects.raw(f"SELECT * FROM users WHERE email = '{user_input}'")   # Vulnerable
```

## XSS Prevention

- Django templates auto-escape by default. Never use `|safe` on user content.
- DRF serializers don't escape HTML. Sanitize at input or in the frontend.
- Set `Content-Security-Policy` headers. No `unsafe-inline` for scripts.

## Security Headers

```python
# settings/production.py
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
SESSION_COOKIE_HTTPONLY = True
CSRF_COOKIE_SECURE = True
```

## Rate Limiting

```python
# Use django-ratelimit or DRF throttling
REST_FRAMEWORK = {
    "DEFAULT_THROTTLE_CLASSES": [
        "rest_framework.throttling.AnonRateThrottle",
        "rest_framework.throttling.UserRateThrottle",
    ],
    "DEFAULT_THROTTLE_RATES": {
        "anon": "20/minute",
        "user": "100/minute",
    },
}
```

## File Uploads

- Validate file type by content (magic bytes), not just extension.
- Limit file size in nginx/reverse proxy AND Django.
- Store uploads outside the web root. Serve via signed URLs with expiry.
- Scan uploads for malware in production.

## Checklist for New Endpoints

1. Permission class set (not relying on global default alone)?
2. Input validated through serializer?
3. Queryset scoped to requesting user's access?
4. Sensitive fields excluded from output serializer?
5. Rate limiting appropriate for endpoint type?
6. Audit logging for state-changing operations?
