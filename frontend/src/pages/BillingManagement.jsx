
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Invoice } from "@/api/entities";
import { Customer } from "@/api/entities";
import { InvokeLLM } from "@/api/integrations";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DollarSign,
  Search,
  FileText,
  Download,
  Plus,
  Check,
  Clock,
  AlertTriangle,
  CreditCard,
  Calendar,
  BarChart,
  Mail,
  Printer,
  Users,
  X
} from "lucide-react";

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  paid: "bg-green-100 text-green-800",
  overdue: "bg-red-100 text-red-800",
  cancelled: "bg-gray-100 text-gray-800",
};

const statusLabels = {
  pending: "Pendente",
  paid: "Pago",
  overdue: "Vencido",
  cancelled: "Cancelado"
};

export default function BillingManagementPage() {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [dateRange, setDateRange] = useState("this_month");
  const [showBatchOptions, setShowBatchOptions] = useState(false);
  const [selectedInvoices, setSelectedInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showInvoiceDetails, setShowInvoiceDetails] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [billingStats, setBillingStats] = useState({
    total_pending: 0,
    total_paid: 0,
    total_overdue: 0,
    total_invoices: 0,
    revenue_this_month: 0,
    revenue_last_month: 0,
    percent_change: 0
  });
  
  useEffect(() => {
    loadData();
  }, []);
  
  useEffect(() => {
    calculateBillingStats();
  }, [invoices]);
  
  const loadData = async () => {
    try {
      setLoading(true);
      const invoiceData = await Invoice.list('-created_date');
      const customerData = await Customer.list();
      
      setInvoices(invoiceData);
      setCustomers(customerData);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const calculateBillingStats = () => {
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    
    let totalPending = 0;
    let totalPaid = 0;
    let totalOverdue = 0;
    let revenueThisMonth = 0;
    let revenueLastMonth = 0;
    
    invoices.forEach(invoice => {
      const invoiceDate = new Date(invoice.created_date);
      
      // Contagem por status
      if (invoice.status === 'pending') totalPending += invoice.amount || 0;
      if (invoice.status === 'paid') totalPaid += invoice.amount || 0;
      if (invoice.status === 'overdue') totalOverdue += invoice.amount || 0;
      
      // Receita deste mês (faturas pagas)
      if (
        invoice.status === 'paid' && 
        invoiceDate >= thisMonthStart && 
        invoiceDate <= now
      ) {
        revenueThisMonth += invoice.amount || 0;
      }
      
      // Receita do mês passado (faturas pagas)
      if (
        invoice.status === 'paid' && 
        invoiceDate >= lastMonthStart && 
        invoiceDate <= lastMonthEnd
      ) {
        revenueLastMonth += invoice.amount || 0;
      }
    });
    
    // Calcular variação percentual
    const percentChange = revenueLastMonth > 0 
      ? ((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100 
      : 0;
    
    setBillingStats({
      total_pending: totalPending,
      total_paid: totalPaid,
      total_overdue: totalOverdue,
      total_invoices: invoices.length,
      revenue_this_month: revenueThisMonth,
      revenue_last_month: revenueLastMonth,
      percent_change: percentChange
    });
  };
  
  const filterInvoicesByDate = (invoices) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisYearStart = new Date(now.getFullYear(), 0, 1);
    
    const last30Days = new Date(now);
    last30Days.setDate(now.getDate() - 30);
    
    return invoices.filter(invoice => {
      const invoiceDate = new Date(invoice.due_date);
      
      switch (dateRange) {
        case 'today':
          return invoiceDate.getDate() === today.getDate() &&
                 invoiceDate.getMonth() === today.getMonth() &&
                 invoiceDate.getFullYear() === today.getFullYear();
        case 'this_month':
          return invoiceDate >= thisMonthStart && invoiceDate <= now;
        case 'last_30_days':
          return invoiceDate >= last30Days && invoiceDate <= now;
        case 'this_year':
          return invoiceDate >= thisYearStart && invoiceDate <= now;
        case 'all':
        default:
          return true;
      }
    });
  };
  
  const getFilteredInvoices = () => {
    let filtered = [...invoices];
    
    // Filtrar por data
    filtered = filterInvoicesByDate(filtered);
    
    // Filtrar por status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(invoice => invoice.status === selectedStatus);
    }
    
    // Filtrar por termo de busca
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(invoice => {
        const customer = customers.find(c => c.id === invoice.customer_id);
        const customerName = customer ? customer.full_name.toLowerCase() : '';
        
        return customerName.includes(term) || 
               (invoice.invoice_number && invoice.invoice_number.toLowerCase().includes(term));
      });
    }
    
    return filtered;
  };
  
  const handleViewInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setShowInvoiceDetails(true);
  };
  
  const handleCloseInvoiceDetails = () => {
    setSelectedInvoice(null);
    setShowInvoiceDetails(false);
  };
  
  const handleStatusChange = async (invoiceId, newStatus) => {
    try {
      const invoice = invoices.find(inv => inv.id === invoiceId);
      if (!invoice) return;
      
      let updatedData = {
        ...invoice,
        status: newStatus
      };
      
      if (newStatus === 'paid' && invoice.status !== 'paid') {
        updatedData.payment_date = new Date().toISOString();
      }
      
      await Invoice.update(invoiceId, updatedData);
      
      // Atualizar a lista de faturas
      setInvoices(prev => 
        prev.map(inv => inv.id === invoiceId ? {...inv, ...updatedData} : inv)
      );
      
      // Se estiver visualizando detalhes, atualizar o invoice selecionado
      if (selectedInvoice && selectedInvoice.id === invoiceId) {
        setSelectedInvoice({...selectedInvoice, ...updatedData});
      }
    } catch (error) {
      console.error("Erro ao atualizar status da fatura:", error);
    }
  };
  
  const handleBatchSelect = (invoiceId) => {
    setSelectedInvoices(prev => {
      if (prev.includes(invoiceId)) {
        return prev.filter(id => id !== invoiceId);
      } else {
        return [...prev, invoiceId];
      }
    });
  };
  
  const handleBatchAction = async (action) => {
    if (selectedInvoices.length === 0) return;
    
    try {
      // Processamento em lote conforme a ação
      switch (action) {
        case 'mark_paid':
          for (const id of selectedInvoices) {
            await handleStatusChange(id, 'paid');
          }
          break;
        case 'mark_overdue':
          for (const id of selectedInvoices) {
            await handleStatusChange(id, 'overdue');
          }
          break;
        case 'send_reminders':
          // Implementar envio de lembretes via email
          alert(`Enviando lembretes para ${selectedInvoices.length} faturas`);
          break;
        default:
          break;
      }
      
      // Limpar seleções após concluir ação
      setSelectedInvoices([]);
      setShowBatchOptions(false);
    } catch (error) {
      console.error("Erro ao processar ação em lote:", error);
    }
  };
  
  const handleCreateMonthlyInvoices = async () => {
    setIsCreating(true);
    
    try {
      // Lógica para gerar faturas mensais para todos os clientes ativos
      const activeCustomers = customers.filter(c => c.status === 'active');
      
      // Verificar quais clientes ainda não possuem fatura para o mês atual
      const now = new Date();
      const thisMonth = now.getMonth();
      const thisYear = now.getFullYear();
      
      const newInvoices = [];
      
      for (const customer of activeCustomers) {
        // Verificar se já existe fatura para este cliente neste mês
        const existingInvoice = invoices.some(inv => {
          const invDate = new Date(inv.due_date);
          return (
            inv.customer_id === customer.id &&
            invDate.getMonth() === thisMonth &&
            invDate.getFullYear() === thisYear
          );
        });
        
        if (!existingInvoice) {
          // Determinar valor da fatura com base no plano
          let amount;
          switch (customer.plan) {
            case 'basic': amount = 99.90; break;
            case 'standard': amount = 129.90; break;
            case 'premium': amount = 159.90; break;
            case 'enterprise': amount = 399.90; break;
            default: amount = 99.90;
          }
          
          // Criar nova fatura
          const dueDate = new Date(now);
          dueDate.setDate(10); // Vencimento no dia 10
          if (now.getDate() > 10) {
            dueDate.setMonth(dueDate.getMonth() + 1); // Próximo mês se já passou do dia 10
          }
          
          const invoiceNumber = `INV-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}-${customer.id.slice(-4)}`;
          
          const newInvoice = {
            customer_id: customer.id,
            amount: amount,
            due_date: dueDate.toISOString(),
            status: 'pending',
            payment_method: 'bank_slip',
            invoice_number: invoiceNumber
          };
          
          const created = await Invoice.create(newInvoice);
          newInvoices.push(created);
        }
      }
      
      if (newInvoices.length > 0) {
        setInvoices(prev => [...newInvoices, ...prev]);
        alert(`${newInvoices.length} novas faturas geradas com sucesso!`);
      } else {
        alert("Todos os clientes já possuem faturas para o mês atual.");
      }
      
    } catch (error) {
      console.error("Erro ao gerar faturas mensais:", error);
      alert("Erro ao gerar faturas. Verifique o console para mais detalhes.");
    } finally {
      setIsCreating(false);
    }
  };
  
  const handleSendInvoiceEmail = async (invoiceId) => {
    try {
      const invoice = invoices.find(inv => inv.id === invoiceId);
      if (!invoice) return;
      
      const customer = customers.find(c => c.id === invoice.customer_id);
      if (!customer || !customer.email) {
        alert("Cliente não possui email cadastrado.");
        return;
      }
      
      // Simulação de envio de email
      alert(`Email de fatura enviado para ${customer.email}`);
      
    } catch (error) {
      console.error("Erro ao enviar email:", error);
      alert("Erro ao enviar email. Verifique o console para mais detalhes.");
    }
  };
  
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };
  
  // Função para obter nome do cliente
  const getCustomerName = (customerId) => {
    const customer = customers.find(c => c.id === customerId);
    return customer ? customer.full_name : "Cliente não encontrado";
  };
  
  const filteredInvoices = getFilteredInvoices();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gerenciamento de Faturamento</h1>
          <p className="text-gray-500">Gerencie e monitore todas as faturas e pagamentos</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate(createPageUrl("Invoices"))} variant="outline" className="gap-2">
            <Plus className="h-4 w-4" />
            Nova Fatura
          </Button>
          <Button onClick={handleCreateMonthlyInvoices} className="bg-blue-600 gap-2" disabled={isCreating}>
            {isCreating ? (
              <>
                <span className="animate-spin">
                  <Clock className="h-4 w-4" />
                </span>
                Processando...
              </>
            ) : (
              <>
                <Calendar className="h-4 w-4" />
                Gerar Faturas Mensais
              </>
            )}
          </Button>
        </div>
      </div>
      
      {/* Cards de resumo financeiro */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Pendente
                </p>
                <p className="text-2xl font-bold mt-1">
                  {formatCurrency(billingStats.total_pending)}
                </p>
              </div>
              <div className="p-2 rounded-full bg-yellow-100">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Pago
                </p>
                <p className="text-2xl font-bold mt-1">
                  {formatCurrency(billingStats.total_paid)}
                </p>
              </div>
              <div className="p-2 rounded-full bg-green-100">
                <Check className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Vencido
                </p>
                <p className="text-2xl font-bold mt-1">
                  {formatCurrency(billingStats.total_overdue)}
                </p>
              </div>
              <div className="p-2 rounded-full bg-red-100">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Receita do Mês
                </p>
                <p className="text-2xl font-bold mt-1">
                  {formatCurrency(billingStats.revenue_this_month)}
                </p>
                <p className={`text-xs mt-1 ${billingStats.percent_change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {billingStats.percent_change >= 0 ? '↑' : '↓'} {Math.abs(billingStats.percent_change).toFixed(1)}% vs. mês anterior
                </p>
              </div>
              <div className="p-2 rounded-full bg-blue-100">
                <DollarSign className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="invoices">
        <TabsList>
          <TabsTrigger value="invoices">Faturas</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
        </TabsList>
        
        <TabsContent value="invoices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciar Faturas</CardTitle>
              <CardDescription>
                Visualize, filtre e gerencie todas as faturas do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Filtros */}
                <div className="flex flex-wrap gap-4">
                  <div className="flex-1 min-w-[200px]">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                      <Input
                        placeholder="Buscar por cliente ou número de fatura..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="w-[180px]">
                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                      <SelectTrigger>
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os Status</SelectItem>
                        <SelectItem value="pending">Pendente</SelectItem>
                        <SelectItem value="paid">Pago</SelectItem>
                        <SelectItem value="overdue">Vencido</SelectItem>
                        <SelectItem value="cancelled">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="w-[180px]">
                    <Select value={dateRange} onValueChange={setDateRange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Período" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="today">Hoje</SelectItem>
                        <SelectItem value="this_month">Este Mês</SelectItem>
                        <SelectItem value="last_30_days">Últimos 30 Dias</SelectItem>
                        <SelectItem value="this_year">Este Ano</SelectItem>
                        <SelectItem value="all">Todos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Button 
                    variant={showBatchOptions ? "default" : "outline"}
                    onClick={() => setShowBatchOptions(!showBatchOptions)}
                  >
                    Ações em Lote
                  </Button>
                </div>
                
                {/* Opções de ações em lote */}
                {showBatchOptions && (
                  <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-md">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleBatchAction('mark_paid')}
                      disabled={selectedInvoices.length === 0}
                    >
                      <Check className="mr-2 h-4 w-4" />
                      Marcar como Pago
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleBatchAction('mark_overdue')}
                      disabled={selectedInvoices.length === 0}
                    >
                      <AlertTriangle className="mr-2 h-4 w-4" />
                      Marcar como Vencido
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleBatchAction('send_reminders')}
                      disabled={selectedInvoices.length === 0}
                    >
                      <Mail className="mr-2 h-4 w-4" />
                      Enviar Lembrete
                    </Button>
                    <div className="ml-auto">
                      <span className="text-sm text-gray-500">
                        {selectedInvoices.length} faturas selecionadas
                      </span>
                    </div>
                  </div>
                )}
                
                {/* Tabela de faturas */}
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {showBatchOptions && (
                          <TableHead className="w-[50px]">
                            <Checkbox 
                              checked={
                                filteredInvoices.length > 0 && 
                                filteredInvoices.every(inv => selectedInvoices.includes(inv.id))
                              }
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedInvoices(filteredInvoices.map(inv => inv.id));
                                } else {
                                  setSelectedInvoices([]);
                                }
                              }}
                            />
                          </TableHead>
                        )}
                        <TableHead>Fatura</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Vencimento</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Método</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={showBatchOptions ? 8 : 7} className="text-center py-8">
                            <div className="flex justify-center">
                              <div className="animate-spin h-8 w-8 border-4 border-blue-600 rounded-full border-t-transparent"></div>
                            </div>
                            <div className="mt-2 text-sm text-gray-500">Carregando faturas...</div>
                          </TableCell>
                        </TableRow>
                      ) : filteredInvoices.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={showBatchOptions ? 8 : 7} className="text-center py-8">
                            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                            <p className="text-gray-500">Nenhuma fatura encontrada</p>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredInvoices.map((invoice) => (
                          <TableRow key={invoice.id}>
                            {showBatchOptions && (
                              <TableCell>
                                <Checkbox 
                                  checked={selectedInvoices.includes(invoice.id)}
                                  onCheckedChange={() => handleBatchSelect(invoice.id)}
                                />
                              </TableCell>
                            )}
                            <TableCell className="font-medium">
                              {invoice.invoice_number || `Fatura #${invoice.id.slice(-4)}`}
                            </TableCell>
                            <TableCell>{getCustomerName(invoice.customer_id)}</TableCell>
                            <TableCell>{formatCurrency(invoice.amount || 0)}</TableCell>
                            <TableCell>{formatDate(invoice.due_date)}</TableCell>
                            <TableCell>
                              <Badge className={statusColors[invoice.status]}>
                                {statusLabels[invoice.status]}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {invoice.payment_method === 'bank_slip' && 'Boleto'}
                              {invoice.payment_method === 'credit_card' && 'Cartão de Crédito'}
                              {invoice.payment_method === 'pix' && 'PIX'}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => handleViewInvoice(invoice)}
                                >
                                  <FileText className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => handleSendInvoiceEmail(invoice.id)}
                                >
                                  <Mail className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Relatórios Financeiros</CardTitle>
              <CardDescription>
                Visualize relatórios e estatísticas financeiras
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="rounded-lg border p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium">Receita Mensal</h3>
                      <BarChart className="h-5 w-5 text-gray-400" />
                    </div>
                    <div className="mt-8 h-60 bg-gray-100 rounded flex items-center justify-center">
                      <p className="text-gray-500">Gráfico de receita mensal seria exibido aqui</p>
                    </div>
                    <div className="mt-4 text-sm text-gray-500">
                      <p>Receita total deste mês: {formatCurrency(billingStats.revenue_this_month)}</p>
                      <p>Comparação com mês anterior: {formatCurrency(billingStats.revenue_last_month)}</p>
                    </div>
                  </div>
                  
                  <div className="rounded-lg border p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium">Distribuição por Status</h3>
                      <DollarSign className="h-5 w-5 text-gray-400" />
                    </div>
                    <div className="mt-8 h-60 bg-gray-100 rounded flex items-center justify-center">
                      <p className="text-gray-500">Gráfico de distribuição de status seria exibido aqui</p>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="inline-block w-3 h-3 rounded-full bg-yellow-400 mr-2"></span>
                        Pendente: {formatCurrency(billingStats.total_pending)}
                      </div>
                      <div>
                        <span className="inline-block w-3 h-3 rounded-full bg-green-400 mr-2"></span>
                        Pago: {formatCurrency(billingStats.total_paid)}
                      </div>
                      <div>
                        <span className="inline-block w-3 h-3 rounded-full bg-red-400 mr-2"></span>
                        Vencido: {formatCurrency(billingStats.total_overdue)}
                      </div>
                      <div>
                        <span className="inline-block w-3 h-3 rounded-full bg-gray-400 mr-2"></span>
                        Cancelado: {formatCurrency(0)}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-4">
                  <Button variant="outline" className="gap-2">
                    <Download className="h-4 w-4" />
                    Exportar Relatórios
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <Printer className="h-4 w-4" />
                    Imprimir Relatório
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <Users className="h-4 w-4" />
                    Clientes em Atraso
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Modal de Detalhes da Fatura */}
      {showInvoiceDetails && selectedInvoice && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-bold">
                    {selectedInvoice.invoice_number || `Fatura #${selectedInvoice.id.slice(-4)}`}
                  </h2>
                  <p className="text-gray-500">
                    Cliente: {getCustomerName(selectedInvoice.customer_id)}
                  </p>
                </div>
                <Badge className={statusColors[selectedInvoice.status]}>
                  {statusLabels[selectedInvoice.status]}
                </Badge>
              </div>
              
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Valor da Fatura</p>
                    <p className="text-lg font-bold">{formatCurrency(selectedInvoice.amount || 0)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Data de Vencimento</p>
                    <p className="text-lg">{formatDate(selectedInvoice.due_date)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Método de Pagamento</p>
                    <p className="text-lg">
                      {selectedInvoice.payment_method === 'bank_slip' && 'Boleto'}
                      {selectedInvoice.payment_method === 'credit_card' && 'Cartão de Crédito'}
                      {selectedInvoice.payment_method === 'pix' && 'PIX'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Data de Pagamento</p>
                    <p className="text-lg">
                      {selectedInvoice.payment_date ? formatDate(selectedInvoice.payment_date) : '-'}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="font-medium">Alterar Status</p>
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      variant={selectedInvoice.status === 'pending' ? 'default' : 'outline'} 
                      size="sm"
                      onClick={() => handleStatusChange(selectedInvoice.id, 'pending')}
                    >
                      <Clock className="mr-2 h-4 w-4" />
                      Pendente
                    </Button>
                    <Button 
                      variant={selectedInvoice.status === 'paid' ? 'default' : 'outline'} 
                      size="sm"
                      onClick={() => handleStatusChange(selectedInvoice.id, 'paid')}
                    >
                      <Check className="mr-2 h-4 w-4" />
                      Pago
                    </Button>
                    <Button 
                      variant={selectedInvoice.status === 'overdue' ? 'default' : 'outline'} 
                      size="sm"
                      onClick={() => handleStatusChange(selectedInvoice.id, 'overdue')}
                    >
                      <AlertTriangle className="mr-2 h-4 w-4" />
                      Vencido
                    </Button>
                    <Button 
                      variant={selectedInvoice.status === 'cancelled' ? 'default' : 'outline'} 
                      size="sm"
                      onClick={() => handleStatusChange(selectedInvoice.id, 'cancelled')}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Cancelado
                    </Button>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 pt-4 border-t">
                  <Button 
                    variant="outline" 
                    className="gap-2"
                    onClick={() => handleSendInvoiceEmail(selectedInvoice.id)}
                  >
                    <Mail className="h-4 w-4" />
                    Enviar por Email
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <Download className="h-4 w-4" />
                    Download PDF
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <Printer className="h-4 w-4" />
                    Imprimir
                  </Button>
                </div>
              </div>
              
              <div className="flex justify-end mt-6">
                <Button onClick={handleCloseInvoiceDetails}>
                  Fechar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
