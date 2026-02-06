import express from 'express';
import * as mahasiswaController from '../controllers/mahasiswaController.js';

const router = express.Router();

router.get('/', mahasiswaController.getAllMahasiswa);
router.get('/:nim', mahasiswaController.getMahasiswaByNim);
router.post('/', mahasiswaController.createMahasiswa);
router.put('/:nim', mahasiswaController.updateMahasiswa);

// IMPORTANT: Static routes must come BEFORE dynamic routes (like :nim)
router.delete('/all', mahasiswaController.deleteAllMahasiswa);
router.delete('/:nim', mahasiswaController.deleteMahasiswa);
router.post('/bulk', mahasiswaController.bulkCreateMahasiswa);

export default router;
