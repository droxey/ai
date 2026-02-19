# Python Testing

- pytest as the test runner. No unittest.TestCase unless extending existing suites.
- Factory Boy for model instance creation. No manual object construction in tests.
- `conftest.py` for shared fixtures. Scope fixtures appropriately (function, class, module, session).
- `@pytest.mark.parametrize` for table-driven test patterns.
- `pytest-cov` for coverage reporting. Fail CI under target threshold.
- DRF: Use `APIClient` for endpoint tests. Test serializers in isolation for validation logic.
- Mock external services with `responses` or `pytest-httpx`. Never hit real APIs in tests.
- Use `freezegun` or `time-machine` for time-dependent tests. No `time.sleep`.
- `pytest -x --tb=short` for fast failure feedback during development.
- `pytest --cov=apps -x` as the standard test command. Stop on first failure.
- Separate test directories mirror source structure: `tests/unit/`, `tests/integration/`.
- `hypothesis` for property-based tests on serializers, string processing, and total functions.
- Test Celery tasks with `task.apply()` (sync). Reserve `task.delay()` for integration tests.
- Validate API responses against OpenAPI schema with `drf-spectacular` + `openapi-spec-validator`.
