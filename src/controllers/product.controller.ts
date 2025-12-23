import type { Request, Response } from 'express';
import { sendResponse } from '../lib/response';
import { StatusCodes } from 'http-status-codes';
import { asyncHandler } from '../lib/asyncHandler';
import productService from '../services/product.service';
import type { CreateProductDTO, UpdateProductDTO } from '../types/product.types';
import { createLogger } from '../lib/logger';

const Logger = createLogger('ProductController');
class ProductController {
	getProducts = asyncHandler(async (_req: Request, res: Response) => {
		Logger.info(`Fetch all products request received`);
		const products = await productService.getAll();
		sendResponse(res, StatusCodes.OK, 'Products fetched successfully', products);
	});

	getProductById = asyncHandler(async (req: Request, res: Response) => {
		Logger.info(`Fetch product by id request received with id: ${req.params.id}`);
		const product = await productService.getById(req.params.id!);
		sendResponse(res, StatusCodes.OK, 'Product fetched successfully', product);
	});

	createProduct = asyncHandler(async (req: Request, res: Response) => {
		Logger.info(`Create product request received with body: ${JSON.stringify(req.body)}`);
		const requestBody = {
			name: req.body.name,
			description: req.body.description,
			price: req.body.price,
			inStock: req.body.inStock,
			imageLocalFilePath: req.file && req.file.path,
		} as CreateProductDTO;

		const newProduct = await productService.create(requestBody);
		sendResponse(res, StatusCodes.CREATED, 'Product created successfully', newProduct);
	});

	updateProduct = asyncHandler(async (req: Request, res: Response) => {
		Logger.info(`Update product request received with id: ${req.params.id}`);
		const requestBody = {
			name: req.body.name,
			description: req.body.description,
			price: req.body.price,
			inStock: req.body.inStock,
		} as UpdateProductDTO;

		if (req.file?.path) {
			requestBody.imageLocalFilePath = req.file.path;
		}
		const updatedProduct = await productService.update(req.params.id!, requestBody);
		sendResponse(res, StatusCodes.OK, 'Product updated successfully', updatedProduct);
	});

	deleteProduct = asyncHandler(async (req: Request, res: Response) => {
		Logger.info(`Delete product request received with id: ${req.params.id}`);
		await productService.delete(req.params.id!);
		sendResponse(res, StatusCodes.OK, 'Product deleted successfully');
	});
}

export default new ProductController();
