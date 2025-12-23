import { v2 as cloudinary } from 'cloudinary';
import type { UploadApiResponse, UploadApiOptions } from 'cloudinary';
import Logger from './logger';
import { env } from '../config/env.config';
import { InternalServerError } from './error';
import { CLOUDINARY_FOLDER_NAME } from '../constants';
import unlinkLocalFilePath from './removeFile';

// Configure Cloudinary
cloudinary.config({
	cloud_name: env.CLOUDINARY_CLOUD_NAME,
	api_key: env.CLOUDINARY_API_KEY,
	api_secret: env.CLOUDINARY_API_SECRET,
});

export const uploadOnCloudinary = async (
	localFilePath: string,
	uploadFolder?: string | undefined,
	options?: UploadApiOptions,
): Promise<UploadApiResponse> => {
	if (!localFilePath) {
		Logger.warn('No local file path provided for video upload');
		throw new InternalServerError('No local file path provided');
	}

	try {
		const uploadResult = await cloudinary.uploader.upload(localFilePath, {
			folder: uploadFolder ?? CLOUDINARY_FOLDER_NAME,
			resource_type: 'auto',
			...options,
		});
		Logger.info(`Video uploaded to cloudinary: ${uploadResult?.secure_url}`);
		return uploadResult;
	} catch (error) {
		Logger.error('Cloudinary video upload failed', error);
		throw error;
	} finally {
		unlinkLocalFilePath(localFilePath);
	}
};

export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
	try {
		if (!publicId) {
			throw new InternalServerError('No public id provided');
		}
		const result = await cloudinary.uploader.destroy(publicId);

		if (result.result !== 'ok') {
			Logger.error(`Image deletion returned unexpected result: ${result.result}`);
			throw new InternalServerError('Failed to delete image from Cloudinary');
		}
		Logger.info(`Image deleted from cloudinary: ${publicId}`);
	} catch (error) {
		Logger.error(`Cloudinary image delete failed for ID: ${publicId}`, error);
		throw error;
	}
};
