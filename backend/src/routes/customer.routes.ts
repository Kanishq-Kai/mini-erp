import { Router } from 'express';
import { getCustomers, getCustomer, createCustomer, updateCustomer } from '../controllers/customer.controller';
import { authenticate, authorize } from '../middlewares/auth';

const router = Router();

router.use(authenticate);
router.use(authorize(['ADMIN', 'SALES']));

router.get('/', getCustomers);
router.get('/:id', getCustomer);
router.post('/', createCustomer);
router.put('/:id', updateCustomer);

export default router;
