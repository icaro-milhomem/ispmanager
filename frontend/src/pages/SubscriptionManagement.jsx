
import React, { useState, useEffect } from "react";
import { Customer } from "@/api/entities";
import { Subscription } from "@/api/entities";
import { Plan } from "@/api/entities";
import { Invoice } from "@/api/entities";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Search,
  Users,
  ArrowRight,
  Calendar,
  CheckCircle,
  Wifi,
  Zap,
  Upload,
  Download,
  Package,
  RefreshCw,
  Clock,
  CreditCard,
  AlertTriangle,
  ChevronRight,
  Plus,
  FileText,
  Edit,
  ArrowUpRight,
  AlertCircle
} from "lucide-react";

export default function SubscriptionManagement() {
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [showRenewDialog, setShowRenewDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [upgradeDetails, setUpgradeDetails] = useState({
    plan_id: "",
    billing_cycle: "monthly",
    auto_renew: true
  });
  const [feedbackMessage, setFeedbackMessage] = useState({ type: "", message: "" });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const [customersData, plansData, subscriptionsData, invoicesData] = await Promise.all([
        Customer.list(),
        Plan.list(),
        Subscription.list(),
        Invoice.list()
      ]);
      
      if (plansData.length === 0) {
        await createDefaultPlans();
        const updatedPlans = await Plan.list();
        setPlans(updatedPlans);
      } else {
        setPlans(plansData);
      }
      
      setCustomers(customersData);
      setSubscriptions(subscriptionsData);
      setInvoices(invoicesData);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      setFeedbackMessage({
        type: "error",
        message: "Erro ao carregar dados. Tente novamente mais tarde."
      });
    } finally {
      setLoading(false);
    }
  };

  const createDefaultPlans = async () => {
    const defaultPlans = [
      {
        name: "Plano Básico",
        code: "basic",
        description: "Plano ideal para uso básico de internet, navegação e e-mail.",
        download_speed: 50,
        upload_speed: 25,
        monthly_price: 79.90,
        quarterly_discount: 5,
        annual_discount: 15,
        features: ["Navegação", "E-mail", "Redes Sociais", "Suporte Básico"],
        category: "residential",
        is_active: true,
        setup_fee: 99
      },
      {
        name: "Plano Padrão",
        code: "standard",
        description: "Plano ideal para famílias com uso moderado de streaming e jogos.",
        download_speed: 150,
        upload_speed: 75,
        monthly_price: 129.90,
        quarterly_discount: 10,
        annual_discount: 20,
        features: ["Streaming HD", "Jogos Online", "Múltiplos Dispositivos", "Suporte Prioritário"],
        category: "residential",
        is_active: true,
        setup_fee: 79
      },
      {
        name: "Plano Premium",
        code: "premium",
        description: "Para usuários exigentes que precisam de alta velocidade para streaming 4K e downloads.",
        download_speed: 300,
        upload_speed: 150,
        monthly_price: 199.90,
        quarterly_discount: 10,
        annual_discount: 20,
        features: ["Streaming 4K", "Downloads Rápidos", "Prioridade de Tráfego", "Suporte VIP"],
        category: "residential",
        is_active: true,
        setup_fee: 49
      },
      {
        name: "Plano Empresarial",
        code: "enterprise",
        description: "Para pequenas e médias empresas que precisam de confiabilidade e velocidade.",
        download_speed: 500,
        upload_speed: 250,
        monthly_price: 349.90,
        quarterly_discount: 15,
        annual_discount: 25,
        features: ["IP Fixo", "Link Dedicado", "Garantia de Banda", "Suporte 24/7"],
        category: "business",
        is_active: true,
        setup_fee: 0
      }
    ];
    
    try {
      for (const plan of defaultPlans) {
        await Plan.create(plan);
      }
      console.log("Planos padrão criados com sucesso");
    } catch (error) {
      console.error("Erro ao criar planos padrão:", error);
    }
  };

  const getFilteredSubscriptions = () => {
    let filtered = subscriptions;
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(sub => {
        const customer = customers.find(c => c.id === sub.customer_id);
        const plan = plans.find(p => p.id === sub.plan_id);
        
        return (
          customer?.full_name?.toLowerCase().includes(term) ||
          customer?.cpf?.toLowerCase().includes(term) ||
          plan?.name?.toLowerCase().includes(term)
        );
      });
    }
    
    if (selectedCustomer) {
      filtered = filtered.filter(sub => sub.customer_id === selectedCustomer.id);
    }
    
    if (activeTab !== "all") {
      filtered = filtered.filter(sub => sub.status === activeTab);
    }
    
    return filtered;
  };

  const getCustomerName = (customerId) => {
    const customer = customers.find(c => c.id === customerId);
    return customer?.full_name || "Cliente não encontrado";
  };

  const getPlanDetails = (planId) => {
    return plans.find(p => p.id === planId) || null;
  };

  const formatCurrency = (value) => {
    return `R$ ${value.toFixed(2).replace(".", ",")}`;
  };

  const calculatePrice = (planId, billingCycle) => {
    const plan = plans.find(p => p.id === planId);
    if (!plan) return 0;
    
    const basePrice = plan.monthly_price;
    
    switch (billingCycle) {
      case "monthly":
        return basePrice;
      case "quarterly":
        const quarterlyDiscount = (basePrice * 3) * (plan.quarterly_discount / 100);
        return (basePrice * 3) - quarterlyDiscount;
      case "annual":
        const annualDiscount = (basePrice * 12) * (plan.annual_discount / 100);
        return (basePrice * 12) - annualDiscount;
      default:
        return basePrice;
    }
  };

  const handleSelectCustomer = (customerId) => {
    const customer = customers.find(c => c.id === customerId);
    setSelectedCustomer(customer);
  };

  const handleUpgradeSubscription = (subscription) => {
    setSelectedSubscription(subscription);
    
    const currentPlan = getPlanDetails(subscription.plan_id);
    const currentPlanIndex = plans.findIndex(p => p.id === subscription.plan_id);
    const nextPlanId = currentPlanIndex >= 0 && currentPlanIndex < plans.length - 1 
      ? plans[currentPlanIndex + 1].id 
      : subscription.plan_id;
    
    setUpgradeDetails({
      plan_id: nextPlanId,
      billing_cycle: subscription.billing_cycle,
      auto_renew: subscription.auto_renew
    });
    
    setShowUpgradeDialog(true);
  };

  const confirmUpgrade = async () => {
    try {
      if (!selectedSubscription || !upgradeDetails.plan_id) {
        setFeedbackMessage({
          type: "error",
          message: "Dados de upgrade inválidos. Tente novamente."
        });
        return;
      }
      
      const newPlan = plans.find(p => p.id === upgradeDetails.plan_id);
      const oldPlan = plans.find(p => p.id === selectedSubscription.plan_id);
      
      if (!newPlan || !oldPlan) {
        setFeedbackMessage({
          type: "error",
          message: "Não foi possível encontrar os detalhes do plano."
        });
        return;
      }
      
      const newPrice = calculatePrice(upgradeDetails.plan_id, upgradeDetails.billing_cycle);
      const today = new Date();
      
      let nextBillingDate = new Date();
      switch (upgradeDetails.billing_cycle) {
        case "monthly":
          nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
          break;
        case "quarterly":
          nextBillingDate.setMonth(nextBillingDate.getMonth() + 3);
          break;
        case "annual":
          nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
          break;
      }
      
      let discountApplied = 0;
      if (upgradeDetails.billing_cycle === "quarterly") {
        discountApplied = newPlan.quarterly_discount;
      } else if (upgradeDetails.billing_cycle === "annual") {
        discountApplied = newPlan.annual_discount;
      }
      
      const updatedSubscription = {
        ...selectedSubscription,
        plan_id: upgradeDetails.plan_id,
        billing_cycle: upgradeDetails.billing_cycle,
        auto_renew: upgradeDetails.auto_renew,
        price: newPrice,
        discount_applied: discountApplied,
        next_billing_date: nextBillingDate.toISOString().split('T')[0]
      };
      
      await Subscription.update(selectedSubscription.id, updatedSubscription);
      
      if (newPlan.monthly_price > oldPlan.monthly_price) {
        const customer = customers.find(c => c.id === selectedSubscription.customer_id);
        const priceDifference = newPlan.monthly_price - oldPlan.monthly_price;
        
        await Invoice.create({
          customer_id: selectedSubscription.customer_id,
          amount: priceDifference,
          due_date: new Date(today.getTime() + (7 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
          status: "pending",
          payment_method: customer?.payment_method || "bank_slip",
          description: `Upgrade de plano: ${oldPlan.name} para ${newPlan.name}`
        });
      }
      
      setFeedbackMessage({
        type: "success",
        message: `Plano atualizado com sucesso para ${newPlan.name} com pagamento ${
          upgradeDetails.billing_cycle === "monthly" ? "mensal" : 
          upgradeDetails.billing_cycle === "quarterly" ? "trimestral" : "anual"
        }.`
      });
      
      await loadData();
      setShowUpgradeDialog(false);
    } catch (error) {
      console.error("Erro ao fazer upgrade:", error);
      setFeedbackMessage({
        type: "error",
        message: "Erro ao atualizar plano. Tente novamente mais tarde."
      });
    }
  };

  const handleRenewSubscription = (subscription) => {
    setSelectedSubscription(subscription);
    setShowRenewDialog(true);
  };

  const confirmRenewal = async () => {
    try {
      if (!selectedSubscription) return;
      
      const plan = plans.find(p => p.id === selectedSubscription.plan_id);
      if (!plan) {
        setFeedbackMessage({
          type: "error",
          message: "Não foi possível encontrar os detalhes do plano."
        });
        return;
      }
      
      let endDate = new Date();
      switch (selectedSubscription.billing_cycle) {
        case "monthly":
          endDate.setMonth(endDate.getMonth() + 1);
          break;
        case "quarterly":
          endDate.setMonth(endDate.getMonth() + 3);
          break;
        case "annual":
          endDate.setFullYear(endDate.getFullYear() + 1);
          break;
      }
      
      const updatedSubscription = {
        ...selectedSubscription,
        status: "active",
        start_date: new Date().toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        next_billing_date: endDate.toISOString().split('T')[0]
      };
      
      await Subscription.update(selectedSubscription.id, updatedSubscription);
      
      await Invoice.create({
        customer_id: selectedSubscription.customer_id,
        amount: selectedSubscription.price,
        due_date: new Date(new Date().getTime() + (5 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
        status: "pending",
        payment_method: "bank_slip",
        description: `Renovação de assinatura: ${plan.name} (${
          selectedSubscription.billing_cycle === "monthly" ? "Mensal" : 
          selectedSubscription.billing_cycle === "quarterly" ? "Trimestral" : "Anual"
        })`
      });
      
      setFeedbackMessage({
        type: "success",
        message: `Assinatura renovada com sucesso até ${new Date(endDate).toLocaleDateString('pt-BR')}.`
      });
      
      await loadData();
      setShowRenewDialog(false);
    } catch (error) {
      console.error("Erro ao renovar assinatura:", error);
      setFeedbackMessage({
        type: "error",
        message: "Erro ao renovar assinatura. Tente novamente mais tarde."
      });
    }
  };

  const handleCancelSubscription = (subscription) => {
    setSelectedSubscription(subscription);
    setShowCancelDialog(true);
  };

  const confirmCancellation = async () => {
    try {
      if (!selectedSubscription) return;
      
      const updatedSubscription = {
        ...selectedSubscription,
        status: "cancelled",
        auto_renew: false
      };
      
      await Subscription.update(selectedSubscription.id, updatedSubscription);
      
      setFeedbackMessage({
        type: "success",
        message: "Assinatura cancelada com sucesso."
      });
      
      await loadData();
      setShowCancelDialog(false);
    } catch (error) {
      console.error("Erro ao cancelar assinatura:", error);
      setFeedbackMessage({
        type: "error",
        message: "Erro ao cancelar assinatura. Tente novamente mais tarde."
      });
    }
  };

  const handleCreateSubscription = async () => {
    try {
      if (!selectedCustomer) {
        setFeedbackMessage({
          type: "error", 
          message: "Selecione um cliente para criar uma assinatura."
        });
        return;
      }
      
      const existingActiveSubscription = subscriptions.find(
        sub => sub.customer_id === selectedCustomer.id && sub.status === "active"
      );
      
      if (existingActiveSubscription) {
        setFeedbackMessage({
          type: "error",
          message: "Este cliente já possui uma assinatura ativa."
        });
        return;
      }
      
      const clientPlanCode = selectedCustomer.plan || "basic";
      const planToUse = plans.find(p => p.code === clientPlanCode) || plans.find(p => p.code === "basic");
      
      if (!planToUse) {
        setFeedbackMessage({
          type: "error",
          message: "Não foi possível encontrar um plano apropriado."
        });
        return;
      }
      
      const today = new Date();
      let nextBillingDate = new Date();
      nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
      
      const newSubscription = {
        customer_id: selectedCustomer.id,
        plan_id: planToUse.id,
        billing_cycle: "monthly",
        start_date: today.toISOString().split('T')[0],
        status: "active",
        price: planToUse.monthly_price,
        discount_applied: 0,
        auto_renew: true,
        next_billing_date: nextBillingDate.toISOString().split('T')[0],
        payment_method: "bank_slip"
      };
      
      await Subscription.create(newSubscription);
      
      await Invoice.create({
        customer_id: selectedCustomer.id,
        amount: planToUse.monthly_price,
        due_date: new Date(today.getTime() + (5 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
        status: "pending",
        payment_method: "bank_slip",
        description: `Nova assinatura: ${planToUse.name} (Mensal)`
      });
      
      setFeedbackMessage({
        type: "success",
        message: `Assinatura criada com sucesso para ${selectedCustomer.full_name}.`
      });
      
      await loadData();
    } catch (error) {
      console.error("Erro ao criar assinatura:", error);
      setFeedbackMessage({
        type: "error",
        message: "Erro ao criar assinatura. Tente novamente mais tarde."
      });
    }
  };

  const renderStatus = (status) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Ativo</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>;
      case "expired":
        return <Badge className="bg-red-100 text-red-800">Expirado</Badge>;
      case "cancelled":
        return <Badge className="bg-gray-100 text-gray-800">Cancelado</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const renderBillingCycle = (cycle) => {
    switch (cycle) {
      case "monthly":
        return "Mensal";
      case "quarterly":
        return "Trimestral";
      case "annual":
        return "Anual";
      default:
        return cycle;
    }
  };

  const isPlanAvailable = (planId) => {
    if (!selectedSubscription || !selectedSubscription.plan_id) return true;
    
    const currentPlan = plans.find(p => p.id === selectedSubscription.plan_id);
    const selectedPlan = plans.find(p => p.id === planId);
    
    if (!currentPlan || !selectedPlan) return true;
    
    return selectedPlan.download_speed >= currentPlan.download_speed;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Gerenciamento de Assinaturas</h1>
          <p className="text-gray-500">Administre assinaturas e planos de internet</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => loadData()}
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Atualizar
          </Button>
          {selectedCustomer && (
            <Button 
              onClick={handleCreateSubscription}
              className="bg-blue-600 flex gap-2"
            >
              <Plus className="w-4 h-4" />
              Nova Assinatura
            </Button>
          )}
        </div>
      </div>

      {feedbackMessage.message && (
        <Alert 
          className={`${
            feedbackMessage.type === "success" ? "bg-green-50 border-green-200" : 
            feedbackMessage.type === "error" ? "bg-red-50 border-red-200" : 
            "bg-blue-50 border-blue-200"
          }`}
        >
          <AlertCircle className={`w-4 h-4 ${
            feedbackMessage.type === "success" ? "text-green-500" : 
            feedbackMessage.type === "error" ? "text-red-500" : 
            "text-blue-500"
          }`} />
          <AlertTitle className={`${
            feedbackMessage.type === "success" ? "text-green-700" : 
            feedbackMessage.type === "error" ? "text-red-700" : 
            "text-blue-700"
          }`}>
            {feedbackMessage.type === "success" ? "Sucesso" : 
             feedbackMessage.type === "error" ? "Erro" : 
             "Informação"}
          </AlertTitle>
          <AlertDescription className={`${
            feedbackMessage.type === "success" ? "text-green-600" : 
            feedbackMessage.type === "error" ? "text-red-600" : 
            "text-blue-600"
          }`}>
            {feedbackMessage.message}
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Filtros e Seleção</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar assinaturas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="w-full md:w-64">
              <Select
                value={selectedCustomer ? selectedCustomer.id : ""}
                onValueChange={handleSelectCustomer}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar cliente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>Todos os clientes</SelectItem>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {selectedCustomer && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-blue-600" />
                <h3 className="font-medium text-blue-800">Cliente Selecionado</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                <div>
                  <p className="text-sm text-gray-500">Nome</p>
                  <p className="font-medium">{selectedCustomer.full_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">CPF</p>
                  <p className="font-medium">{selectedCustomer.cpf}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Plano Atual</p>
                  <p className="font-medium">
                    {selectedCustomer.plan === "basic" ? "Básico" : 
                     selectedCustomer.plan === "standard" ? "Padrão" :
                     selectedCustomer.plan === "premium" ? "Premium" : "Empresarial"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="font-medium">
                    {selectedCustomer.status === "active" ? "Ativo" :
                     selectedCustomer.status === "inactive" ? "Inativo" :
                     selectedCustomer.status === "suspended" ? "Suspenso" : "Pendente"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <CardTitle>Assinaturas</CardTitle>
              <TabsList>
                <TabsTrigger value="all">Todas</TabsTrigger>
                <TabsTrigger value="active">Ativas</TabsTrigger>
                <TabsTrigger value="pending">Pendentes</TabsTrigger>
                <TabsTrigger value="expired">Expiradas</TabsTrigger>
                <TabsTrigger value="cancelled">Canceladas</TabsTrigger>
              </TabsList>
            </div>
          </CardHeader>
          
          <CardContent>
            <TabsContent value="all" className="mt-0">
              <SubscriptionsList 
                subscriptions={getFilteredSubscriptions()}
                customers={customers}
                plans={plans}
                loading={loading}
                renderStatus={renderStatus}
                renderBillingCycle={renderBillingCycle}
                getCustomerName={getCustomerName}
                getPlanDetails={getPlanDetails}
                formatCurrency={formatCurrency}
                onUpgrade={handleUpgradeSubscription}
                onRenew={handleRenewSubscription}
                onCancel={handleCancelSubscription}
              />
            </TabsContent>
            
            <TabsContent value="active" className="mt-0">
              <SubscriptionsList 
                subscriptions={getFilteredSubscriptions()}
                customers={customers}
                plans={plans}
                loading={loading}
                renderStatus={renderStatus}
                renderBillingCycle={renderBillingCycle}
                getCustomerName={getCustomerName}
                getPlanDetails={getPlanDetails}
                formatCurrency={formatCurrency}
                onUpgrade={handleUpgradeSubscription}
                onRenew={handleRenewSubscription}
                onCancel={handleCancelSubscription}
              />
            </TabsContent>
            
            <TabsContent value="pending" className="mt-0">
              <SubscriptionsList 
                subscriptions={getFilteredSubscriptions()}
                customers={customers}
                plans={plans}
                loading={loading}
                renderStatus={renderStatus}
                renderBillingCycle={renderBillingCycle}
                getCustomerName={getCustomerName}
                getPlanDetails={getPlanDetails}
                formatCurrency={formatCurrency}
                onUpgrade={handleUpgradeSubscription}
                onRenew={handleRenewSubscription}
                onCancel={handleCancelSubscription}
              />
            </TabsContent>
            
            <TabsContent value="expired" className="mt-0">
              <SubscriptionsList 
                subscriptions={getFilteredSubscriptions()}
                customers={customers}
                plans={plans}
                loading={loading}
                renderStatus={renderStatus}
                renderBillingCycle={renderBillingCycle}
                getCustomerName={getCustomerName}
                getPlanDetails={getPlanDetails}
                formatCurrency={formatCurrency}
                onUpgrade={handleUpgradeSubscription}
                onRenew={handleRenewSubscription}
                onCancel={handleCancelSubscription}
              />
            </TabsContent>
            
            <TabsContent value="cancelled" className="mt-0">
              <SubscriptionsList 
                subscriptions={getFilteredSubscriptions()}
                customers={customers}
                plans={plans}
                loading={loading}
                renderStatus={renderStatus}
                renderBillingCycle={renderBillingCycle}
                getCustomerName={getCustomerName}
                getPlanDetails={getPlanDetails}
                formatCurrency={formatCurrency}
                onUpgrade={handleUpgradeSubscription}
                onRenew={handleRenewSubscription}
                onCancel={handleCancelSubscription}
              />
            </TabsContent>
          </CardContent>
        </Card>
      </Tabs>

      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Upgrade de Plano</DialogTitle>
            <DialogDescription>
              Selecione o novo plano e opções de faturamento
            </DialogDescription>
          </DialogHeader>
          
          {selectedSubscription && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="plan">Plano</Label>
                <Select
                  value={upgradeDetails.plan_id}
                  onValueChange={(value) => setUpgradeDetails({...upgradeDetails, plan_id: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um plano" />
                  </SelectTrigger>
                  <SelectContent>
                    {plans.map((plan) => (
                      <SelectItem 
                        key={plan.id} 
                        value={plan.id}
                        disabled={!isPlanAvailable(plan.id)}
                      >
                        {plan.name} - {plan.download_speed} Mbps
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Ciclo de Cobrança</Label>
                <RadioGroup
                  value={upgradeDetails.billing_cycle}
                  onValueChange={(value) => setUpgradeDetails({...upgradeDetails, billing_cycle: value})}
                  className="flex flex-col space-y-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="monthly" id="monthly" />
                    <Label htmlFor="monthly">Mensal</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="quarterly" id="quarterly" />
                    <Label htmlFor="quarterly">Trimestral (5-10% de desconto)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="annual" id="annual" />
                    <Label htmlFor="annual">Anual (15-25% de desconto)</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="auto-renew"
                  checked={upgradeDetails.auto_renew}
                  onCheckedChange={(checked) => setUpgradeDetails({...upgradeDetails, auto_renew: checked})}
                />
                <Label htmlFor="auto-renew">Renovação Automática</Label>
              </div>
              
              {upgradeDetails.plan_id && (
                <div className="bg-blue-50 p-4 rounded-lg mt-4">
                  <h3 className="font-medium mb-2">Resumo do Upgrade</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Plano:</span>
                      <span className="font-medium">{getPlanDetails(upgradeDetails.plan_id)?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Velocidade:</span>
                      <span className="font-medium">{getPlanDetails(upgradeDetails.plan_id)?.download_speed} Mbps</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Ciclo:</span>
                      <span className="font-medium">{renderBillingCycle(upgradeDetails.billing_cycle)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Valor:</span>
                      <span className="font-medium">{formatCurrency(calculatePrice(upgradeDetails.plan_id, upgradeDetails.billing_cycle))}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUpgradeDialog(false)}>Cancelar</Button>
            <Button className="bg-blue-600" onClick={confirmUpgrade}>Confirmar Upgrade</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showRenewDialog} onOpenChange={setShowRenewDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Renovar Assinatura</DialogTitle>
            <DialogDescription>
              Confirme a renovação da assinatura
            </DialogDescription>
          </DialogHeader>
          
          {selectedSubscription && (
            <div className="space-y-4">
              <Alert className="bg-yellow-50 border-yellow-100">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <AlertTitle className="text-yellow-800">Confirmação</AlertTitle>
                <AlertDescription className="text-yellow-700">
                  Você está prestes a renovar a assinatura do plano 
                  <strong> {getPlanDetails(selectedSubscription.plan_id)?.name}</strong>. 
                  Uma nova fatura será gerada.
                </AlertDescription>
              </Alert>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Detalhes da Assinatura</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Cliente:</span>
                    <span className="font-medium">{getCustomerName(selectedSubscription.customer_id)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Plano:</span>
                    <span className="font-medium">{getPlanDetails(selectedSubscription.plan_id)?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ciclo:</span>
                    <span className="font-medium">{renderBillingCycle(selectedSubscription.billing_cycle)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Valor:</span>
                    <span className="font-medium">{formatCurrency(selectedSubscription.price)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRenewDialog(false)}>Cancelar</Button>
            <Button className="bg-blue-600" onClick={confirmRenewal}>Confirmar Renovação</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Cancelar Assinatura</DialogTitle>
            <DialogDescription>
              Confirme o cancelamento da assinatura
            </DialogDescription>
          </DialogHeader>
          
          {selectedSubscription && (
            <div className="space-y-4">
              <Alert className="bg-red-50 border-red-100">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertTitle className="text-red-800">Aviso</AlertTitle>
                <AlertDescription className="text-red-700">
                  Você está prestes a cancelar a assinatura de 
                  <strong> {getCustomerName(selectedSubscription.customer_id)}</strong>. 
                  O cliente perderá acesso ao serviço.
                </AlertDescription>
              </Alert>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Detalhes da Assinatura</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Cliente:</span>
                    <span className="font-medium">{getCustomerName(selectedSubscription.customer_id)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Plano:</span>
                    <span className="font-medium">{getPlanDetails(selectedSubscription.plan_id)?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Desde:</span>
                    <span className="font-medium">
                      {new Date(selectedSubscription.start_date).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>Não Cancelar</Button>
            <Button variant="destructive" onClick={confirmCancellation}>Confirmar Cancelamento</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SubscriptionsList({
  subscriptions,
  customers,
  plans,
  loading,
  renderStatus,
  renderBillingCycle,
  getCustomerName,
  getPlanDetails,
  formatCurrency,
  onUpgrade,
  onRenew,
  onCancel
}) {
  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-500">Carregando assinaturas...</p>
      </div>
    );
  }

  if (subscriptions.length === 0) {
    return (
      <div className="text-center py-8">
        <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-lg font-medium text-gray-500">Nenhuma assinatura encontrada</p>
        <p className="text-gray-400">Selecione um cliente e clique em "Nova Assinatura" para começar</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Cliente</TableHead>
            <TableHead>Plano</TableHead>
            <TableHead>Velocidade</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Ciclo</TableHead>
            <TableHead>Próx. Fatura</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {subscriptions.map((subscription) => {
            const plan = getPlanDetails(subscription.plan_id);
            return (
              <TableRow key={subscription.id}>
                <TableCell className="font-medium">
                  {getCustomerName(subscription.customer_id)}
                </TableCell>
                <TableCell>{plan?.name || "N/A"}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Download className="w-3 h-3 text-blue-500" />
                    {plan?.download_speed || "N/A"} Mbps
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Upload className="w-3 h-3" />
                    {plan?.upload_speed || "N/A"} Mbps
                  </div>
                </TableCell>
                <TableCell>{formatCurrency(subscription.price)}</TableCell>
                <TableCell>{renderBillingCycle(subscription.billing_cycle)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-gray-400" />
                    {subscription.next_billing_date ? 
                      new Date(subscription.next_billing_date).toLocaleDateString('pt-BR') : 
                      "N/A"}
                  </div>
                </TableCell>
                <TableCell>{renderStatus(subscription.status)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {subscription.status === "active" && (
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => onUpgrade(subscription)}
                        title="Fazer Upgrade"
                      >
                        <ArrowUpRight className="w-4 h-4 text-blue-600" />
                      </Button>
                    )}
                    {(subscription.status === "expired" || subscription.status === "pending") && (
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => onRenew(subscription)}
                        title="Renovar Assinatura"
                      >
                        <RefreshCw className="w-4 h-4 text-green-600" />
                      </Button>
                    )}
                    {subscription.status === "active" && (
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => onCancel(subscription)}
                        title="Cancelar Assinatura"
                      >
                        <AlertCircle className="w-4 h-4 text-red-600" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
