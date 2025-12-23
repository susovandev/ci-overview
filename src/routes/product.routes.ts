import { Router } from 'express';
import productController from '../controllers/product.controller';
import upload from '../middlewares/multer.middleware';
import { validationMiddleware } from '../middlewares/validation.middleware';
import {
	productUpdateValidationSchema,
	productValidationSchema,
} from '../validations/product.validation';

const router = Router();

router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);
router.post(
	'/',
	upload.single('image'),
	validationMiddleware(productValidationSchema),
	productController.createProduct,
);
router.put(
	'/:id',
	upload.single('image'),
	validationMiddleware(productUpdateValidationSchema),
	productController.updateProduct,
);
router.delete('/:id', productController.deleteProduct);

export default router;
