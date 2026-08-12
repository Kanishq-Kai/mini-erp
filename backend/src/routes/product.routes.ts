import { Router } from 'express';
import { getProducts, getProduct, createProduct, updateProduct, getStockMovements } from '../controllers/product.controller';
import { authenticate, authorize } from '../middlewares/auth';

const router = Router();

router.use(authenticate);

router.get('/', authorize(['ADMIN', 'SALES', 'WAREHOUSE']), getProducts);
router.get('/:id', authorize(['ADMIN', 'SALES', 'WAREHOUSE']), getProduct);
router.post('/', authorize(['ADMIN', 'WAREHOUSE']), createProduct);
router.put('/:id', authorize(['ADMIN', 'WAREHOUSE']), updateProduct);
router.get('/:id/movements', authorize(['ADMIN', 'WAREHOUSE']), getStockMovements);

export default router;
