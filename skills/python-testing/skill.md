# Python Testing

pytest patterns, Factory Boy, and DRF test strategies.

## Factory Boy

```python
# apps/users/tests/factories.py
import factory
from apps.users.models import User

class UserFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = User

    email = factory.Sequence(lambda n: f"user{n}@example.com")
    name = factory.Faker("name")
    role = "member"
    is_active = True

class AdminFactory(UserFactory):
    role = "admin"
```

## Fixtures

```python
# conftest.py
import pytest
from rest_framework.test import APIClient
from apps.users.tests.factories import UserFactory

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def user():
    return UserFactory()

@pytest.fixture
def auth_client(api_client, user):
    api_client.force_authenticate(user=user)
    return api_client
```

## DRF Endpoint Tests

```python
class TestUserEndpoints:
    def test_create_user(self, auth_client):
        payload = {"email": "new@example.com", "name": "New User"}
        response = auth_client.post("/api/users/", payload)

        assert response.status_code == 201
        assert response.data["email"] == "new@example.com"
        assert User.objects.filter(email="new@example.com").exists()

    def test_create_user_duplicate_email(self, auth_client, user):
        payload = {"email": user.email, "name": "Duplicate"}
        response = auth_client.post("/api/users/", payload)

        assert response.status_code == 400

    def test_list_users_unauthenticated(self, api_client):
        response = api_client.get("/api/users/")
        assert response.status_code == 401
```

## Service Tests

```python
class TestUserService:
    def test_create_user_sends_welcome_email(self, mocker):
        mock_send = mocker.patch("apps.users.services.EmailService.send_welcome")
        user = UserService.create_user(email="test@example.com", name="Test")

        assert user.email == "test@example.com"
        mock_send.assert_called_once_with(user=user)

    def test_create_user_creates_audit_log(self):
        user = UserService.create_user(email="test@example.com", name="Test")
        assert AuditLog.objects.filter(action="user_created", target=user).exists()
```

## Parametrize

```python
@pytest.mark.parametrize("role,expected_status", [
    ("admin", 200),
    ("member", 403),
    ("viewer", 403),
])
def test_delete_user_permissions(auth_client, user, role, expected_status):
    user.role = role
    user.save()
    response = auth_client.delete(f"/api/users/{user.id}/")
    assert response.status_code == expected_status
```

## Celery Task Tests

```python
from unittest.mock import patch

class TestSendNotificationTask:
    def test_sends_email_on_success(self, user):
        with patch("apps.notifications.tasks.EmailService") as mock_email:
            result = send_notification.apply(args=[user.id])

            assert result.successful()
            mock_email.send.assert_called_once_with(to=user.email)

    def test_retries_on_transient_error(self, user):
        with patch(
            "apps.notifications.tasks.EmailService.send",
            side_effect=ConnectionError("timeout"),
        ):
            result = send_notification.apply(args=[user.id])

            assert result.failed()
            # Verify retry was requested (Celery test mode)

    def test_chain_executes_in_order(self):
        from celery import chain
        result = chain(step_one.s(1), step_two.s()).apply()
        assert result.get(timeout=5) == expected_output
```

Use `@pytest.fixture(scope="session")` for Celery app setup. Test with `task.apply()` (sync) in unit tests, `task.delay()` only in integration tests with a real broker.

## Property-Based Tests (Hypothesis)

```python
from hypothesis import given, strategies as st

@given(st.text(), st.text())
def test_search_never_crashes(query, corpus):
    result = search_service.search(query=query, corpus=corpus)
    assert isinstance(result, list)

@given(st.emails())
def test_email_normalization_is_idempotent(email):
    once = normalize_email(email)
    twice = normalize_email(once)
    assert once == twice

@given(
    st.fixed_dictionaries({
        "name": st.text(min_size=1, max_size=200),
        "email": st.emails(),
        "role": st.sampled_from(["admin", "member", "viewer"]),
    })
)
def test_user_serializer_round_trips(data):
    serializer = UserSerializer(data=data)
    if serializer.is_valid():
        assert serializer.validated_data["email"] == data["email"]
```

Use `hypothesis` for serializer validation, string processing, and any function that should be total (never crash). Add `@settings(max_examples=200)` in CI.

## API Schema Validation

```python
import yaml
from openapi_spec_validator import validate

def test_openapi_schema_is_valid():
    schema = yaml.safe_load(open("openapi.yaml"))
    validate(schema)

class TestSchemaCompliance:
    def test_list_users_matches_schema(self, auth_client, openapi_schema):
        response = auth_client.get("/api/users/")
        validate_response(
            response.json(),
            openapi_schema["paths"]["/api/users/"]["get"]["responses"]["200"],
        )
```

Use `drf-spectacular` to auto-generate the schema, then validate actual responses against it in tests. Catches serializer drift.

## Commands

```bash
pytest --cov=apps -x                    # Standard run
pytest -k "test_create"                 # Filter by name
pytest apps/users/ -x --tb=short        # Single app, fast feedback
pytest --cov=apps --cov-report=html     # Coverage report
pytest -x --hypothesis-show-statistics  # Property-based test stats
```
