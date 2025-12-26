import { Router } from 'express';
import AuthController from '../../controller/Auth.controller';
import { validate } from '../../middleware/validation.middleware';
import { registerSchema, loginSchema, refreshTokenSchema } from '../../validation/schemas/Auth.schema';

const router = Router();

router.post('/register', validate(registerSchema), AuthController.register);

router.post('/login', validate(loginSchema), AuthController.login);

router.post('/refresh', validate(refreshTokenSchema), AuthController.refresh);

export default router;
