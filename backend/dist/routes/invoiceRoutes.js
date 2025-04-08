"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const invoiceController_1 = require("../controllers/invoiceController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
// Aplicar middleware de autenticação em todas as rotas
router.use(authMiddleware_1.authMiddleware);
// Rotas de fatura
router.get('/', invoiceController_1.getAllInvoices);
router.get('/:id', invoiceController_1.getInvoiceById);
router.post('/', invoiceController_1.createInvoice);
router.put('/:id', invoiceController_1.updateInvoice);
router.delete('/:id', invoiceController_1.deleteInvoice);
// Rotas de pagamento
router.post('/:id/payments', invoiceController_1.registerPayment);
router.get('/:id/payments', invoiceController_1.getPaymentsByInvoice);
exports.default = router;
