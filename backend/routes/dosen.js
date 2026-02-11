import express from 'express';
import * as dosenController from '../controllers/dosenController.js';

const router = express.Router();

router.get('/', dosenController.getAllDosen);
router.get('/fakultas/:fakultas', dosenController.getDosenByFakultas);
router.patch('/:nik/exclude', dosenController.toggleExcludeDosen);
router.delete('/:nik', dosenController.deleteDosen);
router.post('/bulk', dosenController.bulkInsertDosen);
router.get('/master', dosenController.getMasterDosen);
router.post('/master/bulk', dosenController.bulkInsertMasterDosen);
router.delete('/master/:nik', dosenController.deleteMasterDosen);
router.put('/:nik', dosenController.updateDosen);

export default router;
