"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userRoutes_1 = __importDefault(require("./userRoutes"));
const authRoutes_1 = __importDefault(require("./authRoutes"));
const customerRoutes_1 = __importDefault(require("./customerRoutes"));
const planRoutes_1 = __importDefault(require("./planRoutes"));
const invoiceRoutes_1 = __importDefault(require("./invoiceRoutes"));
const ticketRoutes_1 = __importDefault(require("./ticketRoutes"));
const networkIssueRoutes_1 = __importDefault(require("./networkIssueRoutes"));
const ipPoolRoutes_1 = __importDefault(require("./ipPoolRoutes"));
const vehicleRoutes_1 = __importDefault(require("./vehicleRoutes"));
const equipmentBrandRoutes_1 = __importDefault(require("./equipmentBrandRoutes"));
const driverRoutes_1 = __importDefault(require("./driverRoutes"));
const equipmentRoutes_1 = __importDefault(require("./equipmentRoutes"));
const contractRoutes_1 = __importDefault(require("./contractRoutes"));
const networkNodeRoutes_1 = __importDefault(require("./networkNodeRoutes"));
const fuelRefillRoutes_1 = __importDefault(require("./fuelRefillRoutes"));
const mileageLogRoutes_1 = __importDefault(require("./mileageLogRoutes"));
const paymentGatewayRoutes_1 = __importDefault(require("./paymentGatewayRoutes"));
const billingScheduleRoutes_1 = __importDefault(require("./billingScheduleRoutes"));
const systemConfigRoutes_1 = __importDefault(require("./systemConfigRoutes"));
const healthRoutes_1 = __importDefault(require("./healthRoutes"));
const routerIntegrationRoutes_1 = __importDefault(require("./routerIntegrationRoutes"));
const integrationsRoutes_1 = __importDefault(require("./integrationsRoutes"));
const inventoryItemRoutes_1 = __importDefault(require("./inventoryItemRoutes"));
const inventoryTransactionRoutes_1 = __importDefault(require("./inventoryTransactionRoutes"));
const auth_1 = require("../middleware/auth");
// Importações temporariamente comentadas até que os arquivos sejam criados
// import userRoutes from './userRoutes';
// import authRoutes from './authRoutes';
// import customerRoutes from './customerRoutes';
// import planRoutes from './planRoutes';
// import invoiceRoutes from './invoiceRoutes';
// import ticketRoutes from './ticketRoutes';
const router = (0, express_1.Router)();
// Rotas públicas
router.use('/api/auth', authRoutes_1.default);
router.use('/api/health', healthRoutes_1.default);
// Rotas protegidas (requerem autenticação)
// TEMPORÁRIO: Removendo autenticação das rotas de clientes e faturas
router.use('/api/customers', customerRoutes_1.default);
router.use('/api/invoices', invoiceRoutes_1.default);
// Outras rotas protegidas
router.use('/api/plans', auth_1.authenticateJWT, planRoutes_1.default);
router.use('/api/tickets', auth_1.authenticateJWT, ticketRoutes_1.default);
router.use('/api/network-issues', auth_1.authenticateJWT, networkIssueRoutes_1.default);
router.use('/api/ip-pools', auth_1.authenticateJWT, ipPoolRoutes_1.default);
router.use('/api/vehicles', auth_1.authenticateJWT, vehicleRoutes_1.default);
router.use('/api/drivers', auth_1.authenticateJWT, driverRoutes_1.default);
router.use('/api/equipment-brands', auth_1.authenticateJWT, equipmentBrandRoutes_1.default);
router.use('/api/equipment', auth_1.authenticateJWT, equipmentRoutes_1.default);
router.use('/api/contracts', auth_1.authenticateJWT, contractRoutes_1.default);
router.use('/api/network-nodes', auth_1.authenticateJWT, networkNodeRoutes_1.default);
router.use('/api/payment-gateways', auth_1.authenticateJWT, paymentGatewayRoutes_1.default);
router.use('/api/billing-schedules', auth_1.authenticateJWT, billingScheduleRoutes_1.default);
router.use('/api/mileage-logs', auth_1.authenticateJWT, mileageLogRoutes_1.default);
router.use('/api/fuel-refills', auth_1.authenticateJWT, fuelRefillRoutes_1.default);
router.use('/api/router-integrations', auth_1.authenticateJWT, routerIntegrationRoutes_1.default);
router.use('/api/integrations', auth_1.authenticateJWT, integrationsRoutes_1.default);
router.use('/api/inventory-items', auth_1.authenticateJWT, inventoryItemRoutes_1.default);
router.use('/api/inventory-transactions', auth_1.authenticateJWT, inventoryTransactionRoutes_1.default);
// Rota para IP assignments
router.use('/api/ip-assignments', auth_1.authenticateJWT, (req, res, next) => {
    req.url = '/assignments/all' + (req.url !== '/' ? req.url : '');
    (0, ipPoolRoutes_1.default)(req, res, next);
});
// Rotas da API - descomentadas conforme os arquivos são criados
router.use('/api/users', userRoutes_1.default);
router.use('/api/config', systemConfigRoutes_1.default);
// Rota padrão
router.get('/', (req, res) => {
    res.json({ message: 'Bem-vindo à API do ISP Manager' });
});
// Tratamento de rotas não encontradas
router.use((req, res) => {
    res.status(404).json({ message: 'Rota não encontrada' });
});
exports.default = router;
