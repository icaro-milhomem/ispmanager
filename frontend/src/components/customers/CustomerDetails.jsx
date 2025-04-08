import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Phone,
  Mail,
  MapPin,
  FileText,
  Wifi,
  Calendar,
  CreditCard,
  Hash,
  Receipt,
  Loader2
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Invoice } from "@/api/entities";
import { Plan } from "@/api/entities";
import { DataTable } from "@/components/ui/data-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createPageUrl } from "@/utils";

export default function CustomerDetails({ customer, onEdit, onDelete, onBack }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showPromoDialog, setShowPromoDialog] = useState(false);
  const [applyPromo, setApplyPromo] = useState(false);
  const [processingInvoices, setProcessingInvoices] = useState(false);
  const [invoices, setInvoices] = useState([]);
  const [loadingInvoices, setLoadingInvoices] = useState(true);
  const [activeTab, setActiveTab] = useState("info");

  useEffect(() => {
    loadInvoices();
  }, [customer.id]);

  const loadInvoices = async () => {
    try {
      setLoadingInvoices(true);
      const allInvoices = await Invoice.list();
      const customerInvoices = allInvoices.filter(inv => inv.customer_id === customer.id);
      setInvoices(customerInvoices);
    } catch (error) {
      console.error("Erro ao carregar faturas:", error);
      toast({
        title: "Erro ao carregar faturas",
        description: "Não foi possível carregar as faturas do cliente",
        variant: "destructive"
      });
    } finally {
      setLoadingInvoices(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { label: "Pendente", className: "bg-yellow-100 text-yellow-800" },
      paid: { label: "Pago", className: "bg-green-100 text-green-800" },
      overdue: { label: "Vencido", className: "bg-red-100 text-red-800" },
      cancelled: { label: "Cancelado", className: "bg-gray-100 text-gray-800" }
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <Badge className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const generateSingleInvoice = async () => {
    setLoading(true);
    try {
      // Buscar informações do plano
      const plans = await Plan.list();
      let customerPlan;
      
      // Verificar se o plano é um objeto ou uma string (código)
      if (typeof customer.plan === 'object' && customer.plan !== null) {
        customerPlan = customer.plan;
      } else {
        customerPlan = plans.find(p => p.code === customer.plan || p.id === customer.plan);
      }
      
      if (!customerPlan) {
        console.error("Plano não encontrado:", {
          customerPlan: customer.plan,
          availablePlans: plans.map(p => p.code || p.id)
        });
        throw new Error("Plano não encontrado");
      }

      const invoiceData = {
        customer_id: customer.id,
        amount: customerPlan.price || customerPlan.monthly_price,
        due_date: new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
        status: "pending",
        payment_method: customer.payment_method || "bank_slip",
        description: `Mensalidade ${customerPlan.name}`
      };

      const invoice = await Invoice.create(invoiceData);
      await loadInvoices();

      toast({
        title: "Boleto gerado com sucesso",
        description: "O boleto foi gerado e será enviado por email"
      });

      return invoice;
    } catch (error) {
      console.error("Erro ao gerar boleto:", error);
      toast({
        title: "Erro ao gerar boleto",
        description: "Não foi possível gerar o boleto: " + error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateBooklet = async (withPromo = false) => {
    setProcessingInvoices(true);
    try {
      // Buscar informações do plano
      const plans = await Plan.list();
      let customerPlan;
      
      // Verificar se o plano é um objeto ou uma string (código)
      if (typeof customer.plan === 'object' && customer.plan !== null) {
        customerPlan = customer.plan;
      } else {
        customerPlan = plans.find(p => p.code === customer.plan || p.id === customer.plan);
      }
      
      if (!customerPlan) {
        console.error("Plano não encontrado:", {
          customerPlan: customer.plan,
          availablePlans: plans.map(p => p.code || p.id)
        });
        throw new Error("Plano não encontrado");
      }

      const invoices = [];
      const baseDate = new Date();
      baseDate.setDate(customer.due_day || 1); // Usa o dia de vencimento do cliente ou 1

      for (let i = 0; i < 12; i++) {
        const dueDate = new Date(baseDate);
        dueDate.setMonth(baseDate.getMonth() + i);

        // Aplicar desconto de 50% nos 3 primeiros meses se promoção estiver ativa
        const amount = withPromo && i < 3 
          ? (customerPlan.price || customerPlan.monthly_price) * 0.5 
          : (customerPlan.price || customerPlan.monthly_price);

        const invoiceData = {
          customer_id: customer.id,
          amount: amount,
          due_date: dueDate.toISOString().split('T')[0],
          status: "pending",
          payment_method: customer.payment_method || "bank_slip",
          description: `Mensalidade ${customerPlan.name}${withPromo && i < 3 ? ' (Promoção 50% OFF)' : ''} - ${i + 1}/12`
        };

        const invoice = await Invoice.create(invoiceData);
        invoices.push(invoice);
      }

      await loadInvoices();

      toast({
        title: "Carnê gerado com sucesso",
        description: `Foram geradas 12 faturas${withPromo ? ' com promoção aplicada' : ''}`
      });

      return invoices;
    } catch (error) {
      console.error("Erro ao gerar carnê:", error);
      toast({
        title: "Erro ao gerar carnê",
        description: "Não foi possível gerar o carnê: " + error.message,
        variant: "destructive"
      });
    } finally {
      setProcessingInvoices(false);
      setShowPromoDialog(false);
    }
  };

  if (!customer) return null;

  const planLabels = {
    basic: "Básico",
    standard: "Padrão",
    premium: "Premium",
    business: "Empresarial"
  };

  const statusColors = {
    active: "bg-green-100 text-green-800",
    inactive: "bg-gray-100 text-gray-800",
    suspended: "bg-red-100 text-red-800",
    pending: "bg-yellow-100 text-yellow-800",
  };

  const statusLabels = {
    active: "Ativo",
    inactive: "Inativo",
    suspended: "Suspenso",
    pending: "Pendente"
  };

  const viewInvoice = (invoice) => {
    // Redirecionar para a página de visualização de fatura
    const invoiceUrl = createPageUrl(`InvoiceView?id=${invoice.id}`);
    window.open(invoiceUrl, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{customer.full_name}</h2>
          <div className="mt-1 flex items-center gap-2">
            <Badge className={statusColors[customer.status]}>
              {statusLabels[customer.status]}
            </Badge>
            <Badge variant="outline">
              {typeof customer.plan === 'object' && customer.plan !== null 
                ? customer.plan.name 
                : planLabels[customer.plan] || customer.plan || "Sem plano"}
            </Badge>
            <Badge variant="outline" className="border-blue-200 text-blue-700">
              <Hash className="w-3 h-3 mr-1" />
              Contrato: {customer.contract_number || "Não gerado"}
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onBack}>
            Voltar
          </Button>
          <Button 
            variant="outline"
            className="bg-blue-50 text-blue-600 hover:bg-blue-100"
            onClick={() => onEdit(customer)}
          >
            Editar
          </Button>
          <Button
            variant="outline"
            className="bg-green-50 text-green-600 hover:bg-green-100"
            onClick={generateSingleInvoice}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Receipt className="w-4 h-4 mr-2" />
            )}
            Gerar Boleto
          </Button>
          <Button
            variant="outline"
            className="bg-purple-50 text-purple-600 hover:bg-purple-100"
            onClick={() => setShowPromoDialog(true)}
            disabled={processingInvoices}
          >
            {processingInvoices ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <FileText className="w-4 h-4 mr-2" />
            )}
            Gerar Carnê
          </Button>
          {onDelete && (
            <Button 
              variant="destructive" 
              onClick={() => onDelete(customer)}
            >
              Excluir
            </Button>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="info">Informações</TabsTrigger>
          <TabsTrigger value="invoices">Faturas ({invoices.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              {/* Grid de Informações Principais */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">CPF/CNPJ</p>
                    <p className="font-medium">{customer.document_number}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Telefone</p>
                    <p className="font-medium">{customer.phone}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{customer.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Endereço</p>
                    <p className="font-medium">
                      {customer.address}, {customer.address_number}
                      {customer.address_complement && ` - ${customer.address_complement}`}
                    </p>
                    <p className="text-sm text-gray-600">
                      {customer.neighborhood} - {customer.city}/{customer.state}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Data de Instalação</p>
                    <p className="font-medium">
                      {customer.installation_date ? 
                        new Date(customer.installation_date).toLocaleDateString() : 
                        "Não definida"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Vencimento</p>
                    <p className="font-medium">Dia {customer.due_day}</p>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Detalhes da Conexão */}
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Wifi className="w-5 h-5 text-blue-600" />
                Dados da Conexão
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500">PPPoE Username</p>
                  <p className="font-medium">{customer.pppoe_username || "Não definido"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">IP Fixo</p>
                  <p className="font-medium">{customer.ip_address || "Não atribuído"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Velocidade</p>
                  <p className="font-medium">
                    ↓ {customer.bandwidth_limit?.download || 0} Mbps / 
                    ↑ {customer.bandwidth_limit?.upload || 0} Mbps
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Informações de Contrato e Pagamento */}
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Contrato e Pagamento
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Método de Pagamento</p>
                  <p className="font-medium">
                    {customer.payment_method === 'bank_slip' ? 'Boleto Bancário' :
                     customer.payment_method === 'credit_card' ? 'Cartão de Crédito' :
                     customer.payment_method === 'pix' ? 'PIX' : 'Não definido'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status do Contrato</p>
                  <p className="font-medium">
                    {customer.contract_status || "Não definido"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Data de Adesão</p>
                  <p className="font-medium">
                    {customer.contract_start_date ? 
                      new Date(customer.contract_start_date).toLocaleDateString() : 
                      "Não definida"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="invoices">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-blue-600" />
                Faturas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingInvoices ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                </div>
              ) : invoices.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Nenhuma fatura encontrada para este cliente
                </div>
              ) : (
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Vencimento</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Forma de Pagamento</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invoices
                        .sort((a, b) => new Date(b.due_date) - new Date(a.due_date))
                        .map((invoice) => (
                          <TableRow key={invoice.id}>
                            <TableCell>
                              {format(new Date(invoice.due_date), "dd/MM/yyyy")}
                            </TableCell>
                            <TableCell>{invoice.description}</TableCell>
                            <TableCell>{formatCurrency(invoice.amount)}</TableCell>
                            <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                            <TableCell>
                              {invoice.payment_method === 'bank_slip' ? 'Boleto' :
                               invoice.payment_method === 'credit_card' ? 'Cartão de Crédito' :
                               invoice.payment_method === 'pix' ? 'PIX' : 'N/A'}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-blue-600"
                                onClick={() => viewInvoice(invoice)}
                              >
                                Visualizar
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog para confirmação de promoção */}
      <Dialog open={showPromoDialog} onOpenChange={setShowPromoDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gerar Carnê de Pagamento</DialogTitle>
            <DialogDescription>
              Selecione se deseja aplicar a promoção de 50% de desconto nos primeiros 3 meses.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="promo-switch">Aplicar Promoção (50% OFF primeiros 3 meses)</Label>
              <Switch
                id="promo-switch"
                checked={applyPromo}
                onCheckedChange={setApplyPromo}
              />
            </div>
            <p className="mt-2 text-sm text-gray-500">
              {applyPromo 
                ? "Os 3 primeiros meses terão 50% de desconto"
                : "O carnê será gerado com valor integral"}
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPromoDialog(false)}
              disabled={processingInvoices}
            >
              Cancelar
            </Button>
            <Button
              onClick={() => generateBooklet(applyPromo)}
              disabled={processingInvoices}
              className="bg-purple-600"
            >
              {processingInvoices ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Gerando...
                </>
              ) : (
                "Confirmar e Gerar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
