"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadFile = exports.sendSMS = exports.sendEmail = exports.invokeLLM = void 0;
const node_fetch_1 = __importDefault(require("node-fetch"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
/**
 * Invocar LLM (Large Language Model) para processamento de prompts
 * @route POST /api/integrations/llm
 */
const invokeLLM = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { prompt, response_json_schema } = req.body;
        if (!prompt) {
            console.warn('[LLM] Tentativa de invocação sem prompt');
            return res.status(400).json({ error: 'Prompt é necessário' });
        }
        // Usar a variável de ambiente diretamente
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            console.error('[LLM] Chave da API OpenAI não configurada');
            return res.status(500).json({
                error: 'Chave da API OpenAI não configurada',
                message: 'Configure a variável OPENAI_API_KEY no arquivo .env'
            });
        }
        console.log('[LLM] Iniciando chamada para API OpenAI com prompt:', prompt.substring(0, 100) + '...');
        // Chamar a API da OpenAI
        const openaiResponse = yield (0, node_fetch_1.default)('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    { role: 'system', content: 'Você é um assistente de IA para um sistema de gerenciamento de provedor de internet.' },
                    { role: 'user', content: prompt }
                ],
                response_format: response_json_schema ? { type: "json_object" } : undefined,
                temperature: 0.7
            })
        });
        const data = yield openaiResponse.json();
        if (!openaiResponse.ok) {
            console.error('[LLM] Erro na chamada da API OpenAI:', data);
            return res.status(500).json({
                error: 'Erro na chamada da API OpenAI',
                details: ((_a = data.error) === null || _a === void 0 ? void 0 : _a.message) || 'Erro desconhecido'
            });
        }
        // Tentar extrair e analisar a resposta JSON
        try {
            const content = data.choices[0].message.content;
            console.log('[LLM] Resposta recebida da API OpenAI');
            // Se a resposta deve ser um JSON, tente parseá-la
            if (response_json_schema) {
                const jsonResponse = JSON.parse(content);
                return res.json(jsonResponse);
            }
            // Caso contrário, retorne a resposta como texto
            return res.json({ response: content });
        }
        catch (parseError) {
            console.error('[LLM] Erro ao analisar resposta da API:', parseError);
            return res.status(500).json({
                error: 'Erro ao analisar resposta da API',
                details: parseError.message
            });
        }
    }
    catch (error) {
        console.error('[LLM] Erro na integração com LLM:', error);
        return res.status(500).json({
            error: 'Erro interno do servidor',
            details: error.message
        });
    }
});
exports.invokeLLM = invokeLLM;
/**
 * Enviar e-mail
 * @route POST /api/integrations/email
 */
const sendEmail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Implementar envio real de e-mail aqui
        return res.status(501).json({ error: 'Envio de e-mail não implementado' });
    }
    catch (error) {
        console.error('Erro ao enviar e-mail:', error);
        return res.status(500).json({ error: 'Erro ao enviar e-mail' });
    }
});
exports.sendEmail = sendEmail;
/**
 * Enviar SMS
 * @route POST /api/integrations/sms
 */
const sendSMS = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Implementar envio real de SMS aqui
        return res.status(501).json({ error: 'Envio de SMS não implementado' });
    }
    catch (error) {
        console.error('Erro ao enviar SMS:', error);
        return res.status(500).json({ error: 'Erro ao enviar SMS' });
    }
});
exports.sendSMS = sendSMS;
/**
 * Upload de arquivo
 * @route POST /api/integrations/upload
 */
const uploadFile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Aqui seria implementado o upload real para um serviço de armazenamento como S3
        const file = req.file;
        const metadata = req.body.metadata ? JSON.parse(req.body.metadata) : {};
        if (!file) {
            return res.status(400).json({ error: 'Nenhum arquivo enviado' });
        }
        console.log('Arquivo recebido:', file.originalname, 'com metadados:', metadata);
        // Simulação de URL para ambiente de desenvolvimento
        const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;
        return res.json({
            success: true,
            fileUrl,
            fileName: file.originalname,
            fileSize: file.size,
            mimetype: file.mimetype
        });
    }
    catch (error) {
        console.error('Erro no upload de arquivo:', error);
        return res.status(500).json({ error: 'Erro no upload de arquivo' });
    }
});
exports.uploadFile = uploadFile;
