import { z } from 'zod';
import { Role } from '../../types';

export const updateUserRoleSchema = z.object({
  params: z.object({
    userId: z.string().min(1, 'User ID is required'),
  }),
  body: z.object({
    role: z.nativeEnum(Role, { message: 'Invalid role'}),
  }),
});

export const getUsersQuerySchema = z.object({
  query: z.object({
    page: z.string().optional().transform((val) => (val ? parseInt(val) : 1)),
    limit: z.string().optional().transform((val) => (val ? parseInt(val) : 10)),
    role: z.nativeEnum(Role).optional(),
  }),
});

export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;
export type GetUsersQuery = z.infer<typeof getUsersQuerySchema>['query'];