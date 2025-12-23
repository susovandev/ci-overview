import supertest from 'supertest';
import mongoose from 'mongoose';
import '../mongo-setup';
import app from '../../src/app';
import productModel from '../../src/models/product.model';
import * as cloudinaryLib from '../../src/lib/cloudinary';
import * as removeFileModule from '../../src/lib/removeFile';

// Mock cloudinary and file removal
jest.mock('../../src/lib/cloudinary');
jest.mock('../../src/lib/removeFile');

beforeEach(async () => {
	await productModel.deleteMany({});
	jest.clearAllMocks();

	// Setup mock implementations
	(cloudinaryLib.uploadOnCloudinary as jest.Mock).mockResolvedValue({
		secure_url: 'http://example.com/test.jpg',
		public_id: `pub-${Date.now()}`,
	});
	(cloudinaryLib.deleteFromCloudinary as jest.Mock).mockResolvedValue(undefined);
	(removeFileModule.default as jest.Mock).mockImplementation(() => {});
});

describe('Product API - Comprehensive CRUD Tests', () => {
	describe('POST /api/v1/products - Create Product', () => {
		it('should create a new product with valid data (201)', async () => {
			const response = await supertest(app)
				.post('/api/v1/products')
				.field('name', 'Laptop')
				.field('description', 'High performance laptop with 16GB RAM')
				.field('price', '999.99')
				.field('inStock', 'true')
				.attach('image', Buffer.from('fake-image-content'), 'laptop.png');

			expect(response.status).toBe(201);
			expect(response.body.status).toBe(true);
			expect(response.body.data.name).toBe('Laptop');
			expect(response.body.data.price).toBe(999.99);
		});

		it('should fail validation: missing name', async () => {
			const response = await supertest(app)
				.post('/api/v1/products')
				.field('description', 'Valid description')
				.field('price', '10')
				.attach('image', Buffer.from('img'), 'test.png');

			expect(response.status).toBe(400);
		});

		it('should fail validation: missing description', async () => {
			const response = await supertest(app)
				.post('/api/v1/products')
				.field('name', 'Product')
				.field('price', '10')
				.attach('image', Buffer.from('img'), 'test.png');

			expect(response.status).toBe(400);
		});

		it('should fail validation: missing price', async () => {
			const response = await supertest(app)
				.post('/api/v1/products')
				.field('name', 'Product')
				.field('description', 'Valid description')
				.attach('image', Buffer.from('img'), 'test.png');

			expect(response.status).toBe(400);
		});

		it('should fail validation: missing image', async () => {
			const response = await supertest(app)
				.post('/api/v1/products')
				.field('name', 'Product')
				.field('description', 'Valid description')
				.field('price', '10');

			expect(response.status).toBe(400);
			expect(response.body.error.message).toBe('Product image is required');
		});

		it('should fail validation: negative price', async () => {
			const response = await supertest(app)
				.post('/api/v1/products')
				.field('name', 'Product')
				.field('description', 'Valid description')
				.field('price', '-5')
				.attach('image', Buffer.from('img'), 'test.png');

			expect(response.status).toBe(400);
		});

		it('should fail validation: short name', async () => {
			const response = await supertest(app)
				.post('/api/v1/products')
				.field('name', 'AB')
				.field('description', 'Valid description with sufficient length')
				.field('price', '10')
				.attach('image', Buffer.from('img'), 'test.png');

			expect(response.status).toBe(400);
		});

		it('should fail validation: short description', async () => {
			const response = await supertest(app)
				.post('/api/v1/products')
				.field('name', 'AB')
				.field('description', 'short')
				.field('price', '10')
				.attach('image', Buffer.from('img'), 'test.png');

			expect(response.status).toBe(400);
		});
	});

	describe('GET /api/v1/products - Get All Products', () => {
		it('should return 404 when no products exist', async () => {
			const response = await supertest(app).get('/api/v1/products');

			expect(response.status).toBe(404);
			expect(response.body.error.message).toBe('No products found');
		});

		it('should return all products', async () => {
			await supertest(app)
				.post('/api/v1/products')
				.field('name', 'Product 1')
				.field('description', 'Description 1')
				.field('price', '10')
				.attach('image', Buffer.from('fake'), 'p1.png');

			const response = await supertest(app).get('/api/v1/products');

			expect(response.status).toBe(200);
			expect(Array.isArray(response.body.data)).toBe(true);
			expect(response.body.data.length).toBeGreaterThan(0);
		});
	});

	describe('GET /api/v1/products/:id - Get Product by ID', () => {
		it('should retrieve product by valid ID', async () => {
			const createResponse = await supertest(app)
				.post('/api/v1/products')
				.field('name', 'Test Product')
				.field('description', 'Test description')
				.field('price', '99.99')
				.attach('image', Buffer.from('fake'), 'test.png');

			const productId = createResponse.body.data._id;
			const getResponse = await supertest(app).get(`/api/v1/products/${productId}`);

			expect(getResponse.status).toBe(200);
			expect(getResponse.body.data._id).toBe(productId);
		});

		it('should return 404 for non-existent ID', async () => {
			const fakeId = new mongoose.Types.ObjectId();
			const response = await supertest(app).get(`/api/v1/products/${fakeId}`);

			expect(response.status).toBe(404);
		});
	});

	describe('PUT /api/v1/products/:id - Update Product', () => {
		it('should update product fields', async () => {
			const createResponse = await supertest(app)
				.post('/api/v1/products')
				.field('name', 'Original')
				.field('description', 'Original desc')
				.field('price', '50')
				.attach('image', Buffer.from('fake'), 'test.png');

			const productId = createResponse.body.data._id;
			const updateResponse = await supertest(app)
				.put(`/api/v1/products/${productId}`)
				.send({ name: 'Updated' });

			expect(updateResponse.status).toBe(200);
			expect(updateResponse.body.data.name).toBe('Updated');
		});

		it('should return 404 for non-existent product', async () => {
			const fakeId = new mongoose.Types.ObjectId();
			const response = await supertest(app)
				.put(`/api/v1/products/${fakeId}`)
				.send({ name: 'Updated' });

			expect(response.status).toBe(404);
		});
	});

	describe('DELETE /api/v1/products/:id - Delete Product', () => {
		it('should delete product successfully', async () => {
			const createResponse = await supertest(app)
				.post('/api/v1/products')
				.field('name', 'To Delete')
				.field('description', 'Please delete this product')
				.field('price', '50')
				.attach('image', Buffer.from('fake'), 'test.png');

			const productId = createResponse.body.data._id;
			const deleteResponse = await supertest(app).delete(`/api/v1/products/${productId}`);

			expect(deleteResponse.status).toBe(200);

			// Verify deletion
			const getResponse = await supertest(app).get(`/api/v1/products/${productId}`);
			expect(getResponse.status).toBe(404);
		});

		it('should return 404 for non-existent product', async () => {
			const fakeId = new mongoose.Types.ObjectId();
			const response = await supertest(app).delete(`/api/v1/products/${fakeId}`);

			expect(response.status).toBe(404);
		});
	});

	describe('Full CRUD Flow', () => {
		it('should complete full CRUD lifecycle', async () => {
			// CREATE
			const createResponse = await supertest(app)
				.post('/api/v1/products')
				.field('name', 'CRUD Product')
				.field('description', 'CRUD test product')
				.field('price', '99.99')
				.attach('image', Buffer.from('crud-img'), 'crud.png');

			expect(createResponse.status).toBe(201);
			const productId = createResponse.body.data._id;

			// READ
			const readResponse = await supertest(app).get(`/api/v1/products/${productId}`);
			expect(readResponse.status).toBe(200);

			// UPDATE
			const updateResponse = await supertest(app)
				.put(`/api/v1/products/${productId}`)
				.send({ name: 'Updated CRUD Product' });
			expect(updateResponse.status).toBe(200);

			// DELETE
			const deleteResponse = await supertest(app).delete(`/api/v1/products/${productId}`);
			expect(deleteResponse.status).toBe(200);

			// VERIFY DELETION
			const verifyResponse = await supertest(app).get(`/api/v1/products/${productId}`);
			expect(verifyResponse.status).toBe(404);
		});
	});
});
