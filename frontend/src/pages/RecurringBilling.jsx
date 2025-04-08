import React, { useState, useEffect } from "react";
import { BillingSchedule } from "@/api/entities";
import { Customer } from "@/api/entities";
import { Plan } from "@/api/entities";
import { PaymentGateway } from "@/api/entities";
import { Invoice } from "@/api/entities";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  CalendarIcon,
  Plus,
  Search,
  RefreshCw,
  Clock,
  Settings,
  CreditCard,
  Calendar as CalendarIcon2,
  ArrowRight,
  Bell,
  CheckCircle,
  XCircle,
  AlertTriangle,
  MoreHorizontal,
  BarChart2,
  Pause,
  Play,
  Trash2,
  Edit,
  Eye,
  FileText,
  Filter,
  Download,
  Receipt,
  Repeat,
  LayoutList,
  ChevronDown,
  Users,
  ClipboardList,
  Loader2,
  DollarSign
} from "lucide-react";
import { format, addMonths, addDays, differenceInDays, isBefore, isAfter } from "date-fns";
import { ptBR } from "date-fns/locale";
import BillingScheduleForm from "../components/billing/BillingScheduleForm";
import BillingScheduleDetails from "../components/billing/BillingScheduleDetails";

export default function RecurringBilling() {
  const [activeTab, setActiveTab] = useState("schedules");
  const [schedules, setSchedules] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scheduleStats, setScheduleStats] = useState({
    total: 0,
    active: 0,
    paused: 0,
    upcoming: 0,
    monthlyRevenue: 0
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [processingSchedule, setProcessingSchedule] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Carregar todos os dados necessários
      const schedulesData = await BillingSchedule.list();
      const customersData = await Customer.list();
      
      // Tentar carregar planos se a entidade existir
      let plansData = [];
      try {
        plansData = await Plan.list();
      } catch (error) {
        console.warn("Entidade Plan não disponível:", error);
      }
      
      // Carregar faturas para relacionamento
      const invoicesData = await Invoice.list();
      
      // Atualizar estados
      setSchedules(schedulesData);
      setCustomers(customersData);
      setPlans(plansData);
      setInvoices(invoicesData);
      
      // Calcular estatísticas
      calculateStats(schedulesData);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (schedulesData) => {
    const now = new Date();
    const thirtyDaysFromNow = addDays(now, 30);
    
    const stats = {
      total: schedulesData.length,
      active: schedulesData.filter(s => s.status === 'active').length,
      paused: schedulesData.filter(s => s.status === 'paused').length,
      upcoming: schedulesData.filter(s => {
        const nextDate = s.next_billing_date ? new Date(s.next_billing_date) : null;
        return s.status === 'active' && 
               nextDate && 
               isAfter(nextDate, now) && 
               isBefore(nextDate, thirtyDaysFromNow);
      }).length,
      monthlyRevenue: schedulesData
        .filter(s => s.status === 'active')
        .reduce((sum, schedule) => {
          // Normalizar para valor mensal com base na frequência
          let monthlyFactor = 1; // mensal
          
          switch (schedule.frequency) {
            case 'bimonthly': monthlyFactor = 0.5; break;
            case 'quarterly': monthlyFactor = 0.333; break;
            case 'semiannual': monthlyFactor = 0.167; break;
            case 'annual': monthlyFactor = 0.0833; break;
            default: monthlyFactor = 1;
          }
          
          return sum + (schedule.amount * monthlyFactor);
        }, 0)
    };
    
    setScheduleStats(stats);
  };

  const handleScheduleSubmit = async (scheduleData) => {
    try {
      let savedSchedule;
      
      if (selectedSchedule) {
        // Atualizar agendamento existente
        savedSchedule = await BillingSchedule.update(selectedSchedule.id, scheduleData);
        
        // Atualizar na lista
        setSchedules(prevSchedules => 
          prevSchedules.map(s => s.id === savedSchedule.id ? savedSchedule : s)
        );
      } else {
        // Criar novo agendamento
        savedSchedule = await BillingSchedule.create(scheduleData);
        
        // Adicionar à lista
        setSchedules(prevSchedules => [...prevSchedules, savedSchedule]);
      }
      
      // Recalcular estatísticas
      calculateStats([...schedules.filter(s => s.id !== savedSchedule.id), savedSchedule]);
      
      // Limpar seleção e fechar formulário
      setSelectedSchedule(null);
      setShowForm(false);
    } catch (error) {
      console.error("Erro ao salvar agendamento:", error);
      alert("Ocorreu um erro ao salvar o agendamento. Verifique os dados e tente novamente.");
    }
  };

  const handleViewDetails = (schedule) => {
    setSelectedSchedule(schedule);
    setShowDetails(true);
  };

  const handleEditSchedule = (schedule) => {
    setSelectedSchedule(schedule);
    setShowForm(true);
  };

  const handleDeleteSchedule = async (schedule) => {
    if (window.confirm(`Tem certeza que deseja excluir o agendamento "${schedule.title}"?`)) {
      try {
        await BillingSchedule.delete(schedule.id);
        
        // Remover da lista
        setSchedules(prevSchedules => prevSchedules.filter(s => s.id !== schedule.id));
        
        // Recalcular estatísticas
        calculateStats(schedules.filter(s => s.id !== schedule.id));
      } catch (error) {
        console.error("Erro ao excluir agendamento:", error);
        alert("Ocorreu um erro ao excluir o agendamento.");
      }
    }
  };

  const handleStatusChange = async (schedule, newStatus) => {
    try {
      const updatedSchedule = {
        ...schedule,
        status: newStatus
      };
      
      // Se reativando, atualizar próxima data de cobrança
      if (newStatus === 'active' && schedule.status === 'paused') {
        const today = new Date();
        const nextDueDate = getNextDueDate(today, schedule.due_day, schedule.frequency);
        updatedSchedule.next_billing_date = nextDueDate.toISOString().split('T')[0];
      }
      
      await BillingSchedule.update(schedule.id, updatedSchedule);
      
      // Atualizar na lista
      setSchedules(prevSchedules => 
        prevSchedules.map(s => s.id === schedule.id ? updatedSchedule : s)
      );
      
      // Recalcular estatísticas
      calculateStats([...schedules.filter(s => s.id !== schedule.id), updatedSchedule]);
    } catch (error) {
      console.error("Erro ao alterar status do agendamento:", error);
      alert("Ocorreu um erro ao alterar o status do agendamento.");
    }
  };

  const handleGenerateInvoiceNow = async (schedule) => {
    try {
      setProcessingSchedule(schedule.id);
      
      // Encontrar dados do cliente
      const customer = customers.find(c => c.id === schedule.customer_id);
      
      if (!customer) {
        alert("Cliente não encontrado");
        return;
      }
      
      // Dados para nova fatura
      const today = new Date();
      const dueDate = getNextDueDate(today, schedule.due_day);
      
      const invoiceData = {
        customer_id: schedule.customer_id,
        amount: schedule.amount,
        due_date: dueDate.toISOString().split('T')[0],
        status: "pending",
        payment_method: schedule.payment_method === 'default' ? 'bank_slip' : schedule.payment_method,
        payment_gateway_id: schedule.payment_gateway_id,
        description: `${schedule.title} - Gerado manualmente em ${format(today, 'dd/MM/yyyy')}`,
        billing_schedule_id: schedule.id
      };
      
      // Criar fatura
      const newInvoice = await Invoice.create(invoiceData);
      
      // Atualizar agendamento
      const updatedSchedule = {
        ...schedule,
        last_generated_invoice_id: newInvoice.id,
        last_execution_date: new Date().toISOString(),
        next_billing_date: getNextDueDate(
          new Date(dueDate), 
          schedule.due_day, 
          schedule.frequency, 
          schedule.custom_days
        ).toISOString().split('T')[0]
      };
      
      if (schedule.installments && schedule.installments_generated) {
        updatedSchedule.installments_generated = schedule.installments_generated + 1;
        
        // Verificar se chegou ao limite de parcelas
        if (updatedSchedule.installments_generated >= schedule.installments) {
          updatedSchedule.status = 'completed';
        }
      }
      
      await BillingSchedule.update(schedule.id, updatedSchedule);
      
      // Atualizar listas
      setInvoices(prevInvoices => [...prevInvoices, newInvoice]);
      setSchedules(prevSchedules => 
        prevSchedules.map(s => s.id === schedule.id ? updatedSchedule : s)
      );
      
      // Recalcular estatísticas
      calculateStats([...schedules.filter(s => s.id !== schedule.id), updatedSchedule]);
      
      alert(`Fatura gerada com sucesso para ${customer.full_name}`);
    } catch (error) {
      console.error("Erro ao gerar fatura:", error);
      alert("Ocorreu um erro ao gerar a fatura.");
    } finally {
      setProcessingSchedule(null);
    }
  };

  const getNextDueDate = (fromDate, dueDay, frequency = 'monthly', customDays = 0) => {
    const currentDate = new Date(fromDate);
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    // Determinar a próxima data com base na frequência
    let nextDate;
    
    switch (frequency) {
      case 'bimonthly':
        nextDate = new Date(currentYear, currentMonth + 2, dueDay);
        break;
        
      case 'quarterly':
        nextDate = new Date(currentYear, currentMonth + 3, dueDay);
        break;
        
      case 'semiannual':
        nextDate = new Date(currentYear, currentMonth + 6, dueDay);
        break;
        
      case 'annual':
        nextDate = new Date(currentYear + 1, currentMonth, dueDay);
        break;
        
      case 'custom':
        nextDate = new Date(currentDate);
        nextDate.setDate(nextDate.getDate() + customDays);
        break;
        
      case 'monthly':
      default:
        nextDate = new Date(currentYear, currentMonth + 1, dueDay);
    }
    
    // Ajustar para último dia do mês se o dia for inválido
    const lastDayOfMonth = new Date(nextDate.getFullYear(), nextDate.getMonth() + 1, 0).getDate();
    if (dueDay > lastDayOfMonth) {
      nextDate.setDate(lastDayOfMonth);
    }
    
    return nextDate;
  };

  const getFrequencyLabel = (frequency, customDays = 0) => {
    const frequencyMap = {
      monthly: "Mensal",
      bimonthly: "Bimestral",
      quarterly: "Trimestral",
      semiannual: "Semestral",
      annual: "Anual",
      custom: customDays ? `A cada ${customDays} dias` : "Personalizado"
    };
    
    return frequencyMap[frequency] || "Desconhecido";
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      active: { label: "Ativo", className: "bg-green-100 text-green-800" },
      paused: { label: "Pausado", className: "bg-yellow-100 text-yellow-800" },
      cancelled: { label: "Cancelado", className: "bg-red-100 text-red-800" },
      completed: { label: "Concluído", className: "bg-blue-100 text-blue-800" }
    };
    
    const statusInfo = statusMap[status] || { label: status, className: "bg-gray-100 text-gray-800" };
    
    return (
      <Badge className={statusInfo.className}>{statusInfo.label}</Badge>
    );
  };

  const filteredSchedules = schedules.filter(schedule => {
    if (!searchTerm) return true;
    
    const customer = customers.find(c => c.id === schedule.customer_id);
    const customerName = customer ? customer.full_name.toLowerCase() : "";
    
    return (
      customerName.includes(searchTerm.toLowerCase()) ||
      schedule.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Cobranças Recorrentes</h1>
          <p className="text-gray-500">
            Configure agendamentos de cobrança automática para clientes
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={loadData}
            className="flex items-center gap-1"
          >
            <RefreshCw className="w-4 h-4" />
            Atualizar
          </Button>
          
          <Button 
            onClick={() => {
              setSelectedSchedule(null);
              setShowForm(true);
            }}
            className="bg-blue-600 flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Novo Agendamento
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Receita Mensal Estimada
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <DollarSign className="mr-2 h-4 w-4 text-green-600" />
              <div className="text-2xl font-bold">
                R$ {scheduleStats.monthlyRevenue.toFixed(2)}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Agendamentos Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
              <div className="text-2xl font-bold">
                {scheduleStats.active}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Próximos 30 Dias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <CalendarIcon className="mr-2 h-4 w-4 text-blue-600" />
              <div className="text-2xl font-bold">
                {scheduleStats.upcoming}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Agendamentos Pausados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Pause className="mr-2 h-4 w-4 text-yellow-600" />
              <div className="text-2xl font-bold">
                {scheduleStats.paused}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="schedules" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Agendamentos
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <CalendarIcon2 className="w-4 h-4" />
            Calendário
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Configurações
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="schedules">
          <Card>
            <CardHeader>
              <CardTitle>Agendamentos de Cobrança</CardTitle>
              <CardDescription>
                Gerencie todos os agendamentos de cobrança recorrente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Buscar agendamentos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex gap-2 whitespace-nowrap">
                    <Filter className="w-4 h-4" />
                    Filtrar
                  </Button>
                  <Button variant="outline" className="flex gap-2 whitespace-nowrap">
                    <Download className="w-4 h-4" />
                    Exportar
                  </Button>
                </div>
              </div>
              
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Agendamento</TableHead>
                      <TableHead>Frequência</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Próximo Vencimento</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Notificações</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          <div className="flex justify-center">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                          </div>
                          <p className="mt-2 text-gray-500">Carregando agendamentos...</p>
                        </TableCell>
                      </TableRow>
                    ) : filteredSchedules.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          <div className="flex flex-col items-center justify-center">
                            <ClipboardList className="w-12 h-12 text-gray-300 mb-2" />
                            <p className="text-gray-500">Nenhum agendamento encontrado</p>
                            <Button 
                              variant="link" 
                              onClick={() => {
                                setSelectedSchedule(null);
                                setShowForm(true);
                              }}
                              className="mt-2"
                            >
                              Criar novo agendamento
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredSchedules.map(schedule => {
                        const customer = customers.find(c => c.id === schedule.customer_id);
                        const plan = plans.find(p => p.id === schedule.plan_id);
                        
                        return (
                          <TableRow key={schedule.id}>
                            <TableCell>
                              <div className="font-medium">
                                {customer ? customer.full_name : "Cliente não encontrado"}
                              </div>
                              {plan && (
                                <div className="text-xs text-gray-500">
                                  Plano: {plan.name}
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">{schedule.title}</div>
                              {schedule.description && (
                                <div className="text-xs text-gray-500 truncate max-w-[200px]">
                                  {schedule.description}
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              {getFrequencyLabel(schedule.frequency, schedule.custom_days)}
                              <div className="text-xs text-gray-500">
                                Vencimento: dia {schedule.due_day}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">
                                R$ {schedule.amount.toFixed(2)}
                              </div>
                              {schedule.installments && (
                                <div className="text-xs text-gray-500">
                                  {schedule.installments_generated || 0}/{schedule.installments} parcelas
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              {schedule.next_billing_date ? (
                                <div>
                                  {format(new Date(schedule.next_billing_date), 'dd/MM/yyyy')}
                                  <div className="text-xs text-gray-500">
                                    {differenceInDays(new Date(schedule.next_billing_date), new Date()) > 0 
                                      ? `em ${differenceInDays(new Date(schedule.next_billing_date), new Date())} dias` 
                                      : schedule.status === 'active' ? 'hoje' : '-'}
                                  </div>
                                </div>
                              ) : (
                                <span className="text-gray-500">Não definido</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(schedule.status)}
                            </TableCell>
                            <TableCell>
                              {schedule.notification_days && schedule.notification_days.length > 0 ? (
                                <div className="flex items-center">
                                  <Bell className="w-4 h-4 mr-1 text-amber-500" />
                                  <span className="text-sm">
                                    {schedule.notification_days.join(', ')} dias antes
                                  </span>
                                </div>
                              ) : (
                                <span className="text-gray-500 text-sm">Não configurado</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end items-center gap-2">
                                {schedule.status === 'active' && (
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    className="h-8 w-8 text-blue-600"
                                    onClick={() => handleGenerateInvoiceNow(schedule)}
                                    disabled={!!processingSchedule}
                                  >
                                    {processingSchedule === schedule.id ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <Receipt className="h-4 w-4" />
                                    )}
                                  </Button>
                                )}
                                
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => handleViewDetails(schedule)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => handleEditSchedule(schedule)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                
                                {schedule.status === 'active' ? (
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    className="h-8 w-8 text-yellow-600"
                                    onClick={() => handleStatusChange(schedule, 'paused')}
                                  >
                                    <Pause className="h-4 w-4" />
                                  </Button>
                                ) : schedule.status === 'paused' ? (
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    className="h-8 w-8 text-green-600"
                                    onClick={() => handleStatusChange(schedule, 'active')}
                                  >
                                    <Play className="h-4 w-4" />
                                  </Button>
                                ) : null}
                                
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  className="h-8 w-8 text-red-600"
                                  onClick={() => handleDeleteSchedule(schedule)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="calendar">
          <Card>
            <CardHeader>
              <CardTitle>Calendário de Cobranças</CardTitle>
              <CardDescription>
                Visualize os vencimentos programados no calendário
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12">
                <CalendarIcon2 className="w-16 h-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium mb-2">Visualização de Calendário</h3>
                <p className="text-gray-500 text-center max-w-md">
                  A visualização em calendário está em desenvolvimento e estará disponível em breve.
                  Aqui você poderá visualizar todos os vencimentos programados em formato de calendário.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Cobrança Recorrente</CardTitle>
              <CardDescription>
                Configure padrões para agendamentos de cobrança
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12">
                <Settings className="w-16 h-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium mb-2">Configurações em Desenvolvimento</h3>
                <p className="text-gray-500 text-center max-w-md">
                  As configurações avançadas de cobrança recorrente estão em desenvolvimento.
                  Aqui você poderá definir valores padrão e comportamentos para o sistema de agendamento.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Dialog para formulário de agendamento */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-4xl">
          <BillingScheduleForm
            scheduleData={selectedSchedule}
            customers={customers}
            plans={plans}
            onSubmit={handleScheduleSubmit}
            onCancel={() => {
              setShowForm(false);
              setSelectedSchedule(null);
            }}
          />
        </DialogContent>
      </Dialog>
      
      {/* Dialog para detalhes do agendamento */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-4xl">
          <BillingScheduleDetails
            schedule={selectedSchedule}
            customers={customers}
            plans={plans}
            invoices={invoices.filter(inv => inv.billing_schedule_id === selectedSchedule?.id)}
            onClose={() => {
              setShowDetails(false);
              setSelectedSchedule(null);
            }}
            onEdit={() => {
              setShowDetails(false);
              setShowForm(true);
            }}
            onGenerateInvoice={handleGenerateInvoiceNow}
            onStatusChange={handleStatusChange}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}