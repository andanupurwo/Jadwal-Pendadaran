import express from 'express';
import * as liburController from '../controllers/liburController.js';

const router = express.Router();

router.get('/', liburController.getAllLibur);
router.post('/', liburController.createLibur);
router.delete('/action/wipe', liburController.deleteAllLibur);
router.delete('/:id', liburController.deleteLibur);
router.delete('/nik/:nik', liburController.deleteLiburByNik);
router.post('/bulk', liburController.bulkCreateLibur);

export default router;
