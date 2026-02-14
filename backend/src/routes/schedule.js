import express from 'express';
import * as scheduleController from '../controllers/scheduleController.js';

const router = express.Router();


router.post('/generate', scheduleController.generateSchedule);
router.post('/move', scheduleController.moveSlot);
router.post('/create-manual', scheduleController.createSlotManual);
router.post('/update-examiners', scheduleController.updateSlotExaminers);

export default router;
