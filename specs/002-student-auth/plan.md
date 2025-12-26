# Implementation Plan: Student Authentication

**Branch**: `002-student-auth` | **Date**: 2025-12-26 | **Spec**: specs/002-student-auth/spec.md
**Input**: Feature specification from `/specs/002-student-auth/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary
Implement a secure, stateless authentication system for students using JWT (Access/Refresh tokens) and bcrypt password hashing. Key features include school code validation, a 30-second lockout policy after 5 failed attempts, single-session enforcement, and a dedicated audit log for security events.

## Technical Context

**Language/Version**: TypeScript 5.3+, Node.js v22+
**Primary Dependencies**: jsonwebtoken, bcryptjs, express, mongoose, zod
**Storage**: MongoDB (Users, AuditLogs, Schools), Redis (Optional)
**Testing**: Jest, Supertest
**Target Platform**: Node.js v22 LTS
**Project Type**: Single project (Backend API)
**Performance Goals**: Auth endpoints < 200ms p95
**Constraints**: Stateless auth, unique email, hashed passwords, 30s lockout, AuditLog compliance
**Scale/Scope**: 10k users initially

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Offline-First**: Auth tokens will be cached on client; login/register requires online connection.
- [x] **Multilingual**: Profile schema includes `language` preference (pa, hi, en).
- [x] **Bandwidth**: JSON responses are minimal; standard compression applies.
- [x] **Layering**: Auth logic strictly in `Auth.service.ts`.
- [x] **Validation**: Zod schemas defined for Registration and Login payloads.

## Project Structure

### Documentation (this feature)

```text
specs/002-student-auth/
├── plan.md              # This file
├── research.md          # Completed
├── data-model.md        # Updated with AuditLog
├── quickstart.md        # Updated
├── contracts/           # Updated with Lockout errors
└── tasks.md             # To be created
```

### Source Code (repository root)

```text
src/
├── controller/
│   └── Auth.controller.ts
├── models/
│   ├── User.model.ts
│   └── AuditLog.model.ts
├── services/
│   └── Auth.service.ts
├── routes/
│   └── Auth/
│       └── Auth.route.ts
└── validation/
    └── schemas/
        └── Auth.schema.ts

tests/
├── integration/
│   └── auth.api.test.ts
└── unit/
    └── auth.service.test.ts
```

**Structure Decision**: Single project structure (Option 1).

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |
