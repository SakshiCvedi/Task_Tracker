console.log("===== APP TS LOADED =====");
import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import { prisma } from './config/database';
import { connectRedis } from './config/redis';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler';
import authRouter from './modules/auth/auth.router';
import usersRouter from './modules/users/users.router';
import projectsRouter from './modules/projects/projects.router';
import tasksRouter from './modules/tasks/tasks.router';

const app = express();
app.use(cors({
  origin: ['http://localhost:5173',
    'https://task-tracker-eta-drab-36.vercel.app'
  ],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.get('/api/test', (req, res) => {
  res.json({ status: 'ok',
    timestamp: new Date().toISOString(),
    environment: env.nodeEnv,
  });
});





// Body parsing




// Health check — always public, no auth
app.get('/health', async (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: env.nodeEnv,
  });
});

// --- Routes will be mounted here in the next steps ---
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/tasks', tasksRouter);

// 404 handler — must be after all routes
app.use(notFoundHandler);

// Global error handler — must be last
app.use(errorHandler);

const start = async (): Promise<void> => {
  try {
    // Test DB connection
    await prisma.$connect();
    console.log('Database connected');

    // Connect Redis
    await connectRedis();

    app.listen(env.port, () => {
      console.log(`Server running on port ${env.port} in ${env.nodeEnv} mode`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

start();

export default app;