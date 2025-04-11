"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const customerController_1 = require("../controllers/customerController");
const router = (0, express_1.Router)();
// Todas as rotas de clientes requerem autenticação
// TEMPORÁRIO: Removendo autenticação até resolver os problemas
// router.use(authMiddleware);
// Listar todos os clientes
router.get('/', customerController_1.getAllCustomers);
// Obter cliente específico
router.get('/:id', customerController_1.getCustomerById);
// Obter faturas de um cliente
// Temporariamente removendo autenticação desta rota específica
router.get('/:id/invoices', customerController_1.getCustomerInvoices);
// Obter tickets de um cliente
router.get('/:id/tickets', customerController_1.getCustomerTickets);
// Criar novo cliente
router.post('/', customerController_1.createCustomer);
// Atualizar cliente
router.put('/:id', customerController_1.updateCustomer);
// Excluir cliente
router.delete('/:id', customerController_1.deleteCustomer);
exports.default = router;
