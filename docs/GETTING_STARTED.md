# Getting started (for engineers)

This document explains how to run the project locally for development and debugging.

Prerequisites
- Docker & Docker Compose
- Java 21 and Maven (for Java modules)
- Node.js (for frontend/demo assets)

Quick demo (using docker compose)

1. Start services:

```bash
docker compose up --build
```

2. Register a user and create a project (example using curl/PowerShell shown in README).

3. Trigger a deploy:

```bash
# login and set token (example)
# POST /projects/{id}/deploy to create a deploy
```

Database migration
- The migration used to add `id` and `created_at` to `deploy_logs` is in `scripts/db/0001_add_deploy_logs.sql`.

Notes
- Worker requires `git` available in the image if it will clone repos. If running inside Docker, ensure the worker image includes `git` or mount host Docker socket and run build on host.
