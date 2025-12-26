# Data Model: Student Authentication

## Entities

### User
- `_id`: ObjectId
- `email`: String (Unique, Indexed, Required)
- `password`: String (Hashed, Required, Private)
- `role`: String (Enum: ['student', 'teacher', 'admin'], Default: 'student')
- `profile`:
  - `firstName`: String (Required)
  - `lastName`: String (Required)
  - `language`: String (Enum: ['pa', 'hi', 'en'], Default: 'pa')
- `studentInfo`:
  - `schoolId`: ObjectId (Ref: School)
  - `class`: Number
  - `section`: String
- `refreshToken`: String (Private, Used for single session invalidation)
- `loginAttempts`: Number (Default: 0)
- `lockUntil`: Date (Used for 30s lockout)
- `lastLogin`: Date
- `createdAt`: Date
- `updatedAt`: Date

### School (Reference)
- `_id`: ObjectId
- `name`: String
- `schoolCode`: String (Unique, Indexed)

### AuditLog
- `_id`: ObjectId
- `userId`: ObjectId (Ref: User, Optional for failed logins)
- `action`: String (Enum: ['LOGIN_SUCCESS', 'LOGIN_FAILURE', 'REGISTER', 'LOCKOUT', 'REFRESH'])
- `details`: Object (e.g., failed reason, IP, userAgent)
- `ip`: String
- `userAgent`: String
- `timestamp`: Date (Default: Date.now)

## State Transitions
- **Guest** -> **Registered**: Via `POST /auth/register` (Creates AuditLog: REGISTER)
- **Registered** -> **Authenticated**: Via `POST /auth/login` (Creates AuditLog: LOGIN_SUCCESS, resets loginAttempts)
- **Registered** -> **Locked**: Via 5th failed `POST /auth/login` (Creates AuditLog: LOCKOUT, sets lockUntil)
- **Authenticated** -> **Refreshed**: Via `POST /auth/refresh`
- **Authenticated** -> **Guest**: Via `POST /auth/logout` (Invalidates refreshToken)