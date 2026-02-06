import express from 'express';
import * as authController from '../controllers/authController.js';

const router = express.Router();

router.post('/login', authController.login);
router.get('/me', authController.verifyToken, authController.me);
router.post('/update-account', authController.verifyToken, authController.updateAccount);

export default router;
