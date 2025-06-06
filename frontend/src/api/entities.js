import { createEntityClient, authClient } from './apiClient';
import { SystemConfigClient } from './systemConfigClient';

// Entidades principais
export const Customer = createEntityClient('customers');
export const Plan = createEntityClient('plans');
export const SupportTicket = createEntityClient('tickets');
export const Contract = createEntityClient('contracts');
export const NetworkIssue = createEntityClient('network-issues');
export const Equipment = createEntityClient('equipment');
export const IPPool = createEntityClient('ip-pools');
export const Invoice = createEntityClient('invoices');
export const Payment = createEntityClient('payments');
export const Subscription = createEntityClient('subscriptions');
// Abastecimentos de combustível - Conecta com a API /api/fuel-refills
export const FuelRefill = createEntityClient('fuel-refills');
export const MileageLog = createEntityClient('mileage-logs');
export const Vehicle = createEntityClient('vehicles');
export const EquipmentBrand = createEntityClient('equipment-brands');
export const InventoryItem = createEntityClient('inventory-items');
export const InventoryTransaction = createEntityClient('inventory-transactions');
export const Supplier = createEntityClient('suppliers');
export const SystemConfig = SystemConfigClient;
export const UserRole = createEntityClient('user-roles');
export const FinancialTransaction = createEntityClient('financial-transactions');
export const User = createEntityClient('users');
export const ContractTemplate = createEntityClient('contract-templates');
export const DigitalSignature = createEntityClient('digital-signatures');
export const Driver = createEntityClient('drivers');
export const PaymentGateway = createEntityClient('payment-gateways');
export const BillingSchedule = createEntityClient('billing-schedules');
export const RouterIntegration = createEntityClient('router-integrations');
export const IPAssignment = createEntityClient('ip-assignments');
export const NetworkNode = createEntityClient('network-nodes');
export const ServicePlan = createEntityClient('service-plans');
export const BillingBatch = createEntityClient('billing-batches');
export const Bill = createEntityClient('bills');
export const FinancialReport = createEntityClient('financial-reports');

// Expor Auth client
export const Auth = authClient;