import { Router } from 'express';
import { requestReset, confirmReset } from '../controllers/passwordResetController';

const router = Router();
router.post('/request', requestReset);
router.post('/confirm', confirmReset);

export default router;
