import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import {
  Eye,
  Edit,
  Trash2,
  Clock,
  User,
  CalendarIcon,
  Receipt,
  ArrowLeft,
  Repeat,
  ArrowRight,
  Bell,
  Clipboard,
  Package,
  Banknote,
  CreditCard,
  FileText,
  QrCode,
  Play,
  Pause,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  ExternalLink
} from "lucide-react";
import { format, differenceInDays, isAfter, isBefore } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function BillingScheduleDetails({ 
  schedule, 
  customers, 
  plans, 
  invoices,
  onClose, 
  onEdit,
  onGenerateInvoice,
  onStatusChange
}) {
  const [processingInvoice, setProcessingInvoice] = useState(false);
  
  if (!schedule) return null;
  
  const customer = customers.find(c => c.id === schedule.customer_id);
  const plan = plans.find(p => p.id === schedule.plan_id);
  
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
  
  const getInvoiceStatusBadge = (status) => {
    const statusMap = {
      paid: { label: "Pago", className: "bg-green-100 text-green-800" },
      pending: { label: "Pendente", className: "bg-yellow-100 text-yellow-800" },
      overdue: { label: "Vencido", className: "bg-red-100 text-red-800" },
      cancelled: { label: "Cancelado", className: "bg-gray-100 text-gray-800" }
    };
    
    const statusInfo = statusMap[status] || { label: status, className: "bg-gray-100 text-gray-800" };
    
    return (
      <Badge className={statusInfo.className}>{statusInfo.label}</Badge>
    );
  };
  
  const getPaymentMethodLabel = (method) => {
    const methodMap = {
      credit_card: { label: "Cartão de Crédito", icon: <CreditCard className="h-4 w-4 text-purple-600" /> },
      bank_slip: { label: "Boleto Bancário", icon: <FileText className="h-4 w-4 text-blue-600" /> },
      pix: { label: "PIX", icon: <QrCode className="h-4 w-4 text-green-600" /> },
      default: { label: "Padrão do Cliente", icon: <User className="h-4 w-4 text-gray-600" /> }
    };
    
    const methodInfo = methodMap[method] || { label: method, icon: <Banknote className="h-4 w-4" /> };
    
    return (
      <div className="flex items-center gap-2">
        {methodInfo.icon}
        <span>{methodInfo.label}</span>
      </div>
    );
  };
  
  const handleGenerateInvoice = async () => {
    try {
      setProcessingInvoice(true);
      await onGenerateInvoice(schedule);
    } finally {
      setProcessingInvoice(false);
    }
  };
  
  const canGenerateInvoice = schedule.status === 'active';
  const sortedInvoices = [...invoices].sort((a, b) => {
    // Ordenar faturas por data de vencimento (mais recente primeiro)
    return new Date(b.due_date) - new Date(a.due_date);
  });
  
  return (
    <Card className="border-none shadow-none">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              {schedule.title}
            </CardTitle>
            <CardDescription>
              Detalhes do agendamento de cobrança recorrente
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {getStatusBadge(schedule.status)}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm text-gray-500">Cliente</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="flex items-start gap-2">
                <User className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="font-medium">
                    {customer ? customer.full_name : "Cliente não encontrado"}
                  </p>
                  {customer && (
                    <div className="text-sm text-gray-500 mt-1">
                      {customer.email && <p>{customer.email}</p>}
                      {customer.phone && <p>{customer.phone}</p>}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm text-gray-500">Plano e Valor</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="flex items-start gap-2">
                <Package className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="font-medium">
                    R$ {schedule.amount?.toFixed(2)}
                  </p>
                  <div className="text-sm text-gray-500 mt-1">
                    <p>
                      {plan ? plan.name : "Personalizado"} - {getFrequencyLabel(schedule.frequency, schedule.custom_days)}
                    </p>
                    {schedule.installments && (
                      <p>
                        {schedule.installments_generated || 0}/{schedule.installments} parcelas
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm text-gray-500">Próximo Vencimento</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="flex items-start gap-2">
                <CalendarIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  {schedule.next_billing_date ? (
                    <>
                      <p className="font-medium">
                        {format(new Date(schedule.next_billing_date), 'dd/MM/yyyy')}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {differenceInDays(new Date(schedule.next_billing_date), new Date()) > 0 
                          ? `em ${differenceInDays(new Date(schedule.next_billing_date), new Date())} dias` 
                          : schedule.status === 'active' ? 'hoje' : '-'}
                      </p>
                    </>
                  ) : (
                    <p className="text-gray-500">Não definido</p>
                  )}
                  <p className="text-sm text-gray-500 mt-1">
                    Vencimento: dia {schedule.due_day} de cada período
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="border p-4 rounded-lg">
          <h3 className="text-base font-medium mb-3">Informações Adicionais</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-gray-700">Frequência</h4>
              <p className="text-sm">{getFrequencyLabel(schedule.frequency, schedule.custom_days)}</p>
            </div>
            
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-gray-700">Método de Pagamento</h4>
              <p className="text-sm flex items-center gap-1">
                {getPaymentMethodLabel(schedule.payment_method)}
              </p>
            </div>
            
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-gray-700">Data de Início</h4>
              <p className="text-sm">
                {schedule.start_date ? format(new Date(schedule.start_date), 'dd/MM/yyyy') : '-'}
              </p>
            </div>
            
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-gray-700">Data de Término</h4>
              <p className="text-sm">
                {schedule.end_date ? format(new Date(schedule.end_date), 'dd/MM/yyyy') : 'Sem data definida'}
              </p>
            </div>
            
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-gray-700">Última Execução</h4>
              <p className="text-sm">
                {schedule.last_execution_date ? format(new Date(schedule.last_execution_date), 'dd/MM/yyyy HH:mm') : 'Nunca executado'}
              </p>
            </div>
            
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-gray-700">Notificações</h4>
              <div className="flex flex-wrap gap-1">
                {schedule.notification_days && schedule.notification_days.length > 0 ? (
                  schedule.notification_days.map((day, index) => (
                    <Badge key={index} variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                      {day === 0 ? 'No dia' : (day === 1 ? '1 dia antes' : `${day} dias antes`)}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-gray-500">Não configuradas</span>
                )}
              </div>
            </div>
            
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-gray-700">Cobranças Automáticas</h4>
              <div className="flex space-x-1">
                {schedule.auto_generate_invoice ? (
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Geração Automática de Faturas
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-gray-500">
                    <XCircle className="w-3 h-3 mr-1" />
                    Sem Geração Automática
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-gray-700">Juros e Multas</h4>
              <div className="flex flex-wrap gap-1">
                {schedule.apply_late_fee && (
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    Multa: {schedule.late_fee_percentage?.toFixed(2)}%
                  </Badge>
                )}
                
                {schedule.apply_daily_interest && (
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    Juros: {schedule.daily_interest_percentage?.toFixed(3)}% ao dia
                  </Badge>
                )}
                
                {!schedule.apply_late_fee && !schedule.apply_daily_interest && (
                  <span className="text-sm text-gray-500">Não configurados</span>
                )}
              </div>
            </div>
          </div>
          
          {schedule.description && (
            <div className="mt-4 pt-4 border-t">
              <h4 className="text-sm font-medium text-gray-700 mb-1">Descrição</h4>
              <p className="text-sm text-gray-700">{schedule.description}</p>
            </div>
          )}
          
          {schedule.notes && (
            <div className="mt-4 pt-4 border-t">
              <h4 className="text-sm font-medium text-gray-700 mb-1">Observações Internas</h4>
              <p className="text-sm text-gray-700">{schedule.notes}</p>
            </div>
          )}
        </div>
        
        <div>
          <h3 className="text-base font-medium mb-4">Faturas Geradas</h3>
          
          {sortedInvoices.length === 0 ? (
            <div className="border rounded-md p-6 text-center">
              <Receipt className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <h4 className="text-base font-medium mb-1">Nenhuma fatura gerada</h4>
              <p className="text-gray-500 mb-4">
                Ainda não foram geradas faturas para este agendamento
              </p>
              
              {canGenerateInvoice && (
                <Button 
                  onClick={handleGenerateInvoice}
                  disabled={processingInvoice}
                  className="bg-blue-600"
                >
                  {processingInvoice ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <Receipt className="w-4 h-4 mr-2" />
                      Gerar Fatura Agora
                    </>
                  )}
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vencimento</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Método</TableHead>
                    <TableHead>Data Pagamento</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedInvoices.map(invoice => (
                    <TableRow key={invoice.id}>
                      <TableCell>
                        {format(new Date(invoice.due_date), 'dd/MM/yyyy')}
                      </TableCell>
                      <TableCell>
                        R$ {invoice.amount?.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        {getInvoiceStatusBadge(invoice.status)}
                      </TableCell>
                      <TableCell>
                        {invoice.payment_method ? (
                          <div className="flex items-center gap-1 text-sm">
                            {invoice.payment_method === 'credit_card' && (
                              <CreditCard className="w-3 h-3 text-purple-600" />
                            )}
                            {invoice.payment_method === 'bank_slip' && (
                              <FileText className="w-3 h-3 text-blue-600" />
                            )}
                            {invoice.payment_method === 'pix' && (
                              <QrCode className="w-3 h-3 text-green-600" />
                            )}
                            <span className="capitalize">
                              {invoice.payment_method}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {invoice.payment_date ? (
                          format(new Date(invoice.payment_date), 'dd/MM/yyyy')
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Eye className="h-4 w-4" />
                          </Button>
                          {invoice.invoice_url && (
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          
          {canGenerateInvoice && sortedInvoices.length > 0 && (
            <div className="flex justify-center mt-4">
              <Button 
                onClick={handleGenerateInvoice}
                disabled={processingInvoice}
                variant="outline"
              >
                {processingInvoice ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Receipt className="w-4 h-4 mr-2" />
                    Gerar Nova Fatura
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between border-t pt-6">
        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          
          {schedule.status === 'active' ? (
            <Button
              variant="outline"
              className="text-yellow-700 border-yellow-200 bg-yellow-50 hover:bg-yellow-100"
              onClick={() => onStatusChange(schedule, 'paused')}
            >
              <Pause className="w-4 h-4 mr-2" />
              Pausar Agendamento
            </Button>
          ) : schedule.status === 'paused' ? (
            <Button
              variant="outline"
              className="text-green-700 border-green-200 bg-green-50 hover:bg-green-100"
              onClick={() => onStatusChange(schedule, 'active')}
            >
              <Play className="w-4 h-4 mr-2" />
              Reativar Agendamento
            </Button>
          ) : null}
        </div>
        
        <Button onClick={onEdit}>
          <Edit className="w-4 h-4 mr-2" />
          Editar Agendamento
        </Button>
      </CardFooter>
    </Card>
  );
}