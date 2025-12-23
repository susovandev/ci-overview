import express from 'express';
import type { Application, Request, Response } from 'express';

import morganMiddleware from './middlewares/morgan.middleware';
import { notFoundHandler } from './middlewares/notFound.middleware';
import { errorHandler } from './middlewares/errorHandler.middleware';
import { REQUEST_BODY_LIMIT } from './constants';
import { appRoutes } from './routes/app.routes';

// Create express app
const app: Application = express();

// Add morgan middleware
app.use(morganMiddleware);

// Request Body middlewares
app.use(express.json({ limit: REQUEST_BODY_LIMIT }));
app.use(express.urlencoded({ extended: true, limit: REQUEST_BODY_LIMIT }));

// Health check endpoint
app.get('/health', (_req: Request, res: Response): Response => {
	return res.status(200).json({
		status: 'Success',
		message: 'Healthy',
		data: {
			uptime: process.uptime(),
			message: 'OK',
			timestamp: Date.now(),
			cpuUsage: process.cpuUsage(),
			memoryUsage: process.memoryUsage(),
			pid: process.pid,
			ppid: process.ppid,
			title: process.title,
			version: process.version,
			versions: process.versions,
			arch: process.arch,
			platform: process.platform,
			release: process.release,
			argv: process.argv,
			// env: process.env,
		},
	});
});

// Routes
appRoutes(app);

// Not found middleware
app.use(notFoundHandler);

// Error handler middleware
app.use(errorHandler);

export default app;
