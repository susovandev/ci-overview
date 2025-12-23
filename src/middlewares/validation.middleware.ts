import type { NextFunction, Request, Response } from 'express';
import { ZodError, z } from 'zod';
import { BadRequestError } from '../lib/error';
import { StatusCodes } from 'http-status-codes';

/**
 * Create a comprehensive zod request validation middleware
 * @param {z.ZodType<any>} schema - The zod schema to validate against
 * @param {'body' | 'params' | 'query'} location - The location of the request to validate
 * @returns {import('express').NextFunction} - The middleware function
 */

type Location = 'body' | 'params' | 'query';
export const validationMiddleware = (schema: z.ZodType, location: Location = 'body') => {
	return async (req: Request, res: Response, next: NextFunction) => {
		try {
			// Use parseAsync so Zod throws on invalid data (safeParseAsync returns a result)
			await schema.parseAsync(req[location]);
			return next();
		} catch (error) {
			if (error instanceof ZodError) {
				const badRequestError = new BadRequestError(
					'Invalid request data',
					error.issues.map((issue) => ({
						message: issue.message,
					})),
				);
				return res.status(StatusCodes.BAD_REQUEST).json(badRequestError);
			}
			return next(error);
		}
	};
};
