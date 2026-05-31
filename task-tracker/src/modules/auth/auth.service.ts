import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { prisma } from '../../config/database';
import { env } from '../../config/env';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../utils/jwt';
import { ConflictError, UnauthorizedError, NotFoundError } from '../../utils/errors';
import { RegisterInput, LoginInput } from './auth.validator';
import { Role } from '@prisma/client';

export const registerService = async (input: RegisterInput) => {
  // Check if email already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (existingUser) {
    throw new ConflictError('Email already registered');
  }

  // Get or create organization
  let orgId: string;

  if (input.orgId) {
    const org = await prisma.organization.findUnique({
      where: { id: input.orgId },
    });
    if (!org) throw new NotFoundError('Organization');
    orgId = org.id;
  } else {
    const org = await prisma.organization.create({
      data: { name: input.orgName! },
    });
    orgId = org.id;
  }

  // Check if this is the first user in the org — make them ADMIN
  const userCount = await prisma.user.count({ where: { orgId } });
  const role = userCount === 0 ? Role.ADMIN : Role.MEMBER;

  // Hash password
  const passwordHash = await bcrypt.hash(input.password, env.bcryptSaltRounds);

  // Create user
  const user = await prisma.user.create({
    data: {
      email: input.email,
      passwordHash,
      firstName: input.firstName,
      lastName: input.lastName,
      role,
      orgId,
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      orgId: true,
      createdAt: true,
    },
  });

  return user;
};

export const loginService = async (input: LoginInput) => {
  // Find user with email
  const user = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (!user || !user.isActive) {
    throw new UnauthorizedError('Invalid email or password');
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(input.password, user.passwordHash);

  if (!isPasswordValid) {
    throw new UnauthorizedError('Invalid email or password');
  }

  // Build JWT payload
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role as any,
    orgId: user.orgId,
  };

  // Sign tokens
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  // Store refresh token in DB with expiry
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await prisma.refreshToken.create({
    data: {
      token: crypto.createHash('sha256').update(refreshToken).digest('hex'),
      userId: user.id,
      expiresAt,
    },
  });

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      orgId: user.orgId,
    },
  };
};

export const refreshTokenService = async (token: string) => {
  // Verify the token signature first
  const payload = verifyRefreshToken(token);

  // Check if token exists in DB and is not revoked
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const storedToken = await prisma.refreshToken.findUnique({
    where: { token: hashedToken },
  });

  if (!storedToken || storedToken.revoked || storedToken.expiresAt < new Date()) {
    throw new UnauthorizedError('Invalid or expired refresh token');
  }

  // Revoke old token (rotation)
  await prisma.refreshToken.update({
    where: { id: storedToken.id },
    data: { revoked: true },
  });

  // Issue new token pair
  const newPayload = {
    userId: payload.userId,
    email: payload.email,
    role: payload.role,
    orgId: payload.orgId,
  };

  const newAccessToken = signAccessToken(newPayload);
  const newRefreshToken = signRefreshToken(newPayload);

  // Store new refresh token
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await prisma.refreshToken.create({
    data: {
      token: crypto.createHash('sha256').update(newRefreshToken).digest('hex'),
      userId: payload.userId,
      expiresAt,
    },
  });

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};

export const logoutService = async (token: string) => {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  await prisma.refreshToken.updateMany({
    where: { token: hashedToken },
    data: { revoked: true },
  });
};