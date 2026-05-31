import { Router } from 'express';
import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
} from './projects.controller';
import { authenticate } from '../../middlewares/authenticate';
import { managerAndAbove, allRoles } from '../../middlewares/rbac';
import { validate } from '../../middlewares/validate';
import { createProjectSchema, updateProjectSchema } from './projects.validator';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/', allRoles, getProjects);
router.get('/:projectId', allRoles, getProjectById);
router.post('/', validate(createProjectSchema), managerAndAbove, createProject);
router.patch('/:projectId', validate(updateProjectSchema), managerAndAbove, updateProject);
router.delete('/:projectId', managerAndAbove, deleteProject);

export default router;