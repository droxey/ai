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

## Commands

```bash
pytest --cov=apps -x                    # Standard run
pytest -k "test_create"                 # Filter by name
pytest apps/users/ -x --tb=short        # Single app, fast feedback
pytest --cov=apps --cov-report=html     # Coverage report
```
