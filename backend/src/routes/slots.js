import express from 'express';
import * as slotsController from '../controllers/slotsController.js';

const router = express.Router();

router.get('/', slotsController.getAllSlots);
router.get('/date/:date', slotsController.getSlotsByDate);
router.delete('/', slotsController.deleteAllSlots);
router.delete('/:id', slotsController.deleteSlot);
router.post('/bulk', slotsController.createSlots);

export default router;
