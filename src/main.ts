import app from './app';
import { env } from './config/env.config';
import connectDB from './db/db';
import Logger from './lib/logger';

const port = env.PORT;
const node_env = env.NODE_ENV;

connectDB()
	.then(() => {
		app.listen(port, () => {
			Logger.info(`Server running in ${node_env} mode on http://localhost:${port}`);
			Logger.info(`Server Health check: http://localhost:${port}/health`);
			Logger.info(`Press CTRL+C to stop server`);
		});
	})
	.catch((error) => {
		Logger.error(`Unable to connect to database: ${error}`);
		process.exit(1);
	});
