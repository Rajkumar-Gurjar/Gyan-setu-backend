# Quickstart: Student Authentication

## Local Setup
1. Ensure MongoDB is running.
2. Set `JWT_SECRET` and `JWT_REFRESH_SECRET` in `.env`.
3. Run `npm install jsonwebtoken bcryptjs`.
4. Run `npm run dev`.

## Example Registration
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d 
    "{
    "email": "test@student.com",
    "password": "Password123!",
    "profile": { "firstName": "Test", "lastName": "Student", "language": "pa" },
    "studentInfo": { "schoolCode": "NABHA_01", "class": 8 }
  }"
```

## Testing Account Lockout
1. Attempt to login with wrong password 5 times.
2. Verify 6th attempt returns 423 Locked.
3. Wait 30 seconds and verify login works again with correct credentials.

## Running Tests
```bash
npm test tests/integration/auth.api.test.ts
```