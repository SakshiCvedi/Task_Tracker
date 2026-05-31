import { createClient } from 'redis';
import { env } from './env';

export const redisClient = createClient({
  url: env.redisUrl,
});

redisClient.on('error', (err) => {
  console.error('Redis connection error:', err);
});

redisClient.on('connect', () => {
  console.log('Redis connected');
});

export const connectRedis = async (): Promise<void> => {
  await redisClient.connect();
};

// Cache TTL constants — all in seconds
export const CACHE_TTL = {
  TASK_LIST: 60 * 5,   // 5 minutes
};

// Key builder — keeps all cache keys in one place
export const cacheKeys = {
  tasksByAssignee: (userId: string) => `tasks:assignee:${userId}`,
  tasksByOrg: (orgId: string) => `tasks:org:${orgId}`,
};