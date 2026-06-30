import { Router } from 'express';
import * as backupController from './backup.controller.js';
import { authenticate } from '../../middlewares/authMiddleware.js';
import { authorize } from '../../middlewares/roleMiddleware.js';

const router = Router();

router.use(authenticate, authorize('admin'));

router.get('/tables', backupController.listTables);
router.get('/tables/:table/preview', backupController.previewRows);

router.post('/full', backupController.createFullBackup);
router.post('/tables', backupController.createTablesBackup);
router.post('/rows', backupController.createRowsBackup);
router.post('/restore', backupController.restoreBackup);

router.get('/', backupController.getBackups);
router.get('/:filename/download', backupController.downloadBackup);
router.delete('/:filename', backupController.deleteBackup);

export default router;
