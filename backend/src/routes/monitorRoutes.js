import express from 'express';
import {
  getMonitors,
  createMonitor,
  deleteMonitor,
  triggerPing,
} from '../controllers/monitorController.js';

const router = express.Router();

router.get('/', getMonitors);
router.post('/', createMonitor);
router.delete('/:id', deleteMonitor);
router.post('/:id/ping', triggerPing);

export default router;
