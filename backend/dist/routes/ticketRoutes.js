"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ticketController_1 = require("../controllers/ticketController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
// Aplicar middleware de autenticação em todas as rotas
router.use(authMiddleware_1.authMiddleware);
// Listar todos os tickets
router.get('/', ticketController_1.getAllTickets);
// Obter ticket específico
router.get('/:id', ticketController_1.getTicketById);
// Obter respostas de um ticket
router.get('/:id/responses', ticketController_1.getTicketResponses);
// Criar novo ticket
router.post('/', ticketController_1.createTicket);
// Adicionar resposta a um ticket
router.post('/:id/responses', ticketController_1.addTicketResponse);
// Atualizar ticket
router.put('/:id', ticketController_1.updateTicket);
// Excluir ticket
router.delete('/:id', ticketController_1.deleteTicket);
exports.default = router;
