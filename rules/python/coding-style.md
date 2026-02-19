# Python Coding Style

- Type hints on all function signatures. Use `from __future__ import annotations` for forward refs.
- `ruff` for linting and formatting. Single tool, replaces black + isort + flake8.
- `pathlib.Path` over `os.path`. Modern path handling throughout.
- Dataclasses or Pydantic for structured data. No raw dicts as data containers.
- f-strings for formatting. No `.format()` or `%` interpolation.
- Explicit imports. No wildcard `from module import *`.
- Use `logging` module with structured fields. No `print()` in production code.
- Comprehensions over `map`/`filter` when readable. Break into loops when complex.
- `contextlib` for resource management. `@contextmanager` for custom cleanup.
- Prefer `enum.Enum` for fixed sets of values. No magic strings.
- Virtual environments always. `uv` for fast dependency management.
