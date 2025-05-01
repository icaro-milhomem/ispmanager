import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Wallet,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Filter,
  Download
} from "lucide-react";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { useToast } from "@/components/ui/use-toast";
import { Invoice } from "@/api/entities";
import { Customer } from "@/api/entities";
import { FinancialTransaction } from "@/api/entities";
import { Plan } from "@/api/entities";
import InvoiceList from "@/components/InvoiceList";
import InvoiceForm from "@/components/InvoiceForm";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { startOfMonth, endOfMonth, format, addMonths, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// Dummy BillForm and BillsList components - replace with your actual implementations
const BillForm = ({ bill, onSubmit, onCancel }) => {
  return (
    <div>
      <h2>{bill ? "Editar Conta" : "Nova Conta"}</h2>
      <p>Bill Form Placeholder</p>
      <button onClick={onSubmit}>Salvar</button>
      <button onClick={onCancel}>Cancelar</button>
    </div>
  );
};

const BillsList = ({ bills, onEdit, onDelete, onStatusChange }) => {
  return (
    <div>
      <h3>Lista de Contas Placeholder</h3>
      <ul>
        {bills.map(bill => (
          <li key={bill.id}>
            Conta {bill.id} - {bill.status} - {bill.category}
            <button onClick={() => onEdit(bill)}>Editar</button>
            <button onClick={() => onDelete(bill.id)}>Excluir</button>
            <button onClick={() => onStatusChange(bill.id, 'paid')}>Pagar</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default function FinancialManagementPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState([]);
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [dateRange, setDateRange] = useState({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date())
  });
  const [activeTab, setActiveTab] = useState("overview");
  const [financialData, setFinancialData] = useState({
    cashFlow: {
      currentBalance: 0,
      todayIncome: 0,
      todayExpenses: 0,
      monthIncome: 0,
      monthExpenses: 0
    },
    forecast: {
      income: {
        currentMonth: 0,
        nextMonth: 0,
        overdue: 0
      },
      expenses: {
        currentMonth: 0,
        nextMonth: 0,
        overdue: 0
      }
    },
    monthlyData: [],
    receiptsByStatus: [],
    receiptsByPaymentMethod: []
  });

  // Contas a Pagar State
  const [bills, setBills] = useState([
    { id: 1, status: 'pending', category: 'fuel' },
    { id: 2, status: 'paid', category: 'energy' },
    { id: 3, status: 'overdue', category: 'rent' },
  ]);
  const [showBillForm, setShowBillForm] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [billFilters, setBillFilters] = useState({
    status: 'all',
    category: 'all',
  });

  useEffect(() => {
    loadFinancialData();
  }, [dateRange]);

  const loadFinancialData = async () => {
    setLoading(true);
    try {
      const [fetchedInvoices, customers] = await Promise.all([
        Invoice.list(),
        Customer.list()
      ]);

      setInvoices(fetchedInvoices);

      // Calcular fluxo de caixa
      const today = new Date();
      const cashFlow = calculateCashFlow(fetchedInvoices, today);
      const forecast = calculateForecast(fetchedInvoices, customers);
      const monthlyData = generateMonthlyData(fetchedInvoices);
      const receiptsByStatus = calculateReceiptsByStatus(fetchedInvoices);
      const receiptsByPaymentMethod = calculateReceiptsByPaymentMethod(fetchedInvoices);

      setFinancialData({
        cashFlow,
        forecast,
        monthlyData,
        receiptsByStatus,
        receiptsByPaymentMethod
      });
    } catch (error) {
      console.error("Erro ao carregar dados financeiros:", error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível atualizar os dados financeiros",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateCashFlow = (invoices, today) => {
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const todayStr = format(today, 'yyyy-MM-dd');

    return invoices.reduce((acc, invoice) => {
      try {
        // Verificar se a fatura tem data de pagamento ou vencimento
        const paymentDate = invoice.payment_date ? new Date(invoice.payment_date) : null;
        const dueDate = invoice.due_date ? new Date(invoice.due_date) : null;
        
        // Se não tiver nenhuma data válida, pular esta fatura
        if (!paymentDate && !dueDate) {
          console.warn('Fatura sem data de pagamento ou vencimento:', invoice.id);
          return acc;
        }

        const amount = Number(invoice.amount);
        const invoiceDate = paymentDate || dueDate;
        const invoiceDateStr = format(invoiceDate, 'yyyy-MM-dd');

        // Atualizar saldo atual (considerando apenas faturas pagas)
        if (invoice.status === 'paid') {
          acc.currentBalance += amount;
        }

        // Movimentações do dia (faturas pagas hoje)
        if (invoice.status === 'paid' && invoiceDateStr === todayStr) {
          acc.todayIncome += amount;
        }

        // Movimentações do mês (faturas pagas este mês)
        if (
          invoice.status === 'paid' &&
          invoiceDate.getMonth() === currentMonth &&
          invoiceDate.getFullYear() === currentYear
        ) {
          acc.monthIncome += amount;
        }
      } catch (error) {
        console.error('Erro ao processar fatura:', error, invoice);
      }

      return acc;
    }, {
      currentBalance: 0,
      todayIncome: 0,
      todayExpenses: 0,
      monthIncome: 0,
      monthExpenses: 0
    });
  };

  const calculateForecast = (invoices, customers) => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const nextMonth = new Date(currentYear, currentMonth + 1, 1);
    const nextMonthEnd = new Date(currentYear, currentMonth + 2, 0);

    const forecast = {
      income: {
        currentMonth: 0,
        nextMonth: 0,
        overdue: 0
      },
      expenses: {
        currentMonth: 0,
        nextMonth: 0,
        overdue: 0
      }
    };

    // Calcular previsão baseada em faturas pendentes
    invoices.forEach(invoice => {
      try {
        if (!invoice.due_date) return;
        
        const dueDate = new Date(invoice.due_date);
        // Verificar se a data é válida
        if (isNaN(dueDate.getTime())) {
          console.warn('Data inválida encontrada:', invoice.due_date);
          return;
        }
        
        const amount = Number(invoice.amount);

        // Faturas vencidas
        if (dueDate < today && invoice.status !== 'paid' && invoice.status !== 'cancelled') {
          forecast.income.overdue += amount;
        } 
        // Faturas do mês atual
        else if (
          dueDate.getMonth() === currentMonth && 
          dueDate.getFullYear() === currentYear && 
          invoice.status === 'pending'
        ) {
          forecast.income.currentMonth += amount;
        } 
        // Faturas do próximo mês
        else if (
          dueDate >= nextMonth && 
          dueDate <= nextMonthEnd && 
          invoice.status === 'pending'
        ) {
          forecast.income.nextMonth += amount;
        }
      } catch (error) {
        console.error('Erro ao processar fatura:', error);
      }
    });

    // Se não houver faturas para o próximo mês, calcular com base nos clientes ativos
    if (forecast.income.nextMonth === 0) {
      const activeCustomers = customers.filter(c => c.status === 'active');
      
      Promise.all(
        activeCustomers.map(async customer => {
          try {
            if (!customer.plan) return 0;
            
            const plans = await Plan.list();
            const customerPlan = plans.find(p => p.code === customer.plan);
            return customerPlan ? customerPlan.monthly_price : getPlanValue(customer.plan);
          } catch (error) {
            console.error("Erro ao buscar plano:", error);
            return getPlanValue(customer.plan);
          }
        })
      ).then(values => {
        const totalMonthlyValue = values.reduce((sum, value) => sum + (value || 0), 0);
        forecast.income.nextMonth = totalMonthlyValue;
      }).catch(error => {
        console.error("Erro ao calcular previsão:", error);
      });
    }

    console.log("Previsão calculada:", forecast);
    return forecast;
  };

  // Fallback para valores de planos quando não conseguimos buscar da entidade
  const getPlanValue = (planCode) => {
    const planValues = {
      basic: 89.90,
      standard: 129.90,
      premium: 199.90,
      business: 499.90
    };
    return planValues[planCode] || 0;
  };

  const generateMonthlyData = (invoices) => {
    const monthlyData = [];
    const today = new Date();
    
    // Gerar dados para os últimos 6 meses e previsão para os próximos 6
    for (let i = -6; i < 6; i++) {
      const monthDate = addMonths(today, i);
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthDate);
      
      const monthInvoices = invoices.filter(invoice => {
        try {
          if (!invoice.due_date) return false;
          
          const dueDate = new Date(invoice.due_date);
          // Verificar se a data é válida
          if (isNaN(dueDate.getTime())) {
            console.warn('Data inválida encontrada:', invoice.due_date);
            return false;
          }
          
          return dueDate >= monthStart && dueDate <= monthEnd;
        } catch (error) {
          console.error('Erro ao processar fatura:', error);
          return false;
        }
      });

      const expectedRevenue = monthInvoices.reduce((sum, invoice) => {
        // Para meses passados e atual, considerar apenas faturas não canceladas
        if (i <= 0 && invoice.status !== 'cancelled') {
          return sum + Number(invoice.amount);
        }
        // Para meses futuros, considerar apenas faturas pendentes
        if (i > 0 && invoice.status === 'pending') {
          return sum + Number(invoice.amount);
        }
        return sum;
      }, 0);

      const realizedRevenue = monthInvoices
        .filter(invoice => invoice.status === 'paid')
        .reduce((sum, invoice) => sum + Number(invoice.amount), 0);

      monthlyData.push({
        month: format(monthDate, 'MMM/yy', { locale: ptBR }),
        previsto: expectedRevenue,
        realizado: i <= 0 ? realizedRevenue : 0
      });
    }

    return monthlyData;
  };

  const calculateReceiptsByStatus = (invoices) => {
    const statusLabels = {
      pending: "Pendente",
      paid: "Pago",
      overdue: "Vencido",
      cancelled: "Cancelado"
    };

    const statusCount = invoices.reduce((acc, invoice) => {
      acc[invoice.status] = (acc[invoice.status] || 0) + Number(invoice.amount);
      return acc;
    }, {});

    return Object.entries(statusCount).map(([status, value]) => ({
      name: statusLabels[status] || status,
      value
    }));
  };

  const calculateReceiptsByPaymentMethod = (invoices) => {
    const methodLabels = {
      bank_slip: "Boleto",
      credit_card: "Cartão de Crédito",
      pix: "PIX",
      other: "Outros"
    };

    // Considerar apenas faturas pagas
    const methodCount = invoices
      .filter(invoice => invoice.status === 'paid')
      .reduce((acc, invoice) => {
        const method = invoice.payment_method || 'other';
        acc[method] = (acc[method] || 0) + Number(invoice.amount);
        return acc;
      }, {});

    return Object.entries(methodCount).map(([method, value]) => ({
      name: methodLabels[method] || method,
      value
    }));
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  // Contas a Pagar Handlers
  const handleDeleteBill = (billId) => {
    setBills(bills.filter(bill => bill.id !== billId));
  };

  const handleBillStatusChange = (billId, newStatus) => {
    setBills(bills.map(bill =>
      bill.id === billId ? { ...bill, status: newStatus } : bill
    ));
  };

  // Filtro das Contas
  const filteredBills = bills.filter(bill => {
    const statusFilter = billFilters.status === 'all' || bill.status === billFilters.status;
    const categoryFilter = billFilters.category === 'all' || bill.category === billFilters.category;
    return statusFilter && categoryFilter;
  });

  const handleCreateInvoice = () => {
    setSelectedInvoice(null);
    setShowInvoiceForm(true);
  };

  const handleEditInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setShowInvoiceForm(true);
  };

  const handleDeleteInvoice = async (invoiceId) => {
    try {
      await Invoice.delete(invoiceId);
      setInvoices(invoices.filter(invoice => invoice.id !== invoiceId));
      toast({
        title: "Fatura excluída",
        description: "A fatura foi excluída com sucesso",
        variant: "default"
      });
    } catch (error) {
      console.error("Erro ao excluir fatura:", error);
      toast({
        title: "Erro ao excluir fatura",
        description: "Não foi possível excluir a fatura",
        variant: "destructive"
      });
    }
  };

  const handleReceivePayment = async (invoiceId) => {
    try {
      const paymentData = {
        invoice_id: invoiceId,
        amount: invoices.find(invoice => invoice.id === invoiceId)?.amount,
        payment_date: new Date().toISOString(),
        payment_method: 'cash' // Você pode adicionar um modal para selecionar o método de pagamento
      };

      await Invoice.registerPayment(invoiceId, paymentData);
      
      // Atualizar a lista de faturas
      const updatedInvoices = invoices.map(invoice => {
        if (invoice.id === invoiceId) {
          return {
            ...invoice,
            status: 'paid',
            payment_date: paymentData.payment_date
          };
        }
        return invoice;
      });

      setInvoices(updatedInvoices);
      toast({
        title: "Pagamento registrado",
        description: "O pagamento foi registrado com sucesso",
        variant: "default"
      });
    } catch (error) {
      console.error("Erro ao registrar pagamento:", error);
      toast({
        title: "Erro ao registrar pagamento",
        description: "Não foi possível registrar o pagamento",
        variant: "destructive"
      });
    }
  };

  const handleStatusChange = async (invoiceId, newStatus) => {
    try {
      await Invoice.update(invoiceId, {
        status: newStatus,
        payment_date: newStatus === 'paid' ? new Date().toISOString() : null
      });
      toast({
        title: "Status atualizado",
        description: "O status da fatura foi atualizado com sucesso",
      });
      loadFinancialData(); // Recarregar dados
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar o status da fatura",
        variant: "destructive"
      });
    }
  };

  const handleSubmitInvoice = async (data) => {
    try {
      if (selectedInvoice) {
        await Invoice.update(selectedInvoice.id, data);
        toast({
          title: "Fatura atualizada",
          description: "A fatura foi atualizada com sucesso",
        });
      } else {
        await Invoice.create(data);
        toast({
          title: "Fatura criada",
          description: "A fatura foi criada com sucesso",
        });
      }
      setShowInvoiceForm(false);
      loadFinancialData(); // Recarregar dados
    } catch (error) {
      console.error("Erro ao salvar fatura:", error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar a fatura",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Gestão Financeira</h2>
        <div className="flex items-center space-x-2">
          <DateRangePicker
            value={dateRange}
            onValueChange={setDateRange}
          />
        </div>
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="invoices">Faturas</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Resumo do Mês</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={financialData.receiptsByStatus}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {financialData.receiptsByStatus.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => value.toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        })}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Métodos de Pagamento</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={financialData.receiptsByPaymentMethod}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {financialData.receiptsByPaymentMethod.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => value.toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        })}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="invoices">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Faturas</h2>
            <Button onClick={handleCreateInvoice}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Fatura
            </Button>
          </div>
          
          <InvoiceList
            invoices={invoices}
            onEdit={handleEditInvoice}
            onDelete={handleDeleteInvoice}
            onStatusChange={handleStatusChange}
            onReceivePayment={handleReceivePayment}
          />
        </TabsContent>

        <TabsContent value="reports">
          {/* ... conteúdo existente dos relatórios ... */}
        </TabsContent>
      </Tabs>

      <Dialog open={showInvoiceForm} onOpenChange={setShowInvoiceForm}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {selectedInvoice ? 'Editar Fatura' : 'Nova Fatura'}
            </DialogTitle>
          </DialogHeader>
          <InvoiceForm
            invoice={selectedInvoice}
            onSubmit={handleSubmitInvoice}
            onCancel={() => setShowInvoiceForm(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
