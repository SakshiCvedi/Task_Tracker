import { Request, Response, NextFunction } from 'express';
import {
  registerService,
  loginService,
  refreshTokenService,
  logoutService,
} from './auth.service';
import { sendSuccess, sendCreated } from '../../utils/response';

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await registerService(req.body);
    sendCreated(res, user, 'Registration successful');
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await loginService(req.body);
    sendSuccess(res, result, 'Login successful');
  } catch (error) {
    next(error);
  }
};

export const refresh = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { refreshToken } = req.body;
    const tokens = await refreshTokenService(refreshToken);
    sendSuccess(res, tokens, 'Token refreshed successfully');
  } catch (error) {
    next(error);
  }
};

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { refreshToken } = req.body;
    await logoutService(refreshToken);
    sendSuccess(res, null, 'Logged out successfully');
  } catch (error) {
    next(error);
  }
};