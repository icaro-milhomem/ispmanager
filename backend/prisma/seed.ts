import { PrismaClient, DocumentType, NodeType, TicketStatus, Priority, NodeStatus, CustomerStatus, InvoiceStatus } from '@prisma/client';
import { hashPassword } from '../src/utils/auth';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando criação de dados simulados...');
  
  // Criar planos
  const basicPlan = await prisma.plan.upsert({
    where: { name: 'Básico' },
    update: {},
    create: {
      name: 'Básico',
      description: 'Plano básico de internet',
      price: 69.90,
      download: 30,
      upload: 15,
      status: 'ACTIVE'
    }
  });
  
  const proPlan = await prisma.plan.upsert({
    where: { name: 'Premium' },
    update: {},
    create: {
      name: 'Premium',
      description: 'Plano premium de internet',
      price: 99.90,
      download: 100,
      upload: 50,
      status: 'ACTIVE'
    }
  });
  
  const businessPlan = await prisma.plan.upsert({
    where: { name: 'Business' },
    update: {},
    create: {
      name: 'Business',
      description: 'Plano empresarial de internet',
      price: 199.90,
      download: 300,
      upload: 150,
      status: 'ACTIVE'
    }
  });
  
  console.log('Planos criados');
  
  // Criar clientes
  const customers = [
    {
      full_name: 'João Silva',
      document_type: DocumentType.CPF,
      document_number: '123.456.789-00',
      email: 'joao@example.com',
      phone: '(11) 99999-1111',
      address: 'Rua das Flores, 123',
      status: CustomerStatus.ACTIVE,
      planId: basicPlan.id
    },
    {
      full_name: 'Maria Souza',
      document_type: DocumentType.CPF,
      document_number: '987.654.321-00',
      email: 'maria@example.com',
      phone: '(11) 99999-2222',
      address: 'Av. Brasil, 456',
      status: CustomerStatus.ACTIVE,
      planId: proPlan.id
    },
    {
      full_name: 'Empresa XYZ Ltda',
      document_type: DocumentType.CNPJ,
      document_number: '12.345.678/0001-90',
      email: 'contato@empresaxyz.com',
      phone: '(11) 3333-4444',
      address: 'Av. Paulista, 1000',
      status: CustomerStatus.ACTIVE,
      planId: businessPlan.id
    },
    {
      full_name: 'Pedro Oliveira',
      document_type: DocumentType.CPF,
      document_number: '111.222.333-44',
      email: 'pedro@example.com',
      phone: '(11) 99999-3333',
      address: 'Rua dos Lírios, 789',
      status: CustomerStatus.PENDING,
      planId: basicPlan.id
    },
    {
      full_name: 'Ana Costa',
      document_type: DocumentType.CPF,
      document_number: '555.666.777-88',
      email: 'ana@example.com',
      phone: '(11) 99999-4444',
      address: 'Rua das Margaridas, 567',
      status: CustomerStatus.SUSPENDED,
      planId: proPlan.id
    }
  ];
  
  for (const customer of customers) {
    await prisma.customer.upsert({
      where: { email: customer.email },
      update: {},
      create: customer
    });
  }
  
  console.log('Clientes criados');
  
  // Criar nós de rede
  const nodes = [
    {
      id: '1',
      name: 'Roteador Principal',
      type: NodeType.ROUTER,
      ip_address: '192.168.1.1',
      mac_address: '00:11:22:33:44:55',
      status: NodeStatus.ACTIVE
    },
    {
      id: '2',
      name: 'Switch Centro',
      type: NodeType.SWITCH,
      ip_address: '192.168.1.2',
      mac_address: '11:22:33:44:55:66',
      status: NodeStatus.ACTIVE
    },
    {
      id: '3',
      name: 'AP Zona Norte',
      type: NodeType.ACCESS_POINT,
      ip_address: '192.168.1.3',
      mac_address: '22:33:44:55:66:77',
      status: NodeStatus.PROBLEM
    },
    {
      id: '4',
      name: 'AP Zona Sul',
      type: NodeType.ACCESS_POINT,
      ip_address: '192.168.1.4',
      mac_address: '33:44:55:66:77:88',
      status: NodeStatus.INACTIVE
    }
  ];
  
  for (const node of nodes) {
    await prisma.networkNode.upsert({
      where: { id: node.id },
      update: {},
      create: node
    });
  }
  
  console.log('Nós de rede criados');
  
  // Criar faturas
  const customers_db = await prisma.customer.findMany();
  
  const today = new Date();
  const lastMonth = new Date(today);
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  
  const nextMonth = new Date(today);
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  
  for (const customer of customers_db) {
    // Fatura do mês passado (paga)
    await prisma.invoice.upsert({
      where: { number: `INV-${customer.id}-${lastMonth.getMonth()}-${lastMonth.getFullYear()}` },
      update: {},
      create: {
        number: `INV-${customer.id}-${lastMonth.getMonth()}-${lastMonth.getFullYear()}`,
        customerId: customer.id,
        amount: customer.planId ? (await prisma.plan.findUnique({ where: { id: customer.planId } }))?.price || 99.90 : 99.90,
        dueDate: new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 10),
        paymentDate: new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 8),
        status: InvoiceStatus.PAID
      }
    });
    
    // Fatura do mês atual (pendente ou vencida)
    const status = Math.random() > 0.7 ? InvoiceStatus.OVERDUE : InvoiceStatus.PENDING;
    await prisma.invoice.upsert({
      where: { number: `INV-${customer.id}-${today.getMonth()}-${today.getFullYear()}` },
      update: {},
      create: {
        number: `INV-${customer.id}-${today.getMonth()}-${today.getFullYear()}`,
        customerId: customer.id,
        amount: customer.planId ? (await prisma.plan.findUnique({ where: { id: customer.planId } }))?.price || 99.90 : 99.90,
        dueDate: new Date(today.getFullYear(), today.getMonth(), 10),
        status
      }
    });
    
    // Fatura do próximo mês (pendente)
    await prisma.invoice.upsert({
      where: { number: `INV-${customer.id}-${nextMonth.getMonth()}-${nextMonth.getFullYear()}` },
      update: {},
      create: {
        number: `INV-${customer.id}-${nextMonth.getMonth()}-${nextMonth.getFullYear()}`,
        customerId: customer.id,
        amount: customer.planId ? (await prisma.plan.findUnique({ where: { id: customer.planId } }))?.price || 99.90 : 99.90,
        dueDate: new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 10),
        status: InvoiceStatus.PENDING
      }
    });
  }
  
  console.log('Faturas criadas');
  
  // Criar tickets de suporte
  const tickets = [
    {
      title: 'Internet lenta',
      description: 'Minha internet está muito lenta desde ontem',
      status: TicketStatus.OPEN,
      priority: Priority.MEDIUM,
      customerId: customers_db[0].id
    },
    {
      title: 'Sem conexão',
      description: 'Estou totalmente sem internet',
      status: TicketStatus.IN_PROGRESS,
      priority: Priority.HIGH,
      customerId: customers_db[1].id
    },
    {
      title: 'Fatura incorreta',
      description: 'Minha fatura veio com valor errado',
      status: TicketStatus.OPEN,
      priority: Priority.LOW,
      customerId: customers_db[2].id
    },
    {
      title: 'Problema técnico',
      description: 'Equipamento com defeito',
      status: TicketStatus.OPEN,
      priority: Priority.URGENT,
      customerId: customers_db[3].id
    }
  ];
  
  for (let i = 0; i < tickets.length; i++) {
    await prisma.supportTicket.create({
      data: tickets[i]
    });
  }
  
  console.log('Tickets criados');
  
  console.log('Dados simulados criados com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 