# Gyan-setu-backend Development Guidelines

Auto-generated from all feature plans. Last updated: 2025-12-25

## Active Technologies
- TypeScript 5.3+, Node.js v22+ + jsonwebtoken, bcryptjs, express, mongoose, zod (002-student-auth)
- MongoDB (Users), Redis (Optional: Session blacklisting) (002-student-auth)
- MongoDB (Users, AuditLogs, Schools), Redis (Optional) (002-student-auth)

- TypeScript 5.3+, Node.js v22+ + Express.js v5+, Mongoose v9+, Zod, Redis (001-quiz-management)
- MongoDB v7.x (primary data), Redis v7.x (caching, queue for offline sync) (001-quiz-management)

## Project Structure

```text
src/
├── controller/
├── models/
├── routes/
├── services/
└── validation/schemas
tests/
├── unit/
└── integration/
```

## Commands

npm test; npm run lint

## Code Style

TypeScript: Follow standard conventions

## Recent Changes
- 002-student-auth: Added TypeScript 5.3+, Node.js v22+ + jsonwebtoken, bcryptjs, express, mongoose, zod
- 002-student-auth: Added TypeScript 5.3+, Node.js v22+ + jsonwebtoken, bcryptjs, express, mongoose, zod

- 001-quiz-management: Added TypeScript 5.3+, Node.js v22+ + Express.js v5+, Mongoose v9+, Zod, Redis

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
