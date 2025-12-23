import type { Application } from 'express';
import { API_PREFIX } from '../constants';
import productRoutes from './product.routes';

export const appRoutes = (app: Application) => {
	app.use(`${API_PREFIX}/products`, productRoutes);
};
