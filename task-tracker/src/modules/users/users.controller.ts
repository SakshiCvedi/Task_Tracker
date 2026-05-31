import { Request, Response, NextFunction } from 'express';
import {
  getUsersService,
  getUserByIdService,
  updateUserRoleService,
  deactivateUserService,
} from './users.service';
import { sendSuccess, sendPaginated, sendNoContent } from '../../utils/response';
import { Role as PrismaRole } from '@prisma/client';

export const getUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const role = req.query.role as PrismaRole | undefined;

    const result = await getUsersService(req.user!.orgId, {
      page,
      limit,
      role,
    });
    sendPaginated(res, result.users, result.meta);
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = String(req.params.userId);
    const user = await getUserByIdService(userId, req.user!.orgId);
    sendSuccess(res, user);
  } catch (error) {
    next(error);
  }
};

export const updateUserRole = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = String(req.params.userId);
    const user = await updateUserRoleService(
      userId,
      req.body.role,
      req.user!.userId,
      req.user!.orgId
    );
    sendSuccess(res, user, 'User role updated successfully');
  } catch (error) {
    next(error);
  }
};

export const deactivateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = String(req.params.userId);
    await deactivateUserService(
      userId,
      req.user!.userId,
      req.user!.orgId
    );
    sendNoContent(res);
  } catch (error) {
    next(error);
  }
};