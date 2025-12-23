import { deleteFromCloudinary, uploadOnCloudinary } from '../lib/cloudinary';
import { BadRequestError, InternalServerError, NotFoundError } from '../lib/error';
import unlinkLocalFilePath from '../lib/removeFile';
import productModel, { type IProduct } from '../models/product.model';
import type { CreateProductDTO, UpdateProductDTO } from '../types/product.types';

class ProductService {
	async getAll() {
		const products = await productModel.find({}).sort({ createdAt: -1 }).exec();
		if (!products.length) {
			throw new NotFoundError('No products found');
		}
		return products;
	}
	async getById(id: string) {
		const product = await productModel.findById(id).exec();
		if (!product) {
			throw new NotFoundError('Product not found');
		}
		return product;
	}
	async create(data: CreateProductDTO): Promise<IProduct> {
		const { name, description, price, inStock, imageLocalFilePath } = data;
		if (!imageLocalFilePath) {
			throw new BadRequestError('Product image is required');
		}

		const { secure_url, public_id } = await uploadOnCloudinary(imageLocalFilePath);
		if (!secure_url || !public_id) {
			throw new InternalServerError('Failed to upload product image');
		}

		const newProduct = await productModel.create({
			name,
			description,
			price,
			inStock,
			image: {
				secure_url: secure_url as string,
				public_Id: public_id as string,
			},
		});
		if (!newProduct) {
			throw new InternalServerError('Failed to create product');
		}

		unlinkLocalFilePath(imageLocalFilePath);

		return newProduct;
	}
	async update(id: string, data: UpdateProductDTO): Promise<IProduct> {
		const { name, description, price, inStock, imageLocalFilePath } = data;

		const product = await productModel.findById(id);
		if (!product) {
			throw new NotFoundError('Product not found');
		}

		let updatedSecureUrl: string | undefined = undefined;
		let updatedPublicId: string | undefined = undefined;

		if (imageLocalFilePath) {
			// delete image from cloudinary
			await deleteFromCloudinary(product.image.public_Id);
			// upload new image
			const { secure_url, public_id } = await uploadOnCloudinary(imageLocalFilePath);
			// update product
			updatedSecureUrl = secure_url;
			updatedPublicId = public_id;
			// remove temp file
			unlinkLocalFilePath(imageLocalFilePath);
		}
		const updatedProduct = await productModel.findByIdAndUpdate(
			id,
			{
				name,
				description,
				price,
				inStock,
				image: {
					secure_url: updatedSecureUrl,
					public_Id: updatedPublicId,
				},
			},
			{ new: true },
		);
		if (!updatedProduct) {
			throw new InternalServerError('Failed to update product');
		}
		return updatedProduct;
	}
	async delete(id: string): Promise<void> {
		const product = await productModel.findByIdAndDelete(id);
		if (!product) {
			throw new NotFoundError('Product not found');
		}
		await deleteFromCloudinary(product.image.public_Id);
		return;
	}
}

export default new ProductService();
