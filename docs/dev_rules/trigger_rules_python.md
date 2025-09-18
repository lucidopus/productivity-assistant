## Overview

- **Trigger.dev v4** enables long-running, resilient tasks with better self-hosting, warm starts, realtime, and new "waitpoints" primitives.
- All tasks must be declared using the `@task` decorator from `trigger` (v4). Do not use legacy patterns or v3 imports in new code.
- This document includes conventions for database access, parameter validation, logging, error handling, and other best practices, adapted for Python v4.

---

## Critical Instructions for AI Language Models

If you are generating Python code (for example, ChatGPT or other AI LLMs), you must:

1. Never generate deprecated v3 patterns or legacy import paths.

   ```python
   # ❌ DO NOT USE (legacy v3 or deprecated)
   from trigger.v3 import task
   # or
   client.define_job(...)
   ```

2. Always generate the following valid v4 pattern:

   ```python
   # ✅ ALWAYS USE THIS PATTERN (v4)
   from trigger import task, logger

   @task(
       id="hello-world",
       max_duration=300  # seconds
   )
   async def hello_world(payload: dict[str, str]) -> dict:
       """Your task logic here"""
       logger.info("Task started", extra={"payload": payload})
       # your task logic here
       return {"success": True}
   ```

   IMPORTANT: All task functions must be decorated with `@task()` and should be async functions.

3. Verify your code uses:
   - `from trigger import task, logger, wait, metadata` etc.
   - `@task(...)` decorator
   - No references to `client.define_job()` or similar v3 patterns

4. Never omit the task decorator. Every task must be properly decorated and importable.

Failing to follow these guidelines will cause deployment failures and break your tasks in production.

---

## Absolute Requirements

1. **Import from `trigger` (v4)**
   Use v4 API imports only. Do not import from legacy v3 modules.

2. **Decorate every task**
   Every task, including subtasks, must use the `@task` decorator.

3. **Use a unique `id`**
   Each task must have a unique `id` within the project.

4. **Use the v4 `logger`**
   Use `logger` from `trigger` for structured logs.

5. **Database access**
   Follow the SQL usage guidelines below (parameterized queries, proper connection management, centralized helpers).

6. **Error handling**
   Use lifecycle hooks (e.g., `on_failure`) or local `try/except` with full logging.

7. **Configuration**
   Sensitive values must be stored in environment variables (e.g., `TRIGGER_SECRET_KEY`, DB URL, external API keys). When self-hosting, ensure `TRIGGER_API_URL` points to your instance.

---

## What's New in v4 (Practical Highlights)

- **Waitpoints**: First-class primitives to pause runs until a condition is met (time-based waits, external signals via tokens, idempotent waits).
- **Idempotency on waits**: Wait functions accept `idempotency_key` and TTL to skip duplicate waits.
- **Task priority**: Supply priority when triggering to influence scheduling.
- **Warm starts**: Faster start times by reusing warmed machines (typically 100–300ms).
- **Improved self-hosting**: Streamlined Docker Compose; built-in registry/object storage; simpler scaling.
- **Realtime and streams**: Subscribe to run updates and stream metadata from tasks.
- **Telemetry and build extensions**: First-class OpenTelemetry instrumentation and build customization.
- **MCP integrations**: CLI exposes an MCP server to interact with tasks from agentic IDEs/clients.

---

## Task Definition (v4)

### Basic structure

```python
from trigger import task, logger
from typing import Dict, Any

@task(
    id="descriptive_task_name",
    max_duration=300  # seconds (default can be set in config)
)
async def your_task(payload: Dict[str, Any]) -> Dict[str, bool]:
    """Task docstring describing its purpose"""
    logger.info("Task started", extra={"payload": payload})
    # ... your code here ...
    return {"success": True}
```

- Tasks should be async functions for better performance
- Prefer explicit type hints for payload and return types

### Type safety with TypedDict or Pydantic

```python
from typing import TypedDict
from trigger import task

class MyTaskPayload(TypedDict):
    param1: int
    param2: str

@task(id="my-task")
async def my_task(payload: MyTaskPayload) -> dict:
    """Type-safe task operations"""
    # Type-safe operations
    value = payload["param1"] * 2
    return {"result": value}
```

Or with Pydantic models:

```python
from pydantic import BaseModel
from trigger import task

class TaskInput(BaseModel):
    param1: int
    param2: str

@task(id="my-task")
async def my_task(payload: dict) -> dict:
    """Validate payload with Pydantic"""
    validated = TaskInput(**payload)
    # Work with validated data
    return {"result": validated.param1 * 2}
```

---

## Database Access

When you need to query Postgres from within a task, use the shared database utility and centralized connection management.

1. **Database connection utility**

   ```python
   from ._db import get_db_connection, execute_query
   import asyncpg
   ```

   Do not create ad-hoc connections per task. Use the shared helper with connection pooling.

2. **Parameterized SQL with asyncpg**

   ```python
   async def fetch_team_data(team_id: int):
       async with get_db_connection() as conn:
           result = await conn.fetch(
               "SELECT * FROM your_function($1::SMALLINT)",
               team_id
           )
           return result
   ```

   - Always use parameterized queries to prevent SQL injection
   - Cast parameters explicitly when needed
   - Log inputs and outputs with `logger.info` where useful

3. **Result handling**
   ```python
   if not result:
       logger.warning("No results found", extra={"team_id": team_id})
       return []

   logger.info(f"Found {len(result)} rows", extra={"team_id": team_id})
   return [dict(row) for row in result]
   ```

4. **Error handling**
   ```python
   try:
       result = await fetch_team_data(team_id)
   except asyncpg.PostgresError as e:
       logger.error(
           "Database query failed",
           extra={
               "error": str(e),
               "error_type": type(e).__name__,
               "team_id": team_id
           },
           exc_info=True
       )
       raise
   ```

---

## Logging

Use `logger` from `trigger` for structured, level-based logs:

```python
from trigger import task, logger

@task(id="logging-example")
async def logging_example(payload: dict) -> None:
    """Example of structured logging"""
    logger.debug("Debug message", extra=payload)
    logger.info("Info message", extra={"data": payload})
    logger.warning("You've been warned", extra=payload)
    logger.error("Error message", extra={"error": "details"})
```

Operation logging tips:

- Log start/end of major operations with parameters and summaries
- Use `extra` parameter for structured data
- Avoid logging secrets or PII
- Include context in error logs with `exc_info=True`

---

## Error Handling

1. **Input validation**

   ```python
   @task(id="validated-task")
   async def validated_task(payload: dict) -> dict:
       if not payload.get("param1"):
           error_msg = "Missing `param1` in payload"
           logger.error("Validation error", extra={"error": error_msg})
           raise ValueError(error_msg)

       # Continue with validated payload
       return {"status": "ok"}
   ```

2. **Try/except around risky operations**

   ```python
   try:
       # DB/API operation
       result = await external_api_call()
   except Exception as e:
       logger.error(
           "Operation failed",
           extra={
               "message": str(e),
               "error_type": type(e).__name__,
               "context": payload,
           },
           exc_info=True
       )
       raise
   ```

3. **Lifecycle hooks**

   ```python
   async def handle_task_failure(payload: dict, error: Exception):
       """Handle task failure"""
       logger.error(
           "Task ultimately failed",
           extra={"error": str(error), "payload": payload}
       )
       # send alerts/notifications if needed

   @task(
       id="my-task",
       on_failure=handle_task_failure
   )
   async def my_task(payload: dict) -> dict:
       # main logic
       return {"status": "completed"}
   ```

---

## Waitpoints (v4)

Time-based waits and external-signal waits are first-class in v4 and support idempotency.

- **Time-based waits**

  ```python
  from trigger import wait

  # Wait for 30 seconds
  await wait.for_duration(seconds=30)

  # Wait until specific time
  from datetime import datetime, timedelta
  await wait.until(date=datetime.now() + timedelta(minutes=1))
  ```

- **Tokens for external signals (human-in-the-loop)**

  ```python
  from trigger import wait
  from typing import TypedDict

  class ApprovalResult(TypedDict):
      status: str  # "approved" or "rejected"

  # Create a token
  token = await wait.create_token(timeout="10m")

  # Share token.id out-of-band, then wait for completion
  result = await wait.for_token(
      token.id,
      result_type=ApprovalResult
  )

  if not result.ok:
      # timed out or cancelled
      logger.warning("Token wait failed")
  else:
      if result.data["status"] == "approved":
          # Continue processing
          pass

  # Elsewhere, complete the token:
  # await wait.complete_token(token.id, {"status": "approved"})
  ```

- **Idempotency on waits**

  ```python
  await wait.for_duration(
      seconds=10,
      idempotency_key="unique-key",
      idempotency_key_ttl="1h"
  )
  ```

---

## Scheduling (Cron)

v4 continues to support scheduled tasks.

```python
from trigger import scheduled_task

@scheduled_task(
    id="first-scheduled-task",
    cron="0 */2 * * *"  # every two hours (UTC)
)
async def first_scheduled_task(payload: dict) -> dict:
    """Scheduled task that runs every 2 hours"""
    logger.info("Scheduled task running")
    # ...
    return {"executed_at": datetime.now().isoformat()}
```

- Timezone can be specified: `cron={"pattern": "0 */2 * * *", "timezone": "America/New_York"}`
- You can also create schedules imperatively via the SDK or dashboard

---

## Schema Tasks (Payload Validation with Pydantic)

```python
from trigger import schema_task, logger
from pydantic import BaseModel

class UserInfo(BaseModel):
    name: str
    age: int

@schema_task(
    id="my-schema-task",
    schema=UserInfo
)
async def my_schema_task(payload: UserInfo) -> dict:
    """Task with automatic payload validation"""
    logger.info("Validated user info", extra=payload.model_dump())
    return {"processed": True}
```

Invalid payloads raise validation errors before `run` executes.

---

## Triggering Tasks Externally (Server → Trigger.dev)

1. Set `TRIGGER_SECRET_KEY` to match your Trigger.dev project
2. Use the v4 `tasks` API to trigger tasks by `id`

```python
from trigger import tasks
import os

async def trigger_external_task(request_data: dict):
    """Trigger a task from your application"""
    # Ensure TRIGGER_SECRET_KEY is set

    handle = await tasks.trigger(
        task_id="my-task",
        payload={
            "param1": request_data["param1"],
            "param2": request_data["param2"]
        }
    )
    return {"handle_id": handle.id}
```

Other methods:

- `tasks.batch_trigger()` for multiple payloads
- `tasks.trigger_and_poll()` for synchronous polling (avoid in HTTP handlers)

---

## Triggering Tasks Internally (Task → Task)

Inside one task, you can trigger another task and optionally wait for completion.

```python
from trigger import task
from .child_task import child_task

@task(id="parent-task")
async def parent_task(payload: dict) -> dict:
    """Parent task that triggers child tasks"""

    # Trigger without waiting
    handle = await child_task.trigger({"foo": "some data"})

    # Or trigger and wait for result
    result = await child_task.trigger_and_wait({"foo": "some data"})

    return {"child_result": result}
```

Batch APIs are also available for advanced scenarios.

---

## Metadata and Realtime

Attach or stream structured metadata from tasks and subscribe to runs in realtime.

```python
from trigger import task, metadata
from typing import AsyncIterator

@task(id="my-task")
async def my_task(payload: dict) -> dict:
    """Task with metadata streaming"""

    # Set metadata
    metadata.set("progress", 0.1)

    # Stream data
    async def data_generator() -> AsyncIterator[str]:
        for i in range(10):
            yield f"Processing chunk {i}"

    stream = await metadata.stream("processing", data_generator())

    async for chunk in stream:
        # process chunks
        logger.info(f"Processed: {chunk}")

    return {"ok": True}
```

Subscribing to runs:

```python
from trigger import runs, tasks

async def observe():
    """Subscribe to task run updates"""
    handle = await tasks.trigger("my-task", {"some": "data"})

    async for run in runs.subscribe_to_run(handle.id):
        print(f"Run status: {run.status}")
        if run.status in ["completed", "failed"]:
            break
```

---

## Idempotency (v4)

Ensure operations run once per key. Keys can be used for child triggers and waits.

```python
from trigger import task, idempotency_keys, wait

@task(id="my-task")
async def my_task(payload: dict) -> dict:
    """Task with idempotent operations"""

    # Create idempotency key
    key = await idempotency_keys.create("my-task-key")

    # Use with waits
    await wait.for_duration(
        seconds=10,
        idempotency_key=key,
        idempotency_key_ttl="60s"
    )

    return {"processed": True}
```

Payload-based keys can be created by hashing the payload if needed:

```python
import hashlib
import json

def create_payload_key(payload: dict) -> str:
    """Create deterministic key from payload"""
    payload_str = json.dumps(payload, sort_keys=True)
    return hashlib.sha256(payload_str.encode()).hexdigest()
```

---

## Project Configuration (`trigger_config.py`)

Define global settings, telemetry, and customizations for v4.

```python
from trigger import define_config
from trigger.instrumentation import PrismaInstrumentation

config = define_config(
    project="<project-ref>",
    dirs=["./trigger"],

    # Global lifecycle hooks
    async def on_start(payload, ctx):
        print(f"Task started: {ctx.task.id}")

    async def on_success(payload, output, ctx):
        print(f"Task succeeded: {ctx.task.id}")

    async def on_failure(payload, error, ctx):
        print(f"Task failed: {ctx.task.id}")

    # Telemetry
    telemetry={
        "instrumentations": [PrismaInstrumentation()],
        # "exporters": [axiom_exporter],  # optional
    },

    # Runtime and defaults
    runtime="python",
    default_machine="large-1x",
    max_duration=60,
    log_level="info",

    # Build customizations
    build={
        "requirements_file": "./requirements.txt",
        "python_version": "3.12",
        "system_packages": ["postgresql-client", "ffmpeg"],
    }
)
```

Notes:

- Use `dirs` to point to task directories
- Prefer OpenTelemetry instrumentations for DB/LLM libraries
- Specify Python version and system packages as needed

---

## Self-Hosting (v4)

- Use the provided Docker Compose with built-in registry and object storage
- Horizontally scale by adding worker containers; v4 supports warm starts to reduce task latency
- Ensure `TRIGGER_API_URL` points to your self-hosted instance. Do not call the cloud `api.trigger.dev` from this project
- Best practices:
  - Pin Docker images to explicit versions
  - Verify `.env` and magic link email flow early
  - Secure the dashboard/registry; avoid public exposure without auth

---

## Security

1. **Data handling**
   - Validate inputs (types or Pydantic schemas)
   - Never log secrets or PII
   - Always use parameterized SQL queries

2. **Authentication**
   - Ensure `TRIGGER_SECRET_KEY` is set and correct per environment
   - Use environment-scoped configs; leverage v4's environment-first dashboard

3. **Observability**
   - Use telemetry and log levels to monitor performance
   - Track run failures and retries; alert on anomalies

---

## Upgrading from v3 → v4 (Python Conventions)

When migrating existing tasks:

1. Replace imports:
   - `from trigger.v3 import task` → `from trigger import task`
2. Convert function-based tasks to decorated async functions
3. If using waits, migrate to v4 `wait` APIs and consider idempotency on waits
4. Update any `tasks.trigger()` calls to use v4 async methods
5. Review `trigger_config.py` for v4 options (telemetry, Python version, system packages)
6. Validate self-hosting URLs (use `TRIGGER_API_URL`)

---

## Python-Specific Best Practices

### Async/Await Patterns

```python
import asyncio
from trigger import task

@task(id="concurrent-operations")
async def concurrent_operations(payload: dict) -> dict:
    """Run multiple async operations concurrently"""

    # Run multiple operations concurrently
    results = await asyncio.gather(
        fetch_user_data(payload["user_id"]),
        fetch_team_data(payload["team_id"]),
        fetch_project_data(payload["project_id"])
    )

    user_data, team_data, project_data = results
    return {
        "user": user_data,
        "team": team_data,
        "project": project_data
    }
```

### Context Managers

```python
from contextlib import asynccontextmanager
from trigger import task, logger

@asynccontextmanager
async def timed_operation(name: str):
    """Context manager for timing operations"""
    import time
    start = time.time()
    try:
        yield
    finally:
        duration = time.time() - start
        logger.info(f"{name} took {duration:.2f} seconds")

@task(id="timed-task")
async def timed_task(payload: dict) -> dict:
    async with timed_operation("database_query"):
        result = await fetch_data()
    return {"result": result}
```

### Type Hints and Generics

```python
from typing import TypeVar, Generic, Optional
from trigger import task

T = TypeVar('T')

class TaskResult(Generic[T]):
    def __init__(self, data: T, metadata: Optional[dict] = None):
        self.data = data
        self.metadata = metadata or {}

@task(id="typed-task")
async def typed_task(payload: dict) -> TaskResult[list[str]]:
    """Task with generic return type"""
    results = await process_items(payload["items"])
    return TaskResult(
        data=results,
        metadata={"processed_count": len(results)}
    )
```

---

## Testing Tasks

```python
import pytest
from unittest.mock import AsyncMock, patch
from .my_task import my_task

@pytest.mark.asyncio
async def test_my_task():
    """Test task execution"""

    # Mock external dependencies
    with patch('my_module.external_api_call', new_callable=AsyncMock) as mock_api:
        mock_api.return_value = {"status": "success"}

        # Test the task
        result = await my_task.run({"param1": "test"})

        assert result["success"] is True
        mock_api.assert_called_once()
```

---

## Environment Variables

```python
import os
from trigger import task, logger

# Use environment variables with defaults
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://localhost/mydb")
API_KEY = os.getenv("API_KEY")
MAX_RETRIES = int(os.getenv("MAX_RETRIES", "3"))

@task(id="env-aware-task")
async def env_aware_task(payload: dict) -> dict:
    """Task using environment configuration"""
    if not API_KEY:
        raise ValueError("API_KEY environment variable not set")

    logger.info("Task configured", extra={"max_retries": MAX_RETRIES})
    return {"status": "configured"}
```

---

## MCP and Tooling

The v4 CLI can expose an MCP server for IDEs/agents (e.g., Cursor) to:

- List possible tasks, trigger tasks, and stream logs
- Query runs and cancel in-flight runs

Use this only in trusted dev environments; do not expose outside your network.

---

## Python Runtime

- v4 workers run on modern Python runtime (3.10+)
- Keep your code compatible with the configured Python version
- Document specific Python version requirements in `requirements.txt` and `trigger_config.py`
- Use type hints for better IDE support and runtime validation

---

## API Requests (Self-Hosted Only)

If making direct API requests to Trigger.dev from this repo (e.g., list runs, cancel runs), always use `TRIGGER_API_URL` as the base URL. Because we self-host, never point requests to the cloud service domain.

```python
import os
import httpx
from trigger import logger

TRIGGER_API_URL = os.getenv("TRIGGER_API_URL", "http://localhost:3000")

async def list_runs():
    """List all runs via API"""
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{TRIGGER_API_URL}/api/v1/runs",
            headers={"Authorization": f"Bearer {os.getenv('TRIGGER_SECRET_KEY')}"}
        )
        response.raise_for_status()
        return response.json()
```