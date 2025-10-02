import express from 'express';
import upload from '../config/multer.js';
import path from 'path';

const router = express.Router();

/**
 * POST /api/upload
 * Subir un archivo (imagen, audio o documento)
 */
router.post('/', upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No se proporcionó ningún archivo'
            });
        }

        const mimeType = req.file.mimetype.split('/')[0];
        let messageType = 'file';

        if (mimeType === 'image') {
            messageType = 'image';
        } else if (mimeType === 'audio') {
            messageType = 'audio';
        }

        // Construir URL del archivo
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
        console.error('Error al subir archivo:', error);
        res.status(500).json({
            success: false,
            error: 'Error al subir el archivo'
        });
    }
});

/**
 * Manejo de errores de multer
 */
router.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                error: 'El archivo es demasiado grande (máximo 10MB)'
            });
        }
    }

    return res.status(400).json({
        success: false,
        error: error.message || 'Error al procesar el archivo'
    });
});

export default router;