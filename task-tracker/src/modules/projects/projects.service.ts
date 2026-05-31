import { prisma } from '../../config/database';
import { NotFoundError } from '../../utils/errors';
import { CreateProjectInput, UpdateProjectInput } from './projects.validator';

export const createProjectService = async (
  input: CreateProjectInput,
  userId: string,
  orgId: string
) => {
  const project = await prisma.project.create({
    data: {
      name: input.name,
      description: input.description,
      orgId,
      createdById: userId,
    },
    select: {
      id: true,
      name: true,
      description: true,
      isActive: true,
      createdAt: true,
      createdBy: {
        select: { id: true, firstName: true, lastName: true },
      },
    },
  });

  return project;
};

export const getProjectsService = async (orgId: string) => {
  return prisma.project.findMany({
    where: { orgId, isActive: true },
    select: {
      id: true,
      name: true,
      description: true,
      isActive: true,
      createdAt: true,
      createdBy: {
        select: { id: true, firstName: true, lastName: true },
      },
      _count: { select: { tasks: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const getProjectByIdService = async (
  projectId: string,
  orgId: string
) => {
  const project = await prisma.project.findFirst({
    where: { id: projectId, orgId },
    select: {
      id: true,
      name: true,
      description: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      createdBy: {
        select: { id: true, firstName: true, lastName: true },
      },
      _count: { select: { tasks: true } },
    },
  });

  if (!project) throw new NotFoundError('Project');
  return project;
};

export const updateProjectService = async (
  projectId: string,
  input: UpdateProjectInput,
  orgId: string
) => {
  const project = await prisma.project.findFirst({
    where: { id: projectId, orgId },
  });

  if (!project) throw new NotFoundError('Project');

  return prisma.project.update({
    where: { id: projectId },
    data: input,
    select: {
      id: true,
      name: true,
      description: true,
      isActive: true,
      updatedAt: true,
    },
  });
};

export const deleteProjectService = async (
  projectId: string,
  orgId: string
) => {
  const project = await prisma.project.findFirst({
    where: { id: projectId, orgId },
  });

  if (!project) throw new NotFoundError('Project');

  await prisma.project.update({
    where: { id: projectId },
    data: { isActive: false },
  });
};