import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { ContractController } from '../controllers/contractController.js';
import { ReviewController } from '../controllers/reviewController.js';
import { ChatController } from '../controllers/chatController.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { config } from '../config/index.js';

const router = Router();

if (!fs.existsSync(config.uploadDir)) {
  fs.mkdirSync(config.uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, config.uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uuidv4()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: config.maxFileSizeMb * 1024 * 1024,
  },
});

router.use(requireAuth);

router.post('/', upload.single('file'), ContractController.upload);
router.get('/', ContractController.list);
router.get('/:contractId', ContractController.getOne);
router.delete('/:contractId', ContractController.deleteOne);

router.get('/:contractId/review', ReviewController.getReview);
router.post('/:contractId/review', ReviewController.retryReview);

router.get('/:contractId/chat', ChatController.getHistory);
router.post('/:contractId/chat/stream', ChatController.streamChat);

export default router;
