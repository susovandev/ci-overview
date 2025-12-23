export interface CreateProductDTO {
	name: string;
	description: string;
	price: number;
	inStock: boolean;
	imageLocalFilePath: string;
}

export type UpdateProductDTO = Partial<CreateProductDTO>;
