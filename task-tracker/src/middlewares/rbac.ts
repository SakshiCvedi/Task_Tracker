import { Request, Response, NextFunction } from 'express';
import { Role } from '../types';
import { ForbiddenError, UnauthorizedError } from '../utils/errors';

// Returns a middleware that only allows the specified roles
export const requireRole = (...allowedRoles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError());
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ForbiddenError(
          `This action requires one of these roles: ${allowedRoles.join(', ')}`
        )
      );
    }

    next();
  };
};

// Shorthand guards for common role combinations
export const adminOnly = requireRole(Role.ADMIN);
export const managerAndAbove = requireRole(Role.ADMIN, Role.MANAGER);
export const allRoles = requireRole(Role.ADMIN, Role.MANAGER, Role.MEMBER);