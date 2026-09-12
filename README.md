# Nebula Deploy

> [!WARNING]
> **Work in progress — unstable project**
>
> Nebula Deploy is still under active development. Some features may be incomplete, contain bugs, or change significantly without notice.
>
> **Not recommended for production use.** This repository is intended for demonstration, learning, and technical evaluation.
>
> 
> A full-stack deployment platform for managing projects, environments, deployments, logs, and configuration in one place.

![Nebula Deploy](https://img.shields.io/badge/status-in%20development-violet)
![CI](https://img.shields.io/github/actions/workflow/status/Blxck-2001/nebula-deploy/ci.yml?label=CI)
![License](https://img.shields.io/badge/license-MIT-blue)

## Overview
![Preview](https://prnt.sc/61U8IUaXhTyb)
Nebula Deploy is a cloud-inspired deployment management platform designed to simplify the software delivery workflow.

It provides a centralized dashboard for teams to manage projects, track deployments, inspect logs, configure environments, and monitor deployment activity.

## Highlights

- Modern deployment dashboard
- Project and environment management
- Deployment history and status tracking
- Real-time-oriented worker architecture
- Application logs and deployment activity
- Environment variables and configuration management
- Docker-based local development
- Automated CI workflows
- Responsive interface with light and dark themes

## Architecture

The project is organized as a multi-service application:

```text
nebula-deploy/
├── frontend/          # Next.js application and user interface
├── backend-spring/    # Main Spring Boot API
├── backend-worker/    # Background deployment worker
├── db/                # Database migrations
├── scripts/           # Development and demo scripts
├── docs/              # Project documentation
└── .github/workflows/ # CI/CD automation
```

### Technology stack

- **Frontend:** Next.js, React, TypeScript, Tailwind CSS
- **Backend:** Java, Spring Boot, Maven
- **Worker:** Spring Boot background service
- **Database:** SQL migrations
- **Infrastructure:** Docker and Docker Compose
- **Automation:** GitHub Actions
- **Quality:** ESLint, Playwright, automated tests

## Getting started

### Prerequisites

- Node.js 20+
- Java 17+
- Docker Desktop
- Git

### Clone the repository

```bash
git clone https://github.com/Blxck-2001/nebula-deploy.git
cd nebula-deploy
```

### Configure environment variables

Copy the example environment files and configure the required values:

```bash
copy .env.example .env
copy frontend\.env.example frontend\.env.local
```

> Never commit credentials, tokens, or production environment variables.

### Run with Docker Compose

```bash
docker compose up --build
```

### Run the frontend locally

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at:

```text
http://localhost:3000
```

### Run the backend locally

```bash
cd backend-spring
.\mvnw.cmd spring-boot:run
```

## Testing

Run frontend linting and tests:

```bash
cd frontend
npm run lint
npm run test
```

Run end-to-end tests:

```bash
npx playwright test
```

Run backend tests:

```bash
cd backend-spring
.\mvnw.cmd test
```

## Project documentation

- [Getting Started](docs/GETTING_STARTED.md)
- [Architecture](ARCHITECTURE.md)
- [Contributing](CONTRIBUTING.md)
- [Demo guide](demo-steps.md)
- [Cleanup guide](CLEANUP.md)

## Engineering focus

This project demonstrates practical experience with:

- Full-stack application architecture
- REST API development
- Asynchronous background processing
- Containerized development environments
- CI automation
- Type-safe frontend development
- End-to-end testing
- Modular and maintainable code organization

## Roadmap

- [ ] Deployment provider integrations
- [ ] Real-time deployment status updates
- [ ] Advanced logs filtering
- [ ] Team collaboration and permissions
- [ ] Notifications and webhooks
- [ ] Production observability

## Contributing

Contributions, suggestions, and improvements are welcome.

1. Create a feature branch.
2. Make your changes.
3. Add or update tests.
4. Run the quality checks.
5. Open a pull request.

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

---

Built with TypeScript, React, Spring Boot, and Docker.
