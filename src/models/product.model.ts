import { Schema, Document, model } from 'mongoose';

interface IImage {
	secure_url: string;
	public_Id: string;
}
export interface IProduct extends Document {
	name: string;
	description: string;
	price: number;
	inStock: boolean;
	image: IImage;
}

const productSchema = new Schema<IProduct>(
	{
		name: {
			type: String,
			required: true,
		},
		description: {
			type: String,
			required: true,
		},
		price: {
			type: Number,
			required: true,
		},
		inStock: {
			type: Boolean,
			default: true,
		},
		image: {
			secure_url: {
				type: String,
				required: true,
			},
			public_Id: {
				type: String,
				required: true,
			},
		},
	},
	{
		timestamps: true,
	},
);
export default model<IProduct>('Product', productSchema);
