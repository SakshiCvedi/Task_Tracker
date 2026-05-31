import { prisma } from '../../config/database';
import { redisClient, cacheKeys, CACHE_TTL } from '../../config/redis';
import {
  NotFoundError,
  ForbiddenError,
  BadRequestError,
} from '../../utils/errors';
import { TaskStatus, Priority, Role } from '../../types';
import { CreateTaskInput, UpdateTaskInput, GetTasksQuery } from './tasks.validator';

// Enforced status transition map
const ALLOWED_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  [TaskStatus.TODO]:        [TaskStatus.IN_PROGRESS, TaskStatus.BLOCKED],
  [TaskStatus.IN_PROGRESS]: [TaskStatus.IN_REVIEW, TaskStatus.BLOCKED],
  [TaskStatus.IN_REVIEW]:   [TaskStatus.DONE, TaskStatus.BLOCKED],
  [TaskStatus.DONE]:        [],
  [TaskStatus.BLOCKED]:     [TaskStatus.IN_PROGRESS],
};

// Invalidate all cache keys related to a task
const invalidateTaskCache = async (assigneeId?: string | null, orgId?: string) => {
  try {
    if (assigneeId) {
      await redisClient.del(cacheKeys.tasksByAssignee(assigneeId));
    }
    if (orgId) {
      await redisClient.del(cacheKeys.tasksByOrg(orgId));
    }
  } catch (err) {
    // Cache errors should never crash the app
    console.error('Cache invalidation error:', err);
  }
};

export const createTaskService = async (
  input: CreateTaskInput,
  userId: string,
  orgId: string
) => {
  // Verify project belongs to this org
  const project = await prisma.project.findFirst({
    where: { id: input.projectId, orgId },
  });
  if (!project) throw new NotFoundError('Project');

  // Verify assignee belongs to this org if provided
  if (input.assigneeId) {
    const assignee = await prisma.user.findFirst({
      where: { id: input.assigneeId, orgId },
    });
    if (!assignee) throw new NotFoundError('Assignee');
  }

  const task = await prisma.task.create({
    data: {
      title: input.title,
      description: input.description,
      priority: input.priority ?? Priority.MEDIUM,
      status: TaskStatus.TODO,
      assigneeId: input.assigneeId,
      projectId: input.projectId,
      dueDate: input.dueDate ? new Date(input.dueDate) : null,
      createdById: userId,
    },
    include: {
      assignee: { select: { id: true, firstName: true, lastName: true } },
      createdBy: { select: { id: true, firstName: true, lastName: true } },
      project: { select: { id: true, name: true } },
    },
  });

  await invalidateTaskCache(input.assigneeId, orgId);
  return task;
};

export const getTasksService = async (
  orgId: string,
  query: GetTasksQuery,
  requestingUser: { userId: string; role: string }
) => {
  const { page, limit, status, priority, assigneeId, projectId } = query;
  const skip = (page - 1) * limit;

  // MEMBERs can only see their own tasks
  const effectiveAssigneeId =
    requestingUser.role === Role.MEMBER
      ? requestingUser.userId
      : assigneeId;

  // Try cache for assignee-specific queries
  if (effectiveAssigneeId && !status && !priority && !projectId && page === 1) {
    try {
      const cached = await redisClient.get(
        cacheKeys.tasksByAssignee(effectiveAssigneeId)
      );
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (err) {
      console.error('Cache read error:', err);
    }
  }

  const where: any = {
    project: { orgId },
    ...(status && { status }),
    ...(priority && { priority }),
    ...(effectiveAssigneeId && { assigneeId: effectiveAssigneeId }),
    ...(projectId && { projectId }),
  };

  const [tasks, total] = await Promise.all([
    prisma.task.findMany({
      where,
      skip,
      take: limit,
      include: {
        assignee: { select: { id: true, firstName: true, lastName: true } },
        createdBy: { select: { id: true, firstName: true, lastName: true } },
        project: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.task.count({ where }),
  ]);

  const result = {
    tasks,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };

  // Cache assignee-specific first-page results
  if (effectiveAssigneeId && !status && !priority && !projectId && page === 1) {
    try {
      await redisClient.setEx(
        cacheKeys.tasksByAssignee(effectiveAssigneeId),
        CACHE_TTL.TASK_LIST,
        JSON.stringify(result)
      );
    } catch (err) {
      console.error('Cache write error:', err);
    }
  }

  return result;
};

export const getTaskByIdService = async (taskId: string, orgId: string) => {
  const task = await prisma.task.findFirst({
    where: { id: taskId, project: { orgId } },
    include: {
      assignee: { select: { id: true, firstName: true, lastName: true } },
      createdBy: { select: { id: true, firstName: true, lastName: true } },
      project: { select: { id: true, name: true } },
    },
  });

  if (!task) throw new NotFoundError('Task');
  return task;
};

export const updateTaskService = async (
  taskId: string,
  input: UpdateTaskInput,
  orgId: string
) => {
  const task = await prisma.task.findFirst({
    where: { id: taskId, project: { orgId } },
  });
  if (!task) throw new NotFoundError('Task');

  // Verify new assignee belongs to org if changing
  if (input.assigneeId) {
    const assignee = await prisma.user.findFirst({
      where: { id: input.assigneeId, orgId },
    });
    if (!assignee) throw new NotFoundError('Assignee');
  }

  const updated = await prisma.task.update({
    where: { id: taskId },
    data: {
      ...(input.title && { title: input.title }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.priority && { priority: input.priority }),
      ...(input.assigneeId !== undefined && { assigneeId: input.assigneeId }),
      ...(input.dueDate !== undefined && {
        dueDate: input.dueDate ? new Date(input.dueDate) : null,
      }),
    },
    include: {
      assignee: { select: { id: true, firstName: true, lastName: true } },
      createdBy: { select: { id: true, firstName: true, lastName: true } },
      project: { select: { id: true, name: true } },
    },
  });

  // Invalidate both old and new assignee caches
  await invalidateTaskCache(task.assigneeId, orgId);
  if (input.assigneeId && input.assigneeId !== task.assigneeId) {
    await invalidateTaskCache(input.assigneeId, orgId);
  }

  return updated;
};

export const updateTaskStatusService = async (
  taskId: string,
  newStatus: TaskStatus,
  requestingUser: { userId: string; role: string },
  orgId: string
) => {
  const task = await prisma.task.findFirst({
    where: { id: taskId, project: { orgId } },
  });
  if (!task) throw new NotFoundError('Task');

  // Only assignee or MANAGER+ can change status
  const isAssignee = task.assigneeId === requestingUser.userId;
  const isManagerOrAbove =
    requestingUser.role === Role.ADMIN ||
    requestingUser.role === Role.MANAGER;

  if (!isAssignee && !isManagerOrAbove) {
    throw new ForbiddenError('Only the assignee or a manager can update task status');
  }

  // Enforce transition rules
  const currentStatus = task.status as TaskStatus;
  const allowed = ALLOWED_TRANSITIONS[currentStatus];

  if (!allowed.includes(newStatus)) {
    throw new BadRequestError(
      `Cannot transition from ${currentStatus} to ${newStatus}. ` +
      `Allowed transitions: ${allowed.length ? allowed.join(', ') : 'none'}`
    );
  }

  const updated = await prisma.task.update({
    where: { id: taskId },
    data: { status: newStatus },
    include: {
      assignee: { select: { id: true, firstName: true, lastName: true } },
      project: { select: { id: true, name: true } },
    },
  });

  await invalidateTaskCache(task.assigneeId, orgId);
  return updated;
};

export const deleteTaskService = async (taskId: string, orgId: string) => {
  const task = await prisma.task.findFirst({
    where: { id: taskId, project: { orgId } },
  });
  if (!task) throw new NotFoundError('Task');

  await prisma.task.delete({ where: { id: taskId } });
  await invalidateTaskCache(task.assigneeId, orgId);
};