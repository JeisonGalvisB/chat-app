import express from 'express';
import upload from '../config/multer.js';
import path from 'path';

const router = express.Router();

/**
 * POST /api/upload
 * Upload a file (image, audio or document)
 */
router.post('/', upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No file was provided'
            });
        }

        const mimeType = req.file.mimetype.split('/')[0];
        let messageType = 'file';

        if (mimeType === 'image') {
            messageType = 'image';
        } else if (mimeType === 'audio') {
            messageType = 'audio';
        }

        // Build file URL
        const fileUrl = `/uploads/${path.basename(path.dirname(req.file.path))}/${req.file.filename}`;

        res.json({
            success: true,
            file: {
                url: fileUrl,
                name: req.file.originalname,
                size: req.file.size,
                mimeType: req.file.mimetype,
                messageType
            }
        });

    } catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).json({
            success: false,
            error: 'Error uploading file'
        });
    }
});

/**
 * Multer error handling
 */
router.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                error: 'File is too large (maximum 10MB)'
            });
        }
    }

    return res.status(400).json({
        success: false,
        error: error.message || 'Error processing file'
    });
});

export default router;