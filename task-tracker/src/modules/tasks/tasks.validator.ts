import { z } from 'zod';
import { TaskStatus, Priority } from '../../types';

export const createTaskSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required').max(200),
    description: z.string().max(1000).optional(),
    priority: z.nativeEnum(Priority, { message: 'Invalid priority' }).optional(),
    assigneeId: z.string().optional(),
    projectId: z.string().min(1, 'Project ID is required'),
    dueDate: z
      .string()
      .optional()
      .refine(
        (val) => !val || new Date(val) > new Date(),
        { message: 'due_date must be a future date' }
      ),
  }),
});

export const updateTaskSchema = z.object({
  params: z.object({
    taskId: z.string().min(1, 'Task ID is required'),
  }),
  body: z.object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().max(1000).optional(),
    priority: z.nativeEnum(Priority, { message: 'Invalid priority' }).optional(),
    assigneeId: z.string().nullable().optional(),
    dueDate: z
      .string()
      .nullable()
      .optional()
      .refine(
        (val) => !val || new Date(val) > new Date(),
        { message: 'due_date must be a future date' }
      ),
  }),
});

export const updateTaskStatusSchema = z.object({
  params: z.object({
    taskId: z.string().min(1, 'Task ID is required'),
  }),
  body: z.object({
    status: z.nativeEnum(TaskStatus, { message: 'Invalid status' }),
  }),
});

export const getTasksQuerySchema = z.object({
  query: z.object({
    page: z.string().optional().transform((val) => (val ? parseInt(val) : 1)),
    limit: z.string().optional().transform((val) => (val ? parseInt(val) : 10)),
    status: z.nativeEnum(TaskStatus).optional(),
    priority: z.nativeEnum(Priority).optional(),
    assigneeId: z.string().optional(),
    projectId: z.string().optional(),
  }),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>['body'];
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>['body'];
export type UpdateTaskStatusInput = z.infer<typeof updateTaskStatusSchema>['body'];
export type GetTasksQuery = z.infer<typeof getTasksQuerySchema>['query'];