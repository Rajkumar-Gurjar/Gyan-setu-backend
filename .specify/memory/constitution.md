<!--
Sync Impact Report:
- Version change: [TEMPLATE] → 1.0.0
- List of modified principles:
    - [PRINCIPLE_1_NAME] → I. Offline-First & Data Resiliency
    - [PRINCIPLE_2_NAME] → II. Multilingual Inclusivity
    - [PRINCIPLE_3_NAME] → III. Optimized for Low-Bandwidth
    - [PRINCIPLE_4_NAME] → IV. Layered Decoupling
    - [PRINCIPLE_5_NAME] → V. Strict Validation & Security
- Added sections: Technology Stack & Standards, Development Workflow
- Removed sections: None
- Templates requiring updates:
    - ✅ updated: .specify/templates/plan-template.md
    - ✅ updated: .specify/templates/spec-template.md
    - ✅ updated: .specify/templates/tasks-template.md
- Follow-up TODOs: None
-->

# Gyan-setu-backend Constitution

## Core Principles

### I. Offline-First & Data Resiliency
All API endpoints and data models MUST prioritize offline-first capabilities. This includes supporting optimistic updates, maintaining sync queues, and providing robust conflict resolution (defaulting to last-write-wins). Batch operations MUST be supported to minimize network calls for users with intermittent connectivity.

### II. Multilingual Inclusivity
The platform serves a diverse linguistic demographic. All user-facing content (lessons, quizzes, feedback) MUST support Punjabi, Hindi, and English. API responses MUST include localized fields for these languages where applicable. Accessibility metadata is a requirement for all content.

### III. Optimized for Low-Bandwidth
The system MUST be performant in rural areas with limited connectivity. This requires mandatory response compression (Gzip/Brotli), field filtering (sparse fieldsets), and adaptive quality for multimedia assets (videos and images). Data transfer MUST be minimized without compromising educational value.

### IV. Layered Decoupling
The codebase MUST follow a strict layered architecture:
- **Routes**: Define entry points and attach middleware.
- **Controllers**: Handle request orchestration, input validation, and response formatting.
- **Services**: Contain all business logic and orchestrate model interactions.
- **Models**: Define data schemas, validation rules, and database hooks.
Business logic MUST NOT leak into controllers or routes.

### V. Strict Validation & Security
Every API request MUST be validated at the boundary using Zod schemas. Type safety is non-negotiable, enforced through TypeScript. Security follows the principle of least privilege, utilizing JWT-based stateless authentication and strict Role-Based Access Control (RBAC).

## Technology Stack & Standards

The project utilizes a modern, high-performance stack:
- **Runtime**: Node.js v22 LTS (ESM).
- **Language**: TypeScript 5.3+.
- **Framework**: Express.js v5.x.
- **Persistence**: MongoDB v7.x (Mongoose v9+) and Redis v7.x (Bull v4+ for queues).
- **Testing**: Jest and Supertest for unit/integration tests.
- **Infrastructure**: AWS S3/CloudFront for media delivery, Docker for containerization.

## Development Workflow

1. **Feature Specification**: Every feature begins with a spec and an implementation plan.
2. **Test-Driven Approach**: Tests SHOULD be written alongside implementation to ensure coverage and contract adherence.
3. **Code Quality**: Pre-commit hooks enforce linting (ESLint), formatting (Prettier), and type checking (TSC).
4. **Documentation**: OpenAPI/Swagger documentation MUST be updated for all API changes.

## Governance

- The Constitution is the supreme guide for project development.
- Amendments require a version increment (SemVer) and a Sync Impact Report.
- All Pull Requests must be reviewed for compliance with these principles.
- Runtime guidance is provided via `GEMINI.md`.

**Version**: 1.0.0 | **Ratified**: 2025-12-26 | **Last Amended**: 2025-12-26