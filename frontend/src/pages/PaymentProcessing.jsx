import React, { useState, useEffect } from "react";
import { PaymentGateway } from "@/api/entities";
import { Invoice } from "@/api/entities";
import { Customer } from "@/api/entities";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  CreditCard,
  Plus,
  Search,
  Filter,
  DollarSign,
  Settings,
  CheckCircle,
  BarChart,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Edit,
  Trash2,
  XCircle,
  QrCode,
  FileText,
  Receipt,
  Download,
  Loader2
} from "lucide-react";
import PaymentGatewayForm from "../components/payments/PaymentGatewayForm";

export default function PaymentProcessing() {
  const [activeTab, setActiveTab] = useState("transactions");
  const [gateways, setGateways] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showGatewayForm, setShowGatewayForm] = useState(false);
  const [selectedGateway, setSelectedGateway] = useState(null);
  const [transactionsStats, setTransactionsStats] = useState({
    total: 0,
    success: 0,
    failed: 0,
    pending: 0,
    volume: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const gatewaysData = await PaymentGateway.list();
      const invoicesData = await Invoice.list();
      const customersData = await Customer.list();
      
      setGateways(gatewaysData);
      setInvoices(invoicesData);
      setCustomers(customersData);
      
      // Calcular estatísticas
      calculateStats(invoicesData);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (invoicesData) => {
    const stats = {
      total: invoicesData.length,
      success: invoicesData.filter(inv => inv.status === 'paid').length,
      failed: invoicesData.filter(inv => inv.status === 'cancelled').length,
      pending: invoicesData.filter(inv => inv.status === 'pending').length,
      volume: invoicesData.reduce((total, inv) => {
        return inv.status === 'paid' ? total + (inv.amount || 0) : total;
      }, 0)
    };
    
    setTransactionsStats(stats);
  };

  const handleGatewaySave = (gateway) => {
    if (selectedGateway) {
      // Atualizar gateway existente na lista
      setGateways(prev => prev.map(g => g.id === gateway.id ? gateway : g));
    } else {
      // Adicionar novo gateway à lista
      setGateways(prev => [...prev, gateway]);
    }
    
    setShowGatewayForm(false);
    setSelectedGateway(null);
  };

  const handleAddGateway = () => {
    setSelectedGateway(null);
    setShowGatewayForm(true);
  };

  const handleEditGateway = (gateway) => {
    setSelectedGateway(gateway);
    setShowGatewayForm(true);
  };

  const handleDeleteGateway = async (gateway) => {
    if (window.confirm(`Tem certeza que deseja excluir o gateway ${gateway.name}?`)) {
      try {
        await PaymentGateway.delete(gateway.id);
        setGateways(prev => prev.filter(g => g.id !== gateway.id));
      } catch (error) {
        console.error("Erro ao excluir gateway:", error);
        alert("Não foi possível excluir o gateway. Verifique se não há transações vinculadas a ele.");
      }
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      paid: { label: "Pago", class: "bg-green-100 text-green-800" },
      pending: { label: "Pendente", class: "bg-yellow-100 text-yellow-800" },
      overdue: { label: "Vencido", class: "bg-red-100 text-red-800" },
      cancelled: { label: "Cancelado", class: "bg-gray-100 text-gray-800" },
    };
    
    const statusInfo = statusMap[status] || {
      label: status,
      class: "bg-gray-100 text-gray-800"
    };
    
    return (
      <Badge className={statusInfo.class}>
        {statusInfo.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Processamento de Pagamentos</h1>
          <p className="text-gray-500">Gerencie gateways de pagamento e transações</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => loadData()}
            className="flex items-center gap-1"
          >
            <RefreshCw className="w-4 h-4" />
            Atualizar
          </Button>
          
          <Button 
            onClick={handleAddGateway}
            className="bg-blue-600 flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Novo Gateway
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Volume Processado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <DollarSign className="mr-2 h-4 w-4 text-green-600" />
              <div className="text-2xl font-bold">
                R$ {transactionsStats.volume.toFixed(2)}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Transações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Receipt className="mr-2 h-4 w-4 text-blue-600" />
              <div className="text-2xl font-bold">
                {transactionsStats.total}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Taxa de Sucesso
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
              <div className="text-2xl font-bold">
                {transactionsStats.total > 0 
                  ? `${Math.round((transactionsStats.success / transactionsStats.total) * 100)}%` 
                  : "0%"}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Pendentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <AlertTriangle className="mr-2 h-4 w-4 text-yellow-600" />
              <div className="text-2xl font-bold">
                {transactionsStats.pending}
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
          <TabsTrigger value="transactions" className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Transações
          </TabsTrigger>
          <TabsTrigger value="gateways" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Gateways
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <BarChart className="w-4 h-4" />
            Relatórios
          </TabsTrigger>
        </TabsList>
        
        {/* Conteúdo da aba de Transações */}
        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Transações</CardTitle>
              <CardDescription>
                Visualize e gerencie todas as transações de pagamento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Buscar transações..."
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
                      <TableHead>Valor</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Método</TableHead>
                      <TableHead>Gateway</TableHead>
                      <TableHead>ID da Transação</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          <div className="flex justify-center">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                          </div>
                          <p className="mt-2 text-gray-500">Carregando transações...</p>
                        </TableCell>
                      </TableRow>
                    ) : invoices.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          <div className="flex flex-col items-center justify-center">
                            <XCircle className="w-12 h-12 text-gray-300 mb-2" />
                            <p className="text-gray-500">Nenhuma transação encontrada</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      invoices
                        .filter(invoice => {
                          if (!searchTerm) return true;
                          
                          const customer = customers.find(c => c.id === invoice.customer_id);
                          const customerName = customer ? customer.full_name.toLowerCase() : "";
                          
                          return (
                            customerName.includes(searchTerm.toLowerCase()) ||
                            invoice.status.includes(searchTerm.toLowerCase()) ||
                            (invoice.payment_method || "").includes(searchTerm.toLowerCase())
                          );
                        })
                        .map(invoice => {
                          const customer = customers.find(c => c.id === invoice.customer_id);
                          return (
                            <TableRow key={invoice.id}>
                              <TableCell>
                                {customer ? customer.full_name : "Cliente não encontrado"}
                              </TableCell>
                              <TableCell>R$ {invoice.amount?.toFixed(2)}</TableCell>
                              <TableCell>
                                {invoice.payment_date 
                                  ? new Date(invoice.payment_date).toLocaleDateString('pt-BR') 
                                  : new Date(invoice.due_date).toLocaleDateString('pt-BR')}
                              </TableCell>
                              <TableCell>
                                {getStatusBadge(invoice.status)}
                              </TableCell>
                              <TableCell>
                                {invoice.payment_method === 'credit_card' && (
                                  <div className="flex items-center">
                                    <CreditCard className="w-4 h-4 mr-1 text-purple-600" />
                                    <span>Cartão de Crédito</span>
                                  </div>
                                )}
                                {invoice.payment_method === 'bank_slip' && (
                                  <div className="flex items-center">
                                    <FileText className="w-4 h-4 mr-1 text-blue-600" />
                                    <span>Boleto</span>
                                  </div>
                                )}
                                {invoice.payment_method === 'pix' && (
                                  <div className="flex items-center">
                                    <QrCode className="w-4 h-4 mr-1 text-green-600" />
                                    <span>PIX</span>
                                  </div>
                                )}
                              </TableCell>
                              <TableCell>
                                {invoice.payment_gateway || "Padrão"}
                              </TableCell>
                              <TableCell>
                                <div className="text-xs font-mono">
                                  {invoice.transaction_id || "-"}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  {invoice.invoice_url && (
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                      <ExternalLink className="h-4 w-4" />
                                    </Button>
                                  )}
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <RefreshCw className="h-4 w-4" />
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
        
        {/* Conteúdo da aba de Gateways */}
        <TabsContent value="gateways">
          <Card>
            <CardHeader>
              <CardTitle>Gateways de Pagamento</CardTitle>
              <CardDescription>
                Gerencie integrações com provedores de pagamento
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center py-10">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                  <span className="ml-2 text-gray-500">Carregando gateways...</span>
                </div>
              ) : gateways.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10">
                  <CreditCard className="w-16 h-16 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Nenhum gateway configurado</h3>
                  <p className="text-gray-500 text-center mb-6 max-w-md">
                    Configure gateways de pagamento para processar cobranças de clientes.
                  </p>
                  <Button onClick={handleAddGateway}>
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar Gateway
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {gateways.map(gateway => (
                      <Card key={gateway.id} className="overflow-hidden">
                        <div className={`h-2 w-full ${gateway.sandbox_mode ? 'bg-amber-500' : 'bg-green-500'}`}></div>
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-base">{gateway.name}</CardTitle>
                            <Badge variant={gateway.is_active ? 'outline' : 'secondary'} className={gateway.is_active ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-100 text-gray-700'}>
                              {gateway.is_active ? 'Ativo' : 'Inativo'}
                            </Badge>
                          </div>
                          <CardDescription>
                            <div className="flex items-center">
                              {gateway.provider === 'stripe' && <span className="text-purple-600 font-medium">Stripe</span>}
                              {gateway.provider === 'paypal' && <span className="text-blue-600 font-medium">PayPal</span>}
                              {gateway.provider === 'pagseguro' && <span className="text-green-600 font-medium">PagSeguro</span>}
                              {gateway.provider === 'mercadopago' && <span className="text-blue-500 font-medium">Mercado Pago</span>}
                              {gateway.provider === 'asaas' && <span className="text-cyan-600 font-medium">Asaas</span>}
                              {gateway.provider === 'gerencianet' && <span className="text-teal-600 font-medium">Gerencianet</span>}
                              {gateway.provider === 'cielo' && <span className="text-indigo-600 font-medium">Cielo</span>}
                              {gateway.provider === 'pix' && <span className="text-green-600 font-medium">PIX Direto</span>}
                              {gateway.sandbox_mode && (
                                <Badge variant="outline" className="ml-2 text-xs bg-amber-50 text-amber-700 border-amber-200">
                                  Sandbox
                                </Badge>
                              )}
                            </div>
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex flex-wrap gap-1">
                              {gateway.supports_credit_card && (
                                <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                                  <CreditCard className="h-3 w-3 mr-1" />
                                  Cartão
                                </Badge>
                              )}
                              {gateway.supports_bank_slip && (
                                <Badge variant="secondary" className="bg-gray-50 text-gray-700">
                                  <FileText className="h-3 w-3 mr-1" />
                                  Boleto
                                </Badge>
                              )}
                              {gateway.supports_pix && (
                                <Badge variant="secondary" className="bg-green-50 text-green-700">
                                  <QrCode className="h-3 w-3 mr-1" />
                                  PIX
                                </Badge>
                              )}
                              {gateway.supports_recurring && (
                                <Badge variant="secondary" className="bg-purple-50 text-purple-700">
                                  <RefreshCw className="h-3 w-3 mr-1" />
                                  Recorrente
                                </Badge>
                              )}
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="flex justify-between border-t pt-4">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleEditGateway(gateway)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Editar
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDeleteGateway(gateway)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Remover
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                    
                    {/* Cartão para adicionar novo gateway */}
                    <Card className="border-dashed border-2 border-gray-200 bg-gray-50/50 hover:bg-gray-50 transition-colors cursor-pointer" onClick={handleAddGateway}>
                      <CardContent className="flex flex-col items-center justify-center h-full py-12">
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                          <Plus className="w-6 h-6 text-blue-600" />
                        </div>
                        <p className="text-blue-600 font-medium">Adicionar Gateway</p>
                        <p className="text-gray-500 text-sm text-center mt-1">
                          Configure um novo provedor de pagamentos
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Conteúdo da aba de Relatórios */}
        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Relatórios Financeiros</CardTitle>
              <CardDescription>
                Acompanhe a performance dos seus pagamentos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12">
                <BarChart className="w-16 h-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium mb-2">Relatórios em Desenvolvimento</h3>
                <p className="text-gray-500 text-center max-w-md">
                  Os relatórios financeiros detalhados estarão disponíveis em breve. Aqui você poderá
                  analisar métricas de pagamento, taxas de conversão e tendências.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Dialog para formulário de gateway */}
      <Dialog open={showGatewayForm} onOpenChange={setShowGatewayForm}>
        <DialogContent className="max-w-3xl">
          <PaymentGatewayForm 
            gatewayData={selectedGateway}
            onSave={handleGatewaySave}
            onCancel={() => {
              setShowGatewayForm(false);
              setSelectedGateway(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}