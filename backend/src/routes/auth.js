import express from 'express';
import * as authController from '../controllers/authController.js';
import { validateLogin, validateUpdateAccount } from '../middleware/validation.js';

const router = express.Router();

router.post('/login', validateLogin, authController.login);
router.get('/me', authController.verifyToken, authController.me);
router.post('/update-account', authController.verifyToken, validateUpdateAccount, authController.updateAccount);

export default router;
