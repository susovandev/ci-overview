import dotenv from 'dotenv';
dotenv.config({ path: './.env' });
import { z } from 'zod';

const envSchema = z.object({
	NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
	PORT: z.coerce.number().default(3333),
	DATABASE_URI: z.string(),
	CLOUDINARY_CLOUD_NAME: z.string(),
	CLOUDINARY_API_KEY: z.string(),
	CLOUDINARY_API_SECRET: z.string(),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
	console.error('Invalid environment variables');
}

export const env = _env.data;
