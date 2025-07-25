import express from 'express';
import { postDownload, getStatus, deleteDownload } from '../controllers/torrentController.js';

const router = express.Router();

router.post('/torrent', postDownload);
router.get('/torrent/status', getStatus);
router.delete('/torrent', deleteDownload);

export default router;