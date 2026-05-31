import { prisma } from '../../config/database';
import { NotFoundError, ForbiddenError } from '../../utils/errors';
import { Role as PrismaRole } from '@prisma/client';

export const getUsersService = async (
  orgId: string,
  query: { page: number; limit: number; role?: PrismaRole }
) => {
  const { page, limit, role } = query;
  const skip = (page - 1) * limit;

  const where = {
    orgId,
    ...(role && { role }),
  };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    users,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getUserByIdService = async (userId: string, orgId: string) => {
  const user = await prisma.user.findFirst({
    where: { id: userId, orgId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) throw new NotFoundError('User');
  return user;
};

export const updateUserRoleService = async (
  targetUserId: string,
  newRole: PrismaRole,
  requestingUserId: string,
  orgId: string
) => {
  if (targetUserId === requestingUserId) {
    throw new ForbiddenError('You cannot change your own role');
  }

  const user = await prisma.user.findFirst({
    where: { id: targetUserId, orgId },
  });

  if (!user) throw new NotFoundError('User');

  const updated = await prisma.user.update({
    where: { id: targetUserId },
    data: { role: newRole },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
    },
  });

  return updated;
};

export const deactivateUserService = async (
  targetUserId: string,
  requestingUserId: string,
  orgId: string
) => {
  if (targetUserId === requestingUserId) {
    throw new ForbiddenError('You cannot deactivate your own account');
  }

  const user = await prisma.user.findFirst({
    where: { id: targetUserId, orgId },
  });

  if (!user) throw new NotFoundError('User');

  await prisma.user.update({
    where: { id: targetUserId },
    data: { isActive: false },
  });
};