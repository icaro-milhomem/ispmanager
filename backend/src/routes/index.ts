import { Router } from 'express';
import userRoutes from './userRoutes';
import authRoutes from './authRoutes';
import customerRoutes from './customerRoutes';
import planRoutes from './planRoutes';
import invoiceRoutes from './invoiceRoutes';
import ticketRoutes from './ticketRoutes';
import networkIssueRoutes from './networkIssueRoutes';
import ipPoolRoutes from './ipPoolRoutes';
import vehicleRoutes from './vehicleRoutes';
import equipmentBrandRoutes from './equipmentBrandRoutes';
import driverRoutes from './driverRoutes';
import equipmentRoutes from './equipmentRoutes';
import contractRoutes from './contractRoutes';
import networkNodeRoutes from './networkNodeRoutes';
import fuelRefillRoutes from './fuelRefillRoutes';
import mileageLogRoutes from './mileageLogRoutes';
import paymentGatewayRoutes from './paymentGatewayRoutes';
import billingScheduleRoutes from './billingScheduleRoutes';
import systemConfigRoutes from './systemConfigRoutes';
import healthRoutes from './healthRoutes';
import routerIntegrationRoutes from './routerIntegrationRoutes';
import integrationsRoutes from './integrationsRoutes';
import inventoryItemRoutes from './inventoryItemRoutes';
import inventoryTransactionRoutes from './inventoryTransactionRoutes';
import ctoRoutes from './ctoRoutes';
import ftthConnectionsRoutes from './ftthConnectionsRoutes';
import fiberRoutes from './fiberRoutes';
import splitterRoutes from './splitterRoutes';
import coeRoutes from './coeRoutes';
import { authenticateJWT } from '../middleware/auth';

// Importações temporariamente comentadas até que os arquivos sejam criados
// import userRoutes from './userRoutes';
// import authRoutes from './authRoutes';
// import customerRoutes from './customerRoutes';
// import planRoutes from './planRoutes';
// import invoiceRoutes from './invoiceRoutes';
// import ticketRoutes from './ticketRoutes';

const router = Router();

// Rotas públicas
router.use('/api/auth', authRoutes);
router.use('/api/health', healthRoutes);

// Rotas protegidas (requerem autenticação)
// TEMPORÁRIO: Removendo autenticação das rotas de clientes e faturas
router.use('/api/customers', customerRoutes);
router.use('/api/invoices', invoiceRoutes);

// Outras rotas protegidas
router.use('/api/plans', authenticateJWT, planRoutes);
router.use('/api/tickets', authenticateJWT, ticketRoutes);
router.use('/api/network-issues', authenticateJWT, networkIssueRoutes);
router.use('/api/ip-pools', authenticateJWT, ipPoolRoutes);
router.use('/api/vehicles', authenticateJWT, vehicleRoutes);
router.use('/api/drivers', authenticateJWT, driverRoutes);
router.use('/api/equipment-brands', authenticateJWT, equipmentBrandRoutes);
router.use('/api/equipment', authenticateJWT, equipmentRoutes);
router.use('/api/contracts', authenticateJWT, contractRoutes);
router.use('/api/network-nodes', authenticateJWT, networkNodeRoutes);
router.use('/api/payment-gateways', authenticateJWT, paymentGatewayRoutes);
router.use('/api/billing-schedules', authenticateJWT, billingScheduleRoutes);
router.use('/api/mileage-logs', authenticateJWT, mileageLogRoutes);
router.use('/api/fuel-refills', authenticateJWT, fuelRefillRoutes);
router.use('/api/router-integrations', authenticateJWT, routerIntegrationRoutes);
router.use('/api/integrations', authenticateJWT, integrationsRoutes);
router.use('/api/inventory-items', authenticateJWT, inventoryItemRoutes);
router.use('/api/inventory-transactions', authenticateJWT, inventoryTransactionRoutes);
router.use('/api/ctos', authenticateJWT, ctoRoutes);
router.use('/api/ftth/connections', authenticateJWT, ftthConnectionsRoutes);

// Rotas FTTH
router.use('/api/fibers', authenticateJWT, fiberRoutes);
router.use('/api/splitters', authenticateJWT, splitterRoutes);
router.use('/api/coes', authenticateJWT, coeRoutes);

// Rota para IP assignments
router.use('/api/ip-assignments', authenticateJWT, (req, res, next) => {
  req.url = '/assignments/all' + (req.url !== '/' ? req.url : '');
  ipPoolRoutes(req, res, next);
});

// Rotas da API - descomentadas conforme os arquivos são criados
router.use('/api/users', userRoutes);
router.use('/api/config', systemConfigRoutes);

// Rota padrão
router.get('/', (req, res) => {
  res.json({ message: 'Bem-vindo à API do ISP Manager' });
});

// Tratamento de rotas não encontradas
router.use((req, res) => {
  res.status(404).json({ message: 'Rota não encontrada' });
});

export default router; 