import { z } from 'zod';

// Coerce price from strings (coming from form-data) into numbers before validation
export const productValidationSchema = z.object({
	name: z.string().min(3, { message: 'Name must be at least 3 characters long' }),
	description: z.string().min(10, { message: 'Description must be at least 10 characters long' }),
	price: z.coerce.number().min(0, { message: 'Price must be a non-negative number' }),
	inStock: z.coerce.boolean().optional().default(true),
});

export const productUpdateValidationSchema = z
	.object({
		name: z.string().min(3).optional(),
		description: z.string().min(10).optional(),
		price: z.coerce.number().min(0).optional(),
		inStock: z.coerce.boolean().optional(),
	})
	.partial();

export type ProductValidation = z.infer<typeof productValidationSchema>;
export type ProductUpdateValidation = z.infer<typeof productUpdateValidationSchema>;
