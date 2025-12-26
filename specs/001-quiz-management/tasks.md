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

## Phase 5: User Story 3 - View Quiz Progress (Priority: P2)

**Goal**: Users can view their quiz results and progress.
**Independent Test**: A student can view a list of quizzes they've taken and their scores.

### Tests for User Story 3 ⚠️

- [X] T025 [P] [US3] Add integration tests for progress viewing endpoints to `tests/integration/quiz.api.test.ts`.

### Implementation for User Story 3

- [X] T026 [US3] Implement service logic to retrieve a user's quiz attempts.
- [X] T027 [US3] Implement controller and route for `GET /progress/quizzes/me`.
- [X] T028 [US3] Implement service logic for teachers to view class analytics.
- [X] T029 [US3] Implement controller and route for teachers to view analytics.

**Checkpoint**: User Story 3 (Quiz Progress Viewing) should be fully functional.

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories.

- [X] T030 [P] Update OpenAPI documentation with all new endpoints in `specs/001-quiz-management/contracts/openapi.yaml`.
- [X] T031 [P] Review and refactor code for clarity, performance, and adherence to constitution.
- [X] T032 [P] Update `README.md` if necessary with new feature information.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 2)**: MUST be completed before any user story work begins.
- **User Stories (Phase 3+)**: All depend on the Foundational phase. User Story 1 and 2 can be developed in parallel, but User Story 3 depends on User Story 2 being complete.

### User Story Dependencies

- **User Story 1 (P1)**: Depends only on Foundational phase.
- **User Story 2 (P1)**: Depends only on Foundational phase. Can be developed in parallel with US1.
- **User Story 3 (P2)**: Depends on US2 (quiz attempt data must exist to be viewed).

---

## Implementation Strategy

### MVP First (User Stories 1 & 2)

1. Complete Phase 2: Foundational.
2. Complete Phase 3: User Story 1 (Teacher CRUD).
3. Complete Phase 4: User Story 2 (Student Submission).
4. **STOP and VALIDATE**: Teachers can create quizzes, and students can take them. This forms the core MVP.
5. Deploy/demo if ready.

### Incremental Delivery

1. Complete Foundational → Foundation ready.
2. Add User Story 1 → Test independently → Deploy/Demo.
3. Add User Story 2 → Test independently → Deploy/Demo.
4. Add User Story 3 → Test independently → Deploy/Demo.
5. Each story adds value without breaking previous stories.
