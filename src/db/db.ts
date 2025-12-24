import mongoose from 'mongoose';
import Logger from '../lib/logger';
import { env } from '../config/env.config';

const connectDB = async () => {
	try {
		const connectionInstance = await mongoose.connect(env!.DATABASE_URI);
		Logger.info(`MongoDB Connected: ${connectionInstance.connection.host}`);
	} catch (error) {
		console.error(error);
		throw error;
	}
};

export default connectDB;
