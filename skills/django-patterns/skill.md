# Django Patterns

DRF ViewSets, serializers, signals, and common Django patterns.

## Base Model

```python
# core/models.py
import uuid
from django.db import models

class BaseModel(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True
        ordering = ["-created_at"]
```

## ViewSet Patterns

```python
# Prefer explicit actions over ModelViewSet magic
class ProjectViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def list(self, request):
        projects = get_projects_for_user(user=request.user)
        serializer = ProjectOutputSerializer(projects, many=True)
        return Response(serializer.data)

    def create(self, request):
        serializer = ProjectCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        project = ProjectService.create(**serializer.validated_data, owner=request.user)
        return Response(ProjectOutputSerializer(project).data, status=201)

    @action(detail=True, methods=["post"])
    def archive(self, request, pk=None):
        project = get_object_or_404(Project, pk=pk)
        self.check_object_permissions(request, project)
        ProjectService.archive(project=project)
        return Response(status=204)
```

## Custom Permissions

```python
# core/permissions.py
from rest_framework.permissions import BasePermission

class IsOwner(BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.owner == request.user

class IsAdminOrReadOnly(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return request.user.is_staff
```

## Signals (Use Sparingly)

```python
# Only for cross-cutting concerns that shouldn't couple apps
@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)
```

Prefer explicit service calls over signals for business logic. Signals are invisible and hard to debug.

## Pagination

```python
# core/pagination.py
from rest_framework.pagination import CursorPagination

class DefaultPagination(CursorPagination):
    page_size = 25
    ordering = "-created_at"
    cursor_query_param = "cursor"
```

Cursor pagination over offset pagination for large datasets. Stable results under concurrent writes.

## Migrations

- One migration per logical change. Squash when the chain gets long.
- Data migrations in their own file, separate from schema migrations.
- Test migrations in CI: `python manage.py migrate` on a fresh database.
- Never edit a migration that's been deployed. Create a new one.

### Testing Data Migrations

```python
from django.test import TestCase
from django.core.management import call_command

class TestDataMigrations(TestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        call_command("migrate", "users", "0005_previous_migration", verbosity=0)

    def test_forward_migration_populates_field(self):
        from django.db import connection
        with connection.cursor() as cursor:
            cursor.execute(
                "INSERT INTO users_user (id, email) VALUES (%s, %s)",
                ["test-id", "test@example.com"],
            )

        call_command("migrate", "users", "0006_populate_display_name", verbosity=0)

        from apps.users.models import User
        user = User.objects.get(pk="test-id")
        assert user.display_name == "test@example.com"

    def test_reverse_migration(self):
        call_command("migrate", "users", "0006_populate_display_name", verbosity=0)
        call_command("migrate", "users", "0005_previous_migration", verbosity=0)
```

Test data migrations against realistic data shapes. Always test reversibility. Run `python manage.py migrate && python manage.py migrate zero` in CI to verify full forward/backward compatibility.

## Management Commands

```python
# apps/users/management/commands/cleanup_inactive.py
from django.core.management.base import BaseCommand

class Command(BaseCommand):
    help = "Deactivate users who haven't logged in for 90 days"

    def add_arguments(self, parser):
        parser.add_argument("--dry-run", action="store_true")

    def handle(self, *args, **options):
        cutoff = timezone.now() - timedelta(days=90)
        users = User.objects.filter(last_login__lt=cutoff, is_active=True)
        if options["dry_run"]:
            self.stdout.write(f"Would deactivate {users.count()} users")
            return
        count = users.update(is_active=False)
        self.stdout.write(f"Deactivated {count} users")
```
