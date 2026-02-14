import express from 'express';
import { getLogs, clearLogs } from '../controllers/logsController.js';

const router = express.Router();

router.get('/', getLogs);
router.delete('/', clearLogs);

export default router;
