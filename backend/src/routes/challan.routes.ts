import { Router } from 'express';
import { getChallans, getChallan, createChallan, updateChallanStatus } from '../controllers/challan.controller';
import { authenticate, authorize } from '../middlewares/auth';

const router = Router();

router.use(authenticate);
router.use(authorize(['ADMIN', 'SALES']));

router.get('/', getChallans);
router.get('/:id', getChallan);
router.post('/', createChallan);
router.put('/:id/status', updateChallanStatus);

export default router;
