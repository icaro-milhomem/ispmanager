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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// Listar todas as faturas
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const invoices = yield prisma.invoice.findMany({
            include: {
                customer: {
                    select: {
                        id: true,
                        full_name: true,
                        email: true,
                        phone: true
                    }
                },
                payments: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        res.json(invoices);
    }
    catch (error) {
        console.error('Erro ao listar faturas:', error);
        res.status(500).json({ error: 'Erro ao listar faturas' });
    }
}));
// Obter uma fatura específica
router.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const invoice = yield prisma.invoice.findUnique({
            where: { id: req.params.id },
            include: {
                customer: {
                    select: {
                        id: true,
                        full_name: true,
                        email: true,
                        phone: true
                    }
                },
                payments: true
            }
        });
        if (!invoice) {
            return res.status(404).json({ error: 'Fatura não encontrada' });
        }
        res.json(invoice);
    }
    catch (error) {
        console.error('Erro ao buscar fatura:', error);
        res.status(500).json({ error: 'Erro ao buscar fatura' });
    }
}));
// Criar nova fatura
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { customerId, amount, dueDate, description } = req.body;
        // Gerar número da fatura (você pode implementar sua própria lógica)
        const lastInvoice = yield prisma.invoice.findFirst({
            orderBy: { number: 'desc' }
        });
        const nextNumber = lastInvoice
            ? String(Number(lastInvoice.number) + 1).padStart(6, '0')
            : '000001';
        const invoice = yield prisma.invoice.create({
            data: {
                number: nextNumber,
                customerId,
                amount,
                dueDate: new Date(dueDate),
                description,
                status: 'PENDING'
            },
            include: {
                customer: {
                    select: {
                        id: true,
                        full_name: true,
                        email: true,
                        phone: true
                    }
                }
            }
        });
        res.status(201).json(invoice);
    }
    catch (error) {
        console.error('Erro ao criar fatura:', error);
        res.status(500).json({ error: 'Erro ao criar fatura' });
    }
}));
// Atualizar fatura
router.put('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { amount, dueDate, description, status, paymentDate } = req.body;
        const invoice = yield prisma.invoice.update({
            where: { id: req.params.id },
            data: {
                amount,
                dueDate: dueDate ? new Date(dueDate) : undefined,
                description,
                status,
                paymentDate: paymentDate ? new Date(paymentDate) : undefined
            },
            include: {
                customer: {
                    select: {
                        id: true,
                        full_name: true,
                        email: true,
                        phone: true
                    }
                }
            }
        });
        res.json(invoice);
    }
    catch (error) {
        console.error('Erro ao atualizar fatura:', error);
        res.status(500).json({ error: 'Erro ao atualizar fatura' });
    }
}));
// Excluir fatura
router.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield prisma.invoice.delete({
            where: { id: req.params.id }
        });
        res.status(204).send();
    }
    catch (error) {
        console.error('Erro ao excluir fatura:', error);
        res.status(500).json({ error: 'Erro ao excluir fatura' });
    }
}));
// Registrar pagamento
router.post('/:id/payments', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { amount, method, date, transaction, notes } = req.body;
        const payment = yield prisma.payment.create({
            data: {
                invoiceId: req.params.id,
                amount,
                method,
                date: new Date(date),
                transaction,
                notes
            }
        });
        // Atualizar status da fatura
        yield prisma.invoice.update({
            where: { id: req.params.id },
            data: {
                status: 'PAID',
                paymentDate: new Date(date)
            }
        });
        res.status(201).json(payment);
    }
    catch (error) {
        console.error('Erro ao registrar pagamento:', error);
        res.status(500).json({ error: 'Erro ao registrar pagamento' });
    }
}));
// Listar pagamentos de uma fatura
router.get('/:id/payments', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const payments = yield prisma.payment.findMany({
            where: { invoiceId: req.params.id },
            orderBy: { date: 'desc' }
        });
        res.json(payments);
    }
    catch (error) {
        console.error('Erro ao listar pagamentos:', error);
        res.status(500).json({ error: 'Erro ao listar pagamentos' });
    }
}));
exports.default = router;
