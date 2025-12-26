# Tasks: Quiz Management

**Input**: Design documents from `/specs/001-quiz-management/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), data-model.md, contracts/

**Tests**: Tasks for unit and integration tests are included as per the project constitution's emphasis on testing.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Paths shown below assume the project's `src/` and `tests/` structure at the repository root.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure. This phase is considered complete as the project is already set up.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented.

- [X] T001 [P] Create Mongoose model file for `Quiz` in `src/models/quiz/Quiz.model.ts`.
- [X] T002 [P] Create Zod validation schema file `Quiz.schema.ts` in `src/validation/schemas/`.
- [X] T003 [P] Create base `Quiz.controller.ts` file in `src/controller/`.
- [X] T004 [P] Create base `Quiz.service.ts` file in `src/services/`.
- [X] T005 [P] Create route file `Quiz.route.ts` in `src/routes/Quiz/`.
- [X] T006 Add the new Quiz route to the main router file `src/routes/index.ts`.

**Checkpoint**: Foundation for Quiz feature is ready. User story implementation can now begin.

---

## Phase 3: User Story 1 - Create and Manage Quizzes (Priority: P1) 🎯 MVP

**Goal**: Teachers can create, view, update, and delete quizzes.
**Independent Test**: A teacher can create a new quiz, add questions, save it, and then successfully retrieve and modify its details.

### Tests for User Story 1 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [X] T007 [P] [US1] Create integration test file `quiz.api.test.ts` in `tests/integration/` for Quiz CRUD endpoints.
- [X] T008 [P] [US1] Create unit test file `quiz.service.test.ts` in `tests/unit/` for quiz creation logic.

### Implementation for User Story 1

- [X] T009 [P] [US1] Implement the `Quiz` schema in `src/models/quiz/Quiz.model.ts` based on `data-model.md`.
- [X] T010 [P] [US1] Implement Zod schemas for `createQuiz` and `updateQuiz` in `src/validation/schemas/Quiz.schema.ts`.
- [X] T011 [US1] Implement `createQuiz` service logic in `src/services/Quiz.service.ts`.
- [X] T012 [US1] Implement `createQuiz` controller and link to route in `src/controller/Quiz.controller.ts` and `src/routes/Quiz/Quiz.route.ts`. (Endpoint: `POST /quizzes`)
- [X] T013 [US1] Implement `getQuizById` service logic in `src/services/Quiz.service.ts`.
- [X] T014 [US1] Implement `getQuizById` controller and link to route. (Endpoint: `GET /quizzes/:id`)
- [X] T015 [US1] Implement `updateQuiz` service logic in `src/services/Quiz.service.ts`.
- [X] T016 [US1] Implement `updateQuiz` controller and link to route. (Endpoint: `PATCH /quizzes/:id`)
- [X] T017 [US1] Implement `deleteQuiz` (soft delete) service logic in `src/services/Quiz.service.ts`.
- [X] T018 [US1] Implement `deleteQuiz` controller and link to route. (Endpoint: `DELETE /quizzes/:id`)

**Checkpoint**: User Story 1 (Quiz CRUD for Teachers) should be fully functional and testable independently.

---

## Phase 4: User Story 2 - Student Takes a Quiz (Priority: P1)

**Goal**: Students can attempt quizzes, submit answers, and receive feedback.
**Independent Test**: A student can attempt a quiz, submit it, and see their score and correct answers.

### Tests for User Story 2 ⚠️

- [X] T019 [P] [US2] Add integration tests for quiz submission endpoint to `tests/integration/quiz.api.test.ts`.
- [X] T020 [P] [US2] Add unit tests for quiz submission and scoring logic to `tests/unit/quiz.service.test.ts`.

### Implementation for User Story 2

- [X] T021 [P] [US2] Implement Zod schema for `submitQuizAttempt` in `src/validation/schemas/Quiz.schema.ts`.
- [X] T022 [US2] Implement `submitQuizAttempt` service logic in `src/services/Quiz.service.ts`, including scoring.
- [X] T023 [US2] Implement `submitQuizAttempt` controller and link to route. (Endpoint: `POST /quizzes/:id/attempt`)
- [X] T024 [US2] Update `getQuizById` service/controller to handle student requests (e.g., exclude correct answers before submission).

**Checkpoint**: User Story 2 (Quiz submission for Students) should be fully functional and testable independently.

---

## Phase 5: User Story 3 - View Quiz Progress and Analytics (Priority: P2)

**Goal**: Users can view their quiz results and teachers can view analytics.
**Independent Test**: A student can view a list of quizzes they've taken and their scores.

### Tests for User Story 3 ⚠️

- [X] T025 [P] [US3] Add integration tests for progress and analytics endpoints to `tests/integration/quiz.api.test.ts`.

### Implementation for User Story 3

- [X] T026 [US3] Implement service logic to retrieve a user's quiz attempts in `src/services/Quiz.service.ts`.
- [X] T027 [US3] Implement controller and route for `GET /progress/quizzes/me` in `src/controller/Quiz.controller.ts` and `src/routes/Quiz/Quiz.route.ts`.
- [X] T028 [US3] Implement service logic for teachers to view quiz analytics (aggregated stats) in `src/services/Quiz.service.ts`.
- [X] T029 [US3] Implement controller and route for `GET /quizzes/:id/analytics` in `src/controller/Quiz.controller.ts`.

**Checkpoint**: User Story 3 (Progress and Analytics) should be fully functional.

---

## Phase 6: Performance & Cross-Cutting Features (P1/P2)

**Purpose**: Addressing specific requirements for Rate Limiting, Observability, and Offline Sync.

- [X] T030 [P] Implement rate limiting middleware for global and user-specific limits in `src/middleware/rateLimit.middleware.ts` (RL-001, RL-002).
- [X] T031 [P] Configure rate limiting for quiz routes in `src/routes/Quiz/Quiz.route.ts`.
- [X] T032 [P] Implement metrics emission for quiz creation, attempts, and scores in `src/services/Quiz.service.ts` (SC-008).
- [X] T033 [P] Update logging across `Quiz.service.ts` and `Quiz.controller.ts` to follow constitution levels (INFO, WARN, ERROR) (SC-009).
- [X] T034 [US2] Integrate `submitQuizAttempt` with offline sync queue logic in `src/services/Quiz.service.ts` (FR-007).

---

## Phase N: Polish & Validation

- [X] T035 [P] Update OpenAPI documentation in `specs/001-quiz-management/contracts/openapi.yaml` (T030 previously).
- [X] T036 [P] Review and refactor code for clarity and performance (T031 previously).
- [X] T037 [P] Update `README.md` if necessary (T032 previously).
- [ ] T038 Final validation against all SC-00X measurable outcomes.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 2 (Foundational)**: MUST be completed before any user story.
- **Phase 3 & 4 (US1 & US2)**: Core functional requirements (MVP). Can be parallel.
- **Phase 5 (US3)**: Depends on US2 for attempt data.
- **Phase 6 (Cross-Cutting)**: Can proceed after respective functional foundations are ready.

---

## Implementation Strategy

### MVP First (User Stories 1 & 2)

1. Complete Phase 2: Foundational.
2. Complete Phase 3: User Story 1 (Teacher CRUD).
3. Complete Phase 4: User Story 2 (Student Submission).
4. **VALIDATE**: Core quiz flow works.

### Incremental Delivery

1. Foundation → Foundation ready.
2. US1 → Teacher functionality.
3. US2 → Student functionality.
4. US3 → Progress & Analytics.
5. Phase 6 → Production hardening (Rate limit, Sync, Metrics).