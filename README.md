# GyaanSetu Backend API

The GyaanSetu Backend API is the central data and business logic layer for the GyaanSetu digital learning platform. It provides a robust, offline-first, and multilingual RESTful API to support students, teachers, and administrators in the Punjab education ecosystem.

## Core Features

### 1. Student Authentication
- **Secure Registration**: Register with school code validation.
- **JWT-Based Auth**: Stateless authentication using Access and Refresh tokens.
- **Security**: Password hashing with bcrypt, account lockout after failed attempts, and audit logging of security events.
- **Single Session**: Enforcement of single active sessions per user.

### 2. Quiz Management
- **Teacher Controls**: Create, update, and manage quizzes with multiple question types (MCQ, True/False, Fill-in-the-blank, Image Choice).
- **Student Assessments**: Students can attempt quizzes, submit answers, and receive immediate scores and feedback.
- **Progress Tracking**: Detailed tracking of student progress and historical quiz performance.
- **Analytics**: Aggregated quiz analytics for teachers to monitor class performance and identify common areas of difficulty.

## Technology Stack

- **Runtime**: Node.js v22+
- **Language**: TypeScript 5.3+
- **Framework**: Express.js v5+
- **Database**: MongoDB v7.x (with Mongoose v9+)
- **Validation**: Zod
- **Testing**: Jest & Supertest

## Getting Started

### Prerequisites
- Node.js (v22 or higher)
- MongoDB (v7 or higher)
- Redis (optional, for caching/queues)

### Installation
1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables in a `.env` file:
   ```env
   PORT=3000
   MONGO_URI=mongodb://localhost:27017/gyan-setu
   JWT_SECRET=your_jwt_secret
   JWT_REFRESH_SECRET=your_jwt_refresh_secret
   ```

### Running the Application
- **Development Mode**:
  ```bash
  npm run dev
  ```
- **Build**:
  ```bash
  npm run build
  ```
- **Tests**:
  ```bash
  npm test
  ```

## API Documentation
OpenAPI specifications are available in the `specs/` directory:
- [Student Auth API](specs/002-student-auth/contracts/openapi.yaml)
- [Quiz Management API](specs/001-quiz-management/contracts/openapi.yaml)
