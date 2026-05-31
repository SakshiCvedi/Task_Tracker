import { Request, Response, NextFunction } from 'express';
import {
  createProjectService,
  getProjectsService,
  getProjectByIdService,
  updateProjectService,
  deleteProjectService,
} from './projects.service';
import { sendSuccess, sendCreated, sendNoContent } from '../../utils/response';

export const createProject = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const project = await createProjectService(
      req.body,
      req.user!.userId,
      req.user!.orgId
    );
    sendCreated(res, project, 'Project created successfully');
  } catch (error) {
    next(error);
  }
};

export const getProjects = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const projects = await getProjectsService(req.user!.orgId);
    sendSuccess(res, projects);
  } catch (error) {
    next(error);
  }
};

export const getProjectById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const projectId = String(req.params.projectId);
    const project = await getProjectByIdService(projectId, req.user!.orgId);
    sendSuccess(res, project);
  } catch (error) {
    next(error);
  }
};

export const updateProject = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const projectId = String(req.params.projectId);
    const project = await updateProjectService(
      projectId,
      req.body,
      req.user!.orgId
    );
    sendSuccess(res, project, 'Project updated successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteProject = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const projectId = String(req.params.projectId);
    await deleteProjectService(projectId, req.user!.orgId);
    sendNoContent(res);
  } catch (error) {
    next(error);
  }
};