
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
import { Dialog, DialogContent } from "@/components/ui/dialog";

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
      const [invoices, customers] = await Promise.all([
        Invoice.list(),
        Customer.list()
      ]);

      // Calcular fluxo de caixa
      const today = new Date();
      const cashFlow = calculateCashFlow(invoices, today);
      const forecast = calculateForecast(invoices, customers);
      const monthlyData = generateMonthlyData(invoices, customers);
      const receiptsByStatus = calculateReceiptsByStatus(invoices);
      const receiptsByPaymentMethod = calculateReceiptsByPaymentMethod(invoices);

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
      const invoiceDate = new Date(invoice.payment_date || invoice.due_date);
      const amount = Number(invoice.amount);
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
      if (!invoice.due_date) return;
      
      const dueDate = new Date(invoice.due_date);
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
        const dueDate = new Date(invoice.due_date);
        return dueDate >= monthStart && dueDate <= monthEnd;
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Financeiro</h1>
        <div className="flex gap-2">
          <DateRangePicker
            from={dateRange.from}
            to={dateRange.to}
            onSelect={setDateRange}
          />
          <Button className="bg-green-600">
            <Plus className="w-4 h-4 mr-2" />
            Nova Transação
          </Button>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Saldo em Caixa</CardTitle>
            <Wallet className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {financialData.cashFlow.currentBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-gray-500">
              Atualizado em {format(new Date(), "dd/MM/yyyy")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Movimentação do Dia</CardTitle>
            <Calendar className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="flex items-center text-green-600">
                <ArrowUpRight className="h-4 w-4 mr-1" />
                <span>+ R$ {financialData.cashFlow.todayIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex items-center text-red-600">
                <ArrowDownRight className="h-4 w-4 mr-1" />
                <span>- R$ {financialData.cashFlow.todayExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Previsão de Recebimentos</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {financialData.forecast.income.currentMonth.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-gray-500">
              Próximo mês: R$ {financialData.forecast.income.nextMonth.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Inadimplência</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              R$ {financialData.forecast.income.overdue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-gray-500">
              Total de faturas vencidas
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="cash-flow">Fluxo de Caixa</TabsTrigger>
          <TabsTrigger value="receivables">Contas a Receber</TabsTrigger>
          <TabsTrigger value="payables">Contas a Pagar</TabsTrigger>
          <TabsTrigger value="analytics">Análise</TabsTrigger>
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

        <TabsContent value="cash-flow">
          <Card>
            <CardHeader>
              <CardTitle>Fluxo de Caixa</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={financialData.monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis 
                      tickFormatter={(value) => 
                        value.toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        })
                      }
                    />
                    <Tooltip 
                      formatter={(value) => 
                        value.toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        })
                      }
                    />
                    <Legend />
                    <Bar name="Previsto" dataKey="previsto" fill="#4CAF50" />
                    <Bar name="Realizado" dataKey="realizado" fill="#2196F3" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="receivables">
          <Card>
            <CardHeader>
              <CardTitle>Contas a Receber</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={financialData.monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis 
                      tickFormatter={(value) => 
                        value.toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        })
                      }
                    />
                    <Tooltip 
                      formatter={(value) => 
                        value.toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        })
                      }
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      name="Previsto" 
                      dataKey="previsto" 
                      stroke="#4CAF50" 
                      strokeWidth={2}
                    />
                    <Line 
                      type="monotone" 
                      name="Realizado" 
                      dataKey="realizado" 
                      stroke="#2196F3" 
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payables">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Contas a Pagar</CardTitle>
              <Button onClick={() => setShowBillForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Nova Conta
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Filtros */}
                <div className="flex gap-2">
                  <Select
                    value={billFilters.status}
                    onValueChange={(value) => setBillFilters(prev => ({...prev, status: value}))}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="pending">Pendentes</SelectItem>
                      <SelectItem value="paid">Pagas</SelectItem>
                      <SelectItem value="overdue">Vencidas</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={billFilters.category}
                    onValueChange={(value) => setBillFilters(prev => ({...prev, category: value}))}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      <SelectItem value="fuel">Combustível</SelectItem>
                      <SelectItem value="energy">Energia</SelectItem>
                      <SelectItem value="internet">Internet</SelectItem>
                      <SelectItem value="rent">Aluguel</SelectItem>
                      <SelectItem value="maintenance">Manutenção</SelectItem>
                      <SelectItem value="salary">Salários</SelectItem>
                      <SelectItem value="supplies">Suprimentos</SelectItem>
                      <SelectItem value="others">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Lista de Contas */}
                <BillsList 
                  bills={filteredBills} 
                  onEdit={(bill) => {
                    setSelectedBill(bill);
                    setShowBillForm(true);
                  }}
                  onDelete={handleDeleteBill}
                  onStatusChange={handleBillStatusChange}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Status</CardTitle>
              </CardHeader>
              <CardContent>
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
                <CardTitle>Tendência de Recebimentos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={financialData.monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis 
                        tickFormatter={(value) => 
                          value.toLocaleString('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          })
                        }
                      />
                      <Tooltip 
                        formatter={(value) => 
                          value.toLocaleString('pt-BR', {
                            style: 'currency',
                            currency: 'BRL'
                          })
                        }
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        name="Realizado" 
                        dataKey="realizado" 
                        stroke="#2196F3" 
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Modal para nova conta */}
      <Dialog open={showBillForm} onOpenChange={setShowBillForm}>
        <DialogContent className="max-w-4xl">
          <BillForm
            bill={selectedBill}
            onSubmit={() => {
              setShowBillForm(false);
              setSelectedBill(null);
              loadFinancialData();
            }}
            onCancel={() => {
              setShowBillForm(false);
              setSelectedBill(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
