"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const integrationsController_1 = require("../controllers/integrationsController");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const router = express_1.default.Router();
// Configurar multer para upload de arquivos
const uploadsDir = path_1.default.join(__dirname, '../../uploads');
// Criar pasta de uploads se não existir
if (!fs_1.default.existsSync(uploadsDir)) {
    fs_1.default.mkdirSync(uploadsDir, { recursive: true });
}
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path_1.default.extname(file.originalname));
    }
});
const upload = (0, multer_1.default)({ storage });
// Rotas de integração
router.post('/llm', integrationsController_1.invokeLLM);
router.post('/email', integrationsController_1.sendEmail);
router.post('/sms', integrationsController_1.sendSMS);
router.post('/upload', upload.single('file'), integrationsController_1.uploadFile);
exports.default = router;
