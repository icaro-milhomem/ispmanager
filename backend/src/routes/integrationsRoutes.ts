import express from 'express';
import { invokeLLM, sendEmail, sendSMS, uploadFile } from '../controllers/integrationsController';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Configurar multer para upload de arquivos
const uploadsDir = path.join(__dirname, '../../uploads');

// Criar pasta de uploads se não existir
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Rotas de integração
router.post('/llm', invokeLLM);
router.post('/email', sendEmail);
router.post('/sms', sendSMS);
router.post('/upload', upload.single('file'), uploadFile);

export default router; 