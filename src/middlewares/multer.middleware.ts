import multer from 'multer';
import path from 'node:path';
import type { Request } from 'express';
import { MULTER_DESTINATION, MULTER_FILE_SIZE } from '../constants';

// Define storage strategy
const storage = multer.diskStorage({
	destination: (
		_req: Request,
		_file: Express.Multer.File,
		cb: (error: Error | null, destination: string) => void,
	) => {
		cb(null, MULTER_DESTINATION);
	},
	filename: (
		_req: Request,
		file: Express.Multer.File,
		cb: (error: Error | null, filename: string) => void,
	) => {
		const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
		cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
	},
});

// File filter (optional)
const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
	if (file.mimetype.startsWith('image/')) {
		cb(null, true);
	} else {
		cb(new Error('Invalid file type, only JPEG and PNG allowed'));
	}
};

// Initialize Multer
const upload = multer({
	storage: storage,
	fileFilter: fileFilter,
	limits: {
		fileSize: MULTER_FILE_SIZE,
	},
});

export default upload;
