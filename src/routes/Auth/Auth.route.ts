import { Router } from 'express';
import AuthController from '../../controller/Auth.controller';
import { validate } from '../../middleware/validation.middleware';
import { registerSchema, loginSchema } from '../../validation/schemas/Auth.schema';

const router = Router();

router.post('/register', validate(registerSchema), AuthController.register);

router.post('/login', validate(loginSchema), AuthController.login);

// Placeholder for refresh token route
router.post('/refresh', AuthController.refresh);

export default router;
