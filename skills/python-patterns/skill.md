# Python Patterns

Django service layer, DRF patterns, and Python project structure.

## Project Layout

```
config/
  settings/
    base.py           # Shared settings
    local.py          # Dev overrides (DEBUG=True, etc.)
    production.py     # Prod settings (from env vars)
  urls.py
  wsgi.py
apps/
  users/
    models.py
    serializers.py
    views.py
    services.py       # Business logic lives here
    selectors.py      # Complex queries
    urls.py
    tests/
      test_services.py
      test_views.py
      factories.py
core/
  models.py           # Base model (timestamps, uuid pk)
  permissions.py      # Shared DRF permissions
  pagination.py       # Shared pagination classes
```

## Service Layer

```python
# apps/users/services.py
from django.db import transaction

class UserService:
    @staticmethod
    @transaction.atomic
    def create_user(*, email: str, name: str, role: str = "member") -> User:
        user = User.objects.create(email=email, name=name, role=role)
        EmailService.send_welcome(user=user)
        AuditLog.objects.create(action="user_created", target=user)
        return user
```

Keep views thin — they handle HTTP concerns (parsing, permissions, responses). Services handle business logic and orchestration.

## DRF Serializers

```python
# Separate input and output serializers
class UserCreateSerializer(serializers.Serializer):
    email = serializers.EmailField()
    name = serializers.CharField(max_length=255)
    role = serializers.ChoiceField(choices=User.Role.choices, default="member")

class UserOutputSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "email", "name", "role", "created_at"]
```

## DRF Views

```python
class UserViewSet(viewsets.ViewSet):
    def create(self, request):
        serializer = UserCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = UserService.create_user(**serializer.validated_data)
        return Response(UserOutputSerializer(user).data, status=201)
```

## Selectors for Complex Queries

```python
# apps/users/selectors.py
def get_active_users_with_stats(*, team_id: int) -> QuerySet:
    return (
        User.objects
        .filter(team_id=team_id, is_active=True)
        .annotate(task_count=Count("tasks"))
        .select_related("team")
        .order_by("-task_count")
    )
```

## Configuration

```python
# config/settings/base.py
import environ

env = environ.Env()

SECRET_KEY = env("DJANGO_SECRET_KEY")
DATABASES = {"default": env.db("DATABASE_URL")}
CACHES = {"default": env.cache("REDIS_URL")}
```

Always read from env vars. No secrets in settings files. Fail at startup if required vars are missing.
