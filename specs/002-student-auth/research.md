# Research: Student Authentication

## JWT Strategy
- **Decision**: Use `jsonwebtoken` for signing and `bcryptjs` for hashing.
- **Rationale**: Standard industry libraries for Node.js.
- **Details**: 
  - Access Token: 15 minutes.
  - Refresh Token: 7 days, stored in MongoDB for revocation support.
  - Secret Management: Use `.env` variables.

## Password Hashing
- **Decision**: Use `bcrypt` with 10 salt rounds.
- **Rationale**: Balanced security and performance.

## Multilingual Support in Profile
- **Decision**: Use an `enum` for `language` in the User model (`pa`, `hi`, `en`).
- **Rationale**: Direct alignment with PRD and Constitution.

## Account Lockout Mechanism
- **Decision**: Store `loginAttempts` and `lockUntil` directly on the `User` model in MongoDB.
- **Rationale**: Since the lockout duration is short (30s) and specific to the user account, MongoDB is sufficient and reduces dependency on Redis for core auth state.
- **Implementation**: Pre-save hook or service logic to check `lockUntil` before verifying password.

## Security Auditing
- **Decision**: Implement a dedicated `AuditLog` collection.
- **Rationale**: Required for government compliance. 
- **Fields**: `userId`, `action` (LOGIN_SUCCESS, LOGIN_FAILURE, REGISTER, LOCKOUT), `ip`, `userAgent`, `timestamp`.