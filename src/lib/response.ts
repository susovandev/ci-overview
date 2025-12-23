import type { Response } from 'express';

export class ApiResponse<T> {
	public status: boolean;
	constructor(
		public statusCode: number,
		public message: string = 'OK',
		public data?: T,
	) {
		this.status = true;
		this.statusCode = statusCode;
		this.message = message;
		this.data = data;
	}
}
export const sendResponse = (
	res: Response,
	statusCode: number,
	message?: string,
	data?: unknown,
): Response => {
	return res.status(statusCode).json(new ApiResponse(statusCode, message, data));
};
