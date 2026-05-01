// TICKET-011
'use strict';

const path = require('path');
const fs = require('fs');
const multer = require('multer');

const EXTENSIONES_PERMITIDAS = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf', '.txt', '.md']);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const salaDir = path.join(
      process.env.UPLOAD_DIR || path.join(__dirname, '../../uploads'),
      `sala_${req.params.id}`
    );
    fs.mkdirSync(salaDir, { recursive: true });
    cb(null, salaDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}${ext}`);
  },
});

function fileFilter(req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();
  if (!EXTENSIONES_PERMITIDAS.has(ext)) {
    return cb(new Error(`Extensión no permitida: ${ext}`));
  }
  cb(null, true);
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE_MB || '10') * 1024 * 1024 },
});

module.exports = upload;
