import { Response } from 'express';

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export const sendSuccess = (
  res: Response,
  data: unknown,
  message = 'Success',
  statusCode = 200
): void => {
  res.status(statusCode).json({
    status: statusCode,
    message,
    data,
  });
};

export const sendCreated = (
  res: Response,
  data: unknown,
  message = 'Created successfully'
): void => {
  sendSuccess(res, data, message, 201);
};

export const sendPaginated = (
  res: Response,
  data: unknown,
  meta: PaginationMeta,
  message = 'Success'
): void => {
  res.status(200).json({
    status: 200,
    message,
    data,
    meta,
  });
};

export const sendNoContent = (res: Response): void => {
  res.status(204).send();
};