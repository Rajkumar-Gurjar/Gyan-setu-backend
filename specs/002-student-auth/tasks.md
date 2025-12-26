# Tasks: Student Authentication

**Input**: Design documents from `/specs/002-student-auth/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are included as per the project constitution's emphasis on quality and security auditing.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Paths assume single project structure: `src/`, `tests/` at repository root.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and core security dependencies.

- [X] T001 Install dependencies: `npm install jsonwebtoken bcryptjs`
- [ ] T002 Configure environment variables in `.env` (`JWT_SECRET`, `JWT_REFRESH_SECRET`)
- [X] T003 [P] Create `AuditLog` model in `src/models/AuditLog.model.ts`
- [X] T004 [P] Create `School` model in `src/models/School.model.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure needed for all authentication flows.

- [X] T005 [P] Create `User` model with lockout fields in `src/models/User.model.ts`
- [X] T006 [P] Implement `Auth.schema.ts` with Zod validation in `src/validation/schemas/Auth.schema.ts`
- [X] T007 Implement base `Auth.service.ts` with password hashing utility in `src/services/Auth.service.ts`
- [X] T008 [P] Setup `Auth.controller.ts` structure in `src/controller/Auth.controller.ts`
- [X] T009 [P] Setup `Auth.route.ts` and register in `src/routes/index.ts`

**Checkpoint**: Foundation ready - Authentication flows can now be implemented.

---

## Phase 3: User Story 1 - Student Registration (Priority: P1) 🎯 MVP

**Goal**: Enable new students to register with school code validation and audit logging.

**Independent Test**: POST `/api/v1/auth/register` with valid data creates user and returns tokens.

### Tests for User Story 1 ⚠️

- [X] T010 [P] [US1] Create integration test for registration in `tests/integration/auth.api.test.ts`
- [X] T011 [P] [US1] Create unit test for registration logic in `tests/unit/auth.service.test.ts`

### Implementation for User Story 1

- [X] T012 [US1] Implement school code validation logic in `src/services/Auth.service.ts`
- [X] T013 [US1] Implement student registration logic with AuditLog (REGISTER) in `src/services/Auth.service.ts`
- [X] T014 [US1] Implement `register` controller method in `src/controller/Auth.controller.ts`
- [X] T015 [US1] Map registration route in `src/routes/Auth/Auth.route.ts`

**Checkpoint**: User Story 1 functional - Students can register.

---

## Phase 4: User Story 2 - Student Login & Lockout (Priority: P1)

**Goal**: Secure login with single-session enforcement, 30s lockout, and audit logging.

**Independent Test**: Valid login returns tokens; 5 failed attempts trigger 423 Locked for 30s.

### Tests for User Story 2 ⚠️

- [X] T016 [P] [US2] Add integration tests for login and lockout to `tests/integration/auth.api.test.ts`
- [X] T017 [P] [US2] Add unit tests for lockout logic to `tests/unit/auth.service.test.ts`

### Implementation for User Story 2

- [X] T018 [US2] Implement login logic with lockout check and AuditLog (LOGIN_SUCCESS/FAILURE) in `src/services/Auth.service.ts`
- [X] T019 [US2] Implement single-session enforcement (invalidate/overwrite refreshToken) in `src/services/Auth.service.ts`
- [X] T020 [US2] Implement `login` controller method in `src/controller/Auth.controller.ts`
- [X] T021 [US2] Map login route in `src/routes/Auth/Auth.route.ts`

**Checkpoint**: User Story 2 functional - Secure login and lockout active.

---

## Phase 5: User Story 3 - Token Refresh (Priority: P2)

**Goal**: Support seamless session extension via refresh tokens.

**Independent Test**: POST `/api/v1/auth/refresh` returns a new access token for a valid refresh token.

### Tests for User Story 3 ⚠️

- [ ] T022 [P] [US3] Add integration tests for refresh token to `tests/integration/auth.api.test.ts`

### Implementation for User Story 3

- [ ] T023 [US3] Implement token refresh logic in `src/services/Auth.service.ts`
- [ ] T024 [US3] Implement `refresh` controller method in `src/controller/Auth.controller.ts`
- [ ] T025 [US3] Map refresh route in `src/routes/Auth/Auth.route.ts`

**Checkpoint**: All core authentication stories functional.

---

## Phase N: Polish & Cross-Cutting Concerns

- [ ] T026 [P] Document auth endpoints in `specs/002-student-auth/contracts/openapi.yaml`
- [ ] T027 [P] Add error handling for JWT expiration in middleware
- [ ] T028 Final code review and cleanup against constitution principles

---

## Dependencies & Execution Order

### Phase Dependencies

1. **Setup (Phase 1)**: Must be first.
2. **Foundational (Phase 2)**: Depends on Phase 1. Blocks US1, US2, US3.
3. **User Stories (Phase 3-5)**: Can be implemented in sequence (US1 -> US2 -> US3). US2 depends on US1 (User entity exists). US3 depends on US2 (Refresh token issued).

### Parallel Opportunities

- T003, T004 (Phase 1 models)
- T005, T006, T008, T009 (Phase 2 infrastructure)
- T010, T011 (Phase 3 tests)
- T016, T017 (Phase 4 tests)

---

## Implementation Strategy

### MVP First (User Story 1 & 2)

1. Complete Phase 1 & 2.
2. Complete Phase 3 (Registration).
3. Complete Phase 4 (Login & Lockout).
4. **VALIDATE**: A student can register, then login, and the account locks correctly on failure.

### Incremental Delivery

1. Setup + Foundation -> Infrastructure ready.
2. US1 -> Onboarding ready.
3. US2 -> Secure access ready (MVP).
4. US3 -> UX improvement (Session persistence).
