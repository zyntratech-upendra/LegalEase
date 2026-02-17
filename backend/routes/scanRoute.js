// ─── Scan Route ─────────────────────────────────────────────────────────────
// POST /api/scan — Upload a document (PDF/Image) for OCR + AI summary + TTS

import express from 'express';
import multer from 'multer';
import { handleScan } from '../controllers/scanController.js';

const router = express.Router();

// ── Multer config: memory storage, 10MB limit ──────────────────────────────
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            'application/pdf',
            'image/png',
            'image/jpeg',
            'image/jpg',
            'image/webp',
            'image/bmp',
            'image/tiff',
        ];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error(`Invalid file type: ${file.mimetype}. Allowed: PDF, PNG, JPG, WebP, BMP, TIFF`));
        }
    },
});

// POST /api/scan
router.post('/', upload.single('document'), handleScan);

// Multer error handler
router.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(413).json({ success: false, error: 'File too large. Maximum size is 10 MB.' });
        }
        return res.status(400).json({ success: false, error: `Upload error: ${err.message}` });
    }
    if (err.message?.includes('Invalid file type')) {
        return res.status(400).json({ success: false, error: err.message });
    }
    next(err);
});

export default router;
