import { Router } from 'express';
import {
  getUsers,
  getUserById,
  updateUserRole,
  deactivateUser,
} from './users.controller';
import { authenticate } from '../../middlewares/authenticate';
import { adminOnly } from '../../middlewares/rbac';
import { validate } from '../../middlewares/validate';
import { updateUserRoleSchema, getUsersQuerySchema } from './users.validator';

const router = Router();

// All user management is ADMIN only
router.get('/',                validate(getUsersQuerySchema), authenticate, adminOnly, getUsers);
router.get('/:userId',         authenticate, adminOnly, getUserById);
router.patch('/:userId/role',  validate(updateUserRoleSchema), authenticate, adminOnly, updateUserRole);
router.delete('/:userId',      authenticate, adminOnly, deactivateUser);

export default router;