import { Router } from 'express';
import { register, login, refresh, logout } from './auth.controller';
import { validate } from '../../middlewares/validate';
import { authenticate } from '../../middlewares/authenticate';
import {
  registerSchema,
  loginSchema,
  refreshSchema,
} from './auth.validator';

const router = Router();

// Public routes
router.post('/register', validate(registerSchema), register);
router.post('/login',    validate(loginSchema),    login);
router.post('/refresh',  validate(refreshSchema),  refresh);

// Protected — must be logged in to logout
router.post('/logout', authenticate, logout);

export default router;