import { Router } from 'express';
import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  updateTaskStatus,
  deleteTask,
} from './tasks.controller';
import { authenticate } from '../../middlewares/authenticate';
import { managerAndAbove, allRoles } from '../../middlewares/rbac';
import { validate } from '../../middlewares/validate';
import {
  createTaskSchema,
  updateTaskSchema,
  updateTaskStatusSchema,
  getTasksQuerySchema,
} from './tasks.validator';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get(
  '/',
  validate(getTasksQuerySchema),
  allRoles,
  getTasks
);

router.get(
  '/:taskId',
  allRoles,
  getTaskById
);

router.post(
  '/',
  validate(createTaskSchema),
  managerAndAbove,
  createTask
);

router.patch(
  '/:taskId',
  validate(updateTaskSchema),
  managerAndAbove,
  updateTask
);

// Separate endpoint for status — assignee OR manager can call this
router.patch(
  '/:taskId/status',
  validate(updateTaskStatusSchema),
  allRoles,
  updateTaskStatus
);

router.delete(
  '/:taskId',
  managerAndAbove,
  deleteTask
);

export default router;