import React, { useState, useEffect } from "react";
import { PaymentGateway } from "@/api/entities";
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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  CalendarIcon,
  Clock,
  Bell,
  Save,
  ArrowLeft,
  CreditCard,
  Receipt,
  Banknote,
  QrCode,
  Loader2,
  Repeat,
  PlusCircle,
  MinusCircle,
  AlertCircle
} from "lucide-react";
import { format, addMonths, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function BillingScheduleForm({ scheduleData, customers, plans, onSubmit, onCancel }) {
  const [activeTab, setActiveTab] = useState("basic");
  const [saveLoading, setSaveLoading] = useState(false);
  const [gateways, setGateways] = useState([]);
  const [loadingGateways, setLoadingGateways] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [notificationDays, setNotificationDays] = useState([5, 2, 0]);
  const [formData, setFormData] = useState(
    scheduleData || {
      customer_id: "",
      plan_id: "",
      title: "",
      description: "",
      amount: "",
      frequency: "monthly",
      custom_days: 30,
      due_day: 10,
      start_date: new Date().toISOString().split('T')[0],
      end_date: null,
      next_billing_date: null,
      notification_days: [5, 2, 0],
      auto_generate_invoice: true,
      payment_method: "default",
      payment_gateway_id: "",
      auto_charge: false,
      status: "active",
      installments: null,
      installments_generated: 0,
      apply_late_fee: false,
      late_fee_percentage: 2.0,
      apply_daily_interest: false,
      daily_interest_percentage: 0.033,
      notes: ""
    }
  );

  useEffect(() => {
    loadGateways();
    
    // Atualizar notificationDays do estado se schedule tiver notification_days
    if (scheduleData && scheduleData.notification_days) {
      setNotificationDays(scheduleData.notification_days);
    }
  }, [scheduleData]);

  const loadGateways = async () => {
    try {
      setLoadingGateways(true);
      try {
        const gatewaysData = await PaymentGateway.list();
        // Filtrar apenas gateways ativos
        setGateways(gatewaysData.filter(g => g.is_active));
      } catch (err) {
        console.error("Erro ao carregar gateways:", err);
        setGateways([]);
      }
    } finally {
      setLoadingGateways(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpar erro do campo quando ele for editado
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const handleFrequencyChange = (frequency) => {
    const newData = { ...formData, frequency };
    
    // Atualizar próxima data de cobrança com base na nova frequência
    if (newData.start_date) {
      const startDate = new Date(newData.start_date);
      let nextDate;
      
      switch (frequency) {
        case 'bimonthly':
          nextDate = addMonths(startDate, 2);
          break;
        case 'quarterly':
          nextDate = addMonths(startDate, 3);
          break;
        case 'semiannual':
          nextDate = addMonths(startDate, 6);
          break;
        case 'annual':
          nextDate = addMonths(startDate, 12);
          break;
        case 'custom':
          nextDate = addDays(startDate, newData.custom_days || 30);
          break;
        case 'monthly':
        default:
          nextDate = addMonths(startDate, 1);
          break;
      }
      
      // Ajustar dia para dia de vencimento
      nextDate.setDate(newData.due_day);
      newData.next_billing_date = nextDate.toISOString().split('T')[0];
    }
    
    setFormData(newData);
  };

  const handleStartDateChange = (date) => {
    const formattedDate = date.toISOString().split('T')[0];
    
    const newData = { ...formData, start_date: formattedDate };
    
    // Atualizar próxima data de cobrança
    let nextDate;
    
    switch (newData.frequency) {
      case 'bimonthly':
        nextDate = addMonths(date, 2);
        break;
      case 'quarterly':
        nextDate = addMonths(date, 3);
        break;
      case 'semiannual':
        nextDate = addMonths(date, 6);
        break;
      case 'annual':
        nextDate = addMonths(date, 12);
        break;
      case 'custom':
        nextDate = addDays(date, newData.custom_days || 30);
        break;
      case 'monthly':
      default:
        nextDate = addMonths(date, 1);
        break;
    }
    
    // Ajustar dia para dia de vencimento
    nextDate.setDate(newData.due_day);
    newData.next_billing_date = nextDate.toISOString().split('T')[0];
    
    setFormData(newData);
  };

  const handleNotificationDayChange = (index, value) => {
    const newDays = [...notificationDays];
    
    if (value === '') {
      // Remover o dia se estiver vazio
      newDays.splice(index, 1);
    } else {
      const numValue = parseInt(value, 10);
      if (!isNaN(numValue) && numValue >= 0) {
        newDays[index] = numValue;
      }
    }
    
    // Ordenar os dias em ordem decrescente
    newDays.sort((a, b) => b - a);
    
    setNotificationDays(newDays);
    setFormData(prev => ({
      ...prev,
      notification_days: newDays
    }));
  };

  const addNotificationDay = () => {
    // Adicionar um novo dia de notificação (padrão: 1 dia antes)
    const newDays = [...notificationDays, 1];
    // Ordenar os dias em ordem decrescente
    newDays.sort((a, b) => b - a);
    
    setNotificationDays(newDays);
    setFormData(prev => ({
      ...prev,
      notification_days: newDays
    }));
  };

  const removeNotificationDay = (index) => {
    const newDays = [...notificationDays];
    newDays.splice(index, 1);
    
    setNotificationDays(newDays);
    setFormData(prev => ({
      ...prev,
      notification_days: newDays
    }));
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.customer_id) errors.customer_id = "Cliente é obrigatório";
    if (!formData.title) errors.title = "Título é obrigatório";
    if (!formData.amount || formData.amount <= 0) errors.amount = "Valor deve ser maior que zero";
    if (!formData.due_day || formData.due_day < 1 || formData.due_day > 31) {
      errors.due_day = "Dia de vencimento deve estar entre 1 e 31";
    }
    if (!formData.start_date) errors.start_date = "Data de início é obrigatória";
    
    if (formData.frequency === 'custom' && (!formData.custom_days || formData.custom_days < 1)) {
      errors.custom_days = "Para frequência personalizada, informe um número de dias válido";
    }
    
    if (formData.apply_late_fee && 
        (formData.late_fee_percentage <= 0 || formData.late_fee_percentage > 20)) {
      errors.late_fee_percentage = "Percentual de multa deve estar entre 0.01% e 20%";
    }
    
    if (formData.apply_daily_interest && 
        (formData.daily_interest_percentage <= 0 || formData.daily_interest_percentage > 1)) {
      errors.daily_interest_percentage = "Percentual de juros diários deve estar entre 0.01% e 1%";
    }
    
    if (formData.installments !== null && 
        formData.installments !== undefined && 
        (formData.installments < 1 || !Number.isInteger(parseFloat(formData.installments)))) {
      errors.installments = "Número de parcelas deve ser um número inteiro maior que zero";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setSaveLoading(true);
      
      // Preparar dados para envio
      const submissionData = {
        ...formData,
        amount: parseFloat(formData.amount),
        notification_days: notificationDays,
        installments: formData.installments ? parseInt(formData.installments, 10) : null
      };
      
      // Certificar que o próximo vencimento está definido
      if (!submissionData.next_billing_date) {
        // Calcular próximo vencimento se não estiver definido
        const startDate = new Date(submissionData.start_date);
        let nextDate;
        
        switch (submissionData.frequency) {
          case 'bimonthly':
            nextDate = addMonths(startDate, 2);
            break;
          case 'quarterly':
            nextDate = addMonths(startDate, 3);
            break;
          case 'semiannual':
            nextDate = addMonths(startDate, 6);
            break;
          case 'annual':
            nextDate = addMonths(startDate, 12);
            break;
          case 'custom':
            nextDate = addDays(startDate, submissionData.custom_days || 30);
            break;
          case 'monthly':
          default:
            nextDate = addMonths(startDate, 1);
            break;
        }
        
        // Ajustar dia para dia de vencimento
        nextDate.setDate(submissionData.due_day);
        submissionData.next_billing_date = nextDate.toISOString().split('T')[0];
      }
      
      if (onSubmit) {
        await onSubmit(submissionData);
      }
    } catch (error) {
      console.error("Erro ao salvar agendamento:", error);
      setFormErrors({
        general: "Ocorreu um erro ao salvar o agendamento. Por favor, tente novamente."
      });
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <Card className="border-none shadow-none">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-blue-600" />
          {scheduleData ? "Editar Agendamento" : "Novo Agendamento"}
        </CardTitle>
        <CardDescription>
          Configure um agendamento de cobrança recorrente para um cliente
        </CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mx-6 mb-4">
            <TabsTrigger value="basic">Dados Básicos</TabsTrigger>
            <TabsTrigger value="schedule">Agendamento</TabsTrigger>
            <TabsTrigger value="payment">Pagamento</TabsTrigger>
            <TabsTrigger value="notifications">Notificações</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic">
            <CardContent className="space-y-6">
              {formErrors.general && (
                <div className="bg-red-50 p-3 rounded-md border border-red-200 flex gap-2 items-start">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="text-red-600">{formErrors.general}</p>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="customer_id">Cliente <span className="text-red-500">*</span></Label>
                  <Select
                    value={formData.customer_id}
                    onValueChange={(value) => handleInputChange("customer_id", value)}
                  >
                    <SelectTrigger id="customer_id" className={formErrors.customer_id ? "border-red-500" : ""}>
                      <SelectValue placeholder="Selecione um cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      <ScrollArea className="h-72">
                        {customers.length === 0 ? (
                          <div className="p-2 text-center text-gray-500">
                            Nenhum cliente cadastrado
                          </div>
                        ) : (
                          customers.map((customer) => (
                            <SelectItem key={customer.id} value={customer.id}>
                              {customer.full_name}
                            </SelectItem>
                          ))
                        )}
                      </ScrollArea>
                    </SelectContent>
                  </Select>
                  {formErrors.customer_id && <p className="text-xs text-red-500">{formErrors.customer_id}</p>}
                  <p className="text-xs text-gray-500">Cliente que será cobrado</p>
                </div>
                
                {plans.length > 0 && (
                  <div className="space-y-2">
                    <Label htmlFor="plan_id">Plano (opcional)</Label>
                    <Select
                      value={formData.plan_id}
                      onValueChange={(value) => handleInputChange("plan_id", value)}
                    >
                      <SelectTrigger id="plan_id">
                        <SelectValue placeholder="Selecione um plano" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={null}>Nenhum plano (personalizado)</SelectItem>
                        {plans.map((plan) => (
                          <SelectItem key={plan.id} value={plan.id}>
                            {plan.name} - R$ {plan.monthly_price?.toFixed(2)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500">Plano associado a esta cobrança</p>
                  </div>
                )}
                
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="title">Título <span className="text-red-500">*</span></Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="Ex: Mensalidade Internet 100MB"
                    className={formErrors.title ? "border-red-500" : ""}
                  />
                  {formErrors.title && <p className="text-xs text-red-500">{formErrors.title}</p>}
                  <p className="text-xs text-gray-500">Título que aparecerá nas faturas</p>
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Input
                    id="description"
                    value={formData.description || ""}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Ex: Assinatura de internet com velocidade de 100MB"
                  />
                  <p className="text-xs text-gray-500">Descrição detalhada da cobrança</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="amount">Valor <span className="text-red-500">*</span></Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      R$
                    </span>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.amount}
                      onChange={(e) => handleInputChange("amount", e.target.value)}
                      placeholder="0.00"
                      className={`pl-10 ${formErrors.amount ? "border-red-500" : ""}`}
                    />
                  </div>
                  {formErrors.amount && <p className="text-xs text-red-500">{formErrors.amount}</p>}
                  <p className="text-xs text-gray-500">Valor a ser cobrado conforme a frequência</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="installments">Número de Parcelas</Label>
                  <div className="relative">
                    <Input
                      id="installments"
                      type="number"
                      min="1"
                      step="1"
                      value={formData.installments === null ? "" : formData.installments}
                      onChange={(e) => handleInputChange("installments", e.target.value === "" ? null : e.target.value)}
                      placeholder="Recorrente"
                      className={formErrors.installments ? "border-red-500" : ""}
                    />
                  </div>
                  {formErrors.installments && <p className="text-xs text-red-500">{formErrors.installments}</p>}
                  <p className="text-xs text-gray-500">
                    Deixe em branco para cobrança recorrente sem fim definido
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => handleInputChange("status", value)}
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Ativo</SelectItem>
                      <SelectItem value="paused">Pausado</SelectItem>
                      <SelectItem value="cancelled">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">Status atual do agendamento</p>
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="notes">Observações</Label>
                  <Input
                    id="notes"
                    value={formData.notes || ""}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    placeholder="Observações adicionais (visíveis apenas para a administração)"
                  />
                  <p className="text-xs text-gray-500">Notas internas sobre este agendamento</p>
                </div>
              </div>
            </CardContent>
          </TabsContent>
          
          <TabsContent value="schedule">
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="frequency">Frequência <span className="text-red-500">*</span></Label>
                  <Select
                    value={formData.frequency}
                    onValueChange={handleFrequencyChange}
                  >
                    <SelectTrigger id="frequency">
                      <SelectValue placeholder="Selecione a frequência" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Mensal</SelectItem>
                      <SelectItem value="bimonthly">Bimestral</SelectItem>
                      <SelectItem value="quarterly">Trimestral</SelectItem>
                      <SelectItem value="semiannual">Semestral</SelectItem>
                      <SelectItem value="annual">Anual</SelectItem>
                      <SelectItem value="custom">Personalizado</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">Com que frequência a cobrança será repetida</p>
                </div>
                
                {formData.frequency === 'custom' && (
                  <div className="space-y-2">
                    <Label htmlFor="custom_days">
                      Dias Personalizados <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="custom_days"
                      type="number"
                      min="1"
                      value={formData.custom_days}
                      onChange={(e) => handleInputChange("custom_days", parseInt(e.target.value, 10))}
                      placeholder="30"
                      className={formErrors.custom_days ? "border-red-500" : ""}
                    />
                    {formErrors.custom_days && <p className="text-xs text-red-500">{formErrors.custom_days}</p>}
                    <p className="text-xs text-gray-500">Intervalo em dias entre as cobranças</p>
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="due_day">
                    Dia de Vencimento <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="due_day"
                    type="number"
                    min="1"
                    max="31"
                    value={formData.due_day}
                    onChange={(e) => handleInputChange("due_day", parseInt(e.target.value, 10))}
                    placeholder="10"
                    className={formErrors.due_day ? "border-red-500" : ""}
                  />
                  {formErrors.due_day && <p className="text-xs text-red-500">{formErrors.due_day}</p>}
                  <p className="text-xs text-gray-500">
                    Dia do mês para vencimento (usar último dia válido se o mês for mais curto)
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="start_date">
                    Data de Início <span className="text-red-500">*</span>
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={`w-full justify-start text-left font-normal ${
                          formErrors.start_date ? "border-red-500" : ""
                        }`}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.start_date ? (
                          format(new Date(formData.start_date), "dd/MM/yyyy")
                        ) : (
                          <span>Selecione uma data</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.start_date ? new Date(formData.start_date) : undefined}
                        onSelect={handleStartDateChange}
                        initialFocus
                        locale={ptBR}
                      />
                    </PopoverContent>
                  </Popover>
                  {formErrors.start_date && <p className="text-xs text-red-500">{formErrors.start_date}</p>}
                  <p className="text-xs text-gray-500">Data de início do agendamento</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="end_date">Data de Término</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.end_date ? (
                          format(new Date(formData.end_date), "dd/MM/yyyy")
                        ) : (
                          <span>Sem data definida</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.end_date ? new Date(formData.end_date) : undefined}
                        onSelect={(date) => handleInputChange("end_date", date ? date.toISOString().split('T')[0] : null)}
                        initialFocus
                        locale={ptBR}
                      />
                    </PopoverContent>
                  </Popover>
                  <p className="text-xs text-gray-500">
                    Opcional. Deixe em branco para agendamento sem data de término
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="next_billing_date">Próxima Data de Cobrança</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.next_billing_date ? (
                          format(new Date(formData.next_billing_date), "dd/MM/yyyy")
                        ) : (
                          <span>Será calculada automaticamente</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.next_billing_date ? new Date(formData.next_billing_date) : undefined}
                        onSelect={(date) => handleInputChange("next_billing_date", date ? date.toISOString().split('T')[0] : null)}
                        initialFocus
                        locale={ptBR}
                      />
                    </PopoverContent>
                  </Popover>
                  <p className="text-xs text-gray-500">
                    Opcional. Calculada automaticamente se não for informada
                  </p>
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="auto_generate_invoice"
                      checked={formData.auto_generate_invoice}
                      onCheckedChange={(checked) => handleInputChange("auto_generate_invoice", checked)}
                    />
                    <Label htmlFor="auto_generate_invoice">
                      Gerar Faturas Automaticamente
                    </Label>
                  </div>
                  <p className="text-xs text-gray-500 pl-10">
                    Se ativado, as faturas serão geradas automaticamente nas datas programadas
                  </p>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h3 className="text-sm font-medium mb-3">Juros e Multa por Atraso</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="apply_late_fee"
                        checked={formData.apply_late_fee}
                        onCheckedChange={(checked) => handleInputChange("apply_late_fee", checked)}
                      />
                      <Label htmlFor="apply_late_fee">
                        Aplicar Multa por Atraso
                      </Label>
                    </div>
                    
                    {formData.apply_late_fee && (
                      <div className="mt-2 pl-10">
                        <div className="flex items-center gap-2">
                          <Input
                            id="late_fee_percentage"
                            type="number"
                            step="0.01"
                            min="0"
                            max="20"
                            value={formData.late_fee_percentage}
                            onChange={(e) => handleInputChange("late_fee_percentage", parseFloat(e.target.value))}
                            placeholder="2.00"
                            className={`w-24 ${formErrors.late_fee_percentage ? "border-red-500" : ""}`}
                          />
                          <span className="text-gray-500">%</span>
                        </div>
                        {formErrors.late_fee_percentage && (
                          <p className="text-xs text-red-500 mt-1">{formErrors.late_fee_percentage}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          Percentual de multa aplicado após o vencimento (valor padrão: 2%)
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="apply_daily_interest"
                        checked={formData.apply_daily_interest}
                        onCheckedChange={(checked) => handleInputChange("apply_daily_interest", checked)}
                      />
                      <Label htmlFor="apply_daily_interest">
                        Aplicar Juros Diários
                      </Label>
                    </div>
                    
                    {formData.apply_daily_interest && (
                      <div className="mt-2 pl-10">
                        <div className="flex items-center gap-2">
                          <Input
                            id="daily_interest_percentage"
                            type="number"
                            step="0.001"
                            min="0"
                            max="1"
                            value={formData.daily_interest_percentage}
                            onChange={(e) => handleInputChange("daily_interest_percentage", parseFloat(e.target.value))}
                            placeholder="0.033"
                            className={`w-24 ${formErrors.daily_interest_percentage ? "border-red-500" : ""}`}
                          />
                          <span className="text-gray-500">% ao dia</span>
                        </div>
                        {formErrors.daily_interest_percentage && (
                          <p className="text-xs text-red-500 mt-1">{formErrors.daily_interest_percentage}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          Percentual de juros diários (0,033% = 1% ao mês)
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </TabsContent>
          
          <TabsContent value="payment">
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="payment_method">Método de Pagamento Padrão</Label>
                  <Select
                    value={formData.payment_method}
                    onValueChange={(value) => handleInputChange("payment_method", value)}
                  >
                    <SelectTrigger id="payment_method">
                      <SelectValue placeholder="Selecione o método" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Método Padrão do Cliente</SelectItem>
                      <SelectItem value="credit_card">
                        <div className="flex items-center">
                          <CreditCard className="w-4 h-4 mr-2 text-purple-600" />
                          Cartão de Crédito
                        </div>
                      </SelectItem>
                      <SelectItem value="bank_slip">
                        <div className="flex items-center">
                          <Receipt className="w-4 h-4 mr-2 text-blue-600" />
                          Boleto Bancário
                        </div>
                      </SelectItem>
                      <SelectItem value="pix">
                        <div className="flex items-center">
                          <QrCode className="w-4 h-4 mr-2 text-green-600" />
                          PIX
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">
                    Método de pagamento a ser usado por padrão nas faturas geradas
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="payment_gateway_id">Gateway de Pagamento</Label>
                  <Select
                    value={formData.payment_gateway_id || ""}
                    onValueChange={(value) => handleInputChange("payment_gateway_id", value)}
                    disabled={formData.payment_method === 'default'}
                  >
                    <SelectTrigger id="payment_gateway_id">
                      <SelectValue placeholder="Selecione o gateway" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={null}>Gateway Padrão do Sistema</SelectItem>
                      {loadingGateways ? (
                        <SelectItem value={null} disabled>
                          <div className="flex items-center">
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Carregando gateways...
                          </div>
                        </SelectItem>
                      ) : gateways.length === 0 ? (
                        <SelectItem value={null} disabled>
                          Nenhum gateway configurado
                        </SelectItem>
                      ) : (
                        gateways.map(gateway => (
                          <SelectItem key={gateway.id} value={gateway.id}>
                            <div className="flex items-center gap-2">
                              {gateway.name}
                              {gateway.sandbox_mode && (
                                <Badge variant="outline" className="ml-2 text-xs bg-amber-50 text-amber-600 border-amber-200">
                                  Teste
                                </Badge>
                              )}
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">
                    {formData.payment_method === 'default' 
                      ? "Usar gateway padrão configurado no sistema" 
                      : "Gateway que processará os pagamentos"}
                  </p>
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="auto_charge"
                      checked={formData.auto_charge}
                      onCheckedChange={(checked) => handleInputChange("auto_charge", checked)}
                      disabled={formData.payment_method !== 'credit_card' && formData.payment_method !== 'debit_card'}
                    />
                    <Label htmlFor="auto_charge">
                      Realizar Cobrança Automática
                    </Label>
                  </div>
                  <p className="text-xs text-gray-500 pl-10">
                    {formData.payment_method === 'credit_card' || formData.payment_method === 'debit_card'
                      ? "Tentativa automática de cobrança do cartão na data de vencimento (requer cartão salvo)"
                      : "Disponível apenas para pagamentos com cartão"}
                  </p>
                </div>
              </div>
            </CardContent>
          </TabsContent>
          
          <TabsContent value="notifications">
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base">Dias de Notificação</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addNotificationDay}
                    className="flex items-center gap-1"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Adicionar Notificação
                  </Button>
                </div>
                
                <p className="text-sm text-gray-500">
                  Configure quantos dias antes do vencimento o cliente será notificado
                </p>
                
                {notificationDays.length === 0 ? (
                  <div className="bg-gray-50 p-4 rounded-md text-center">
                    <Bell className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-500">Nenhuma notificação configurada</p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={addNotificationDay}
                      className="mt-2"
                    >
                      <PlusCircle className="w-4 h-4 mr-1" />
                      Adicionar Primeira Notificação
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {notificationDays.map((days, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="flex-1 flex items-center gap-2">
                          <Input
                            type="number"
                            min="0"
                            value={days}
                            onChange={(e) => handleNotificationDayChange(index, e.target.value)}
                            className="w-20"
                          />
                          <span className="text-gray-700">
                            {days === 1 ? "dia antes" : days === 0 ? "no dia" : "dias antes"}
                          </span>
                          
                          {days === 0 && (
                            <Badge className="bg-blue-100 text-blue-800">No dia do vencimento</Badge>
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeNotificationDay(index)}
                          className="h-8 w-8 text-gray-500"
                        >
                          <MinusCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="bg-blue-50 p-4 rounded-md flex gap-3 mt-4">
                  <Bell className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-blue-800 text-sm">
                      As notificações serão enviadas por email para o cliente nos dias configurados.
                    </p>
                    <p className="text-blue-700 text-xs mt-1">
                      Certifique-se de que o email do cliente esteja correto para garantir o recebimento.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </TabsContent>
        </Tabs>
        
        <CardFooter className="flex justify-between border-t p-6">
          <Button type="button" variant="outline" onClick={onCancel}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
          
          <Button type="submit" disabled={saveLoading} className="bg-blue-600">
            {saveLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Salvar Agendamento
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}