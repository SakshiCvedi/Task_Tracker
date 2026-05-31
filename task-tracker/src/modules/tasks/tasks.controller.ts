import { Request, Response, NextFunction } from 'express';
import {
  createTaskService,
  getTasksService,
  getTaskByIdService,
  updateTaskService,
  updateTaskStatusService,
  deleteTaskService,
} from './tasks.service';
import { sendSuccess, sendCreated, sendPaginated, sendNoContent } from '../../utils/response';
import { TaskStatus, Priority } from '../../types';

export const createTask = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const task = await createTaskService(
      req.body,
      req.user!.userId,
      req.user!.orgId
    );
    sendCreated(res, task, 'Task created successfully');
  } catch (error) {
    next(error);
  }
};

export const getTasks = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const query = {
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 10,
      status: req.query.status as TaskStatus | undefined,
      priority: req.query.priority as Priority | undefined,
      assigneeId: req.query.assigneeId as string | undefined,
      projectId: req.query.projectId as string | undefined,
    };

    const result = await getTasksService(
      req.user!.orgId,
      query,
      { userId: req.user!.userId, role: req.user!.role }
    );

    sendPaginated(res, result.tasks, result.meta);
  } catch (error) {
    next(error);
  }
};

export const getTaskById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const taskId = String(req.params.taskId);
    const task = await getTaskByIdService(taskId, req.user!.orgId);
    sendSuccess(res, task);
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const taskId = String(req.params.taskId);
    const task = await updateTaskService(taskId, req.body, req.user!.orgId);
    sendSuccess(res, task, 'Task updated successfully');
  } catch (error) {
    next(error);
  }
};

export const updateTaskStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const taskId = String(req.params.taskId);
    const task = await updateTaskStatusService(
      taskId,
      req.body.status,
      { userId: req.user!.userId, role: req.user!.role },
      req.user!.orgId
    );
    sendSuccess(res, task, 'Task status updated successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const taskId = String(req.params.taskId);
    await deleteTaskService(taskId, req.user!.orgId);
    sendNoContent(res);
  } catch (error) {
    next(error);
  }
};