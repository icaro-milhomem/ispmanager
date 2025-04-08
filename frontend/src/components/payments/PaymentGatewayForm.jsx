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
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CreditCard,
  Save,
  ExternalLink,
  AlertCircle,
  ArrowLeft,
  Loader2,
  Globe,
  Lock,
  Key,
  Settings,
  TestTube
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function PaymentGatewayForm({ gatewayData, onSave, onCancel }) {
  const [activeTab, setActiveTab] = useState("general");
  const [saveLoading, setSaveLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [formData, setFormData] = useState(
    gatewayData || {
      name: "",
      provider: "",
      api_key: "",
      api_secret: "",
      sandbox_mode: true,
      webhook_url: "",
      checkout_type: "redirect",
      supports_recurring: false,
      supports_credit_card: true,
      supports_debit_card: false,
      supports_bank_slip: false,
      supports_pix: false,
      merchant_id: "",
      webhook_secret: "",
      additional_settings: {},
      is_active: true,
      payment_fee: 0
    }
  );

  // Definições dos gateways suportados e seus campos específicos
  const gatewayProviders = [
    { 
      value: "stripe", 
      label: "Stripe",
      icon: "https://cdn.worldvectorlogo.com/logos/stripe-4.svg",
      description: "Um gateway de pagamento global completo",
      fields: ["api_key", "api_secret", "webhook_secret"],
      supportsRecurring: true,
      methods: ["credit_card", "debit_card"],
      learnMoreUrl: "https://stripe.com"
    },
    { 
      value: "paypal", 
      label: "PayPal",
      icon: "https://cdn.worldvectorlogo.com/logos/paypal-2.svg",
      description: "Gateway internacional com ampla aceitação global",
      fields: ["client_id", "client_secret"],
      supportsRecurring: true,
      methods: ["credit_card", "paypal_balance"],
      learnMoreUrl: "https://developer.paypal.com"
    },
    { 
      value: "pagseguro", 
      label: "PagSeguro",
      icon: "https://logodownload.org/wp-content/uploads/2017/06/pagseguro-logo-1.png",
      description: "Gateway brasileiro do grupo UOL",
      fields: ["email", "token"],
      supportsRecurring: true,
      methods: ["credit_card", "bank_slip", "pix"],
      learnMoreUrl: "https://dev.pagseguro.uol.com.br"
    },
    { 
      value: "mercadopago", 
      label: "Mercado Pago",
      icon: "https://logodownload.org/wp-content/uploads/2019/06/mercado-pago-logo.png",
      description: "Gateway de pagamentos do Mercado Livre",
      fields: ["access_token", "public_key"],
      supportsRecurring: true,
      methods: ["credit_card", "bank_slip", "pix"],
      learnMoreUrl: "https://www.mercadopago.com.br/developers"
    },
    { 
      value: "asaas", 
      label: "Asaas",
      icon: "https://www.asaas.com/wp-content/uploads/2021/09/asaas_logo-1.svg",
      description: "Plataforma completa de cobranças e financeiro",
      fields: ["api_key"],
      supportsRecurring: true,
      methods: ["credit_card", "bank_slip", "pix"],
      learnMoreUrl: "https://docs.asaas.com"
    },
    { 
      value: "gerencianet", 
      label: "Gerencianet",
      icon: "https://gerencianet.com.br/wp-content/themes/Gerencianet/assets/images/logo-colorido.svg",
      description: "Gateway de pagamentos com foco em recorrência",
      fields: ["client_id", "client_secret"],
      supportsRecurring: true,
      methods: ["credit_card", "bank_slip", "pix"],
      learnMoreUrl: "https://dev.gerencianet.com.br"
    },
    { 
      value: "cielo", 
      label: "Cielo",
      icon: "https://logodownload.org/wp-content/uploads/2019/03/cielo-logo.png",
      description: "Uma das maiores operadoras de cartão do Brasil",
      fields: ["merchant_id", "merchant_key"],
      supportsRecurring: false,
      methods: ["credit_card", "debit_card"],
      learnMoreUrl: "https://developercielo.github.io/manual/cielo-ecommerce"
    },
    { 
      value: "pix", 
      label: "PIX Direto",
      icon: "https://logodownload.org/wp-content/uploads/2020/02/pix-bc-logo.png",
      description: "Integração direta com PIX via PSP ou banco",
      fields: ["api_key", "certificate_path"],
      supportsRecurring: false,
      methods: ["pix"],
      learnMoreUrl: "https://www.bcb.gov.br/estabilidadefinanceira/pix"
    },
    { 
      value: "other", 
      label: "Outro/Customizado",
      icon: "",
      description: "Configuração personalizada para outros gateways",
      fields: ["api_key", "api_secret"],
      supportsRecurring: false,
      methods: [],
      learnMoreUrl: ""
    }
  ];

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

  const handleAdditionalSettingChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      additional_settings: {
        ...prev.additional_settings,
        [field]: value
      }
    }));
  };

  const selectedGatewayInfo = gatewayProviders.find(g => g.value === formData.provider);

  const updateFeatures = (provider) => {
    const gatewayInfo = gatewayProviders.find(g => g.value === provider);
    if (gatewayInfo) {
      // Atualizar suporte a recursos com base no gateway selecionado
      setFormData(prev => ({
        ...prev,
        provider,
        supports_recurring: gatewayInfo.supportsRecurring,
        supports_credit_card: gatewayInfo.methods.includes("credit_card"),
        supports_debit_card: gatewayInfo.methods.includes("debit_card"),
        supports_bank_slip: gatewayInfo.methods.includes("bank_slip"),
        supports_pix: gatewayInfo.methods.includes("pix")
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name) errors.name = "Nome é obrigatório";
    if (!formData.provider) errors.provider = "Provedor é obrigatório";
    if (!formData.api_key) errors.api_key = "API Key é obrigatório";
    
    // Validações específicas por provedor
    if (selectedGatewayInfo) {
      if (selectedGatewayInfo.fields.includes("api_secret") && !formData.api_secret) {
        errors.api_secret = "API Secret é obrigatório para este provedor";
      }
      
      if (selectedGatewayInfo.fields.includes("client_id") && 
          (!formData.additional_settings?.client_id || formData.additional_settings.client_id.trim() === "")) {
        errors.client_id = "Client ID é obrigatório para este provedor";
      }
      
      if (selectedGatewayInfo.fields.includes("client_secret") && 
          (!formData.additional_settings?.client_secret || formData.additional_settings.client_secret.trim() === "")) {
        errors.client_secret = "Client Secret é obrigatório para este provedor";
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setSaveLoading(true);
      
      // Verificar se é uma criação ou edição
      let savedGateway;
      if (gatewayData && gatewayData.id) {
        savedGateway = await PaymentGateway.update(gatewayData.id, formData);
      } else {
        savedGateway = await PaymentGateway.create(formData);
      }
      
      if (onSave) onSave(savedGateway);
    } catch (error) {
      console.error("Erro ao salvar gateway de pagamento:", error);
      setFormErrors({
        general: "Ocorreu um erro ao salvar o gateway. Por favor, tente novamente."
      });
    } finally {
      setSaveLoading(false);
    }
  };

  const getProviderSpecificFields = () => {
    if (!selectedGatewayInfo) return null;
    
    switch (formData.provider) {
      case "stripe":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="webhook_secret">Webhook Secret</Label>
              <Input
                id="webhook_secret"
                value={formData.webhook_secret || ""}
                onChange={(e) => handleInputChange("webhook_secret", e.target.value)}
                placeholder="whsec_..."
              />
              <p className="text-xs text-gray-500">Chave secreta para validar webhooks do Stripe</p>
            </div>
          </>
        );
        
      case "paypal":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="client_id">Client ID</Label>
              <Input
                id="client_id"
                value={formData.additional_settings?.client_id || ""}
                onChange={(e) => handleAdditionalSettingChange("client_id", e.target.value)}
                placeholder="Insira o Client ID do PayPal"
                className={formErrors.client_id ? "border-red-500" : ""}
              />
              {formErrors.client_id && <p className="text-xs text-red-500">{formErrors.client_id}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="client_secret">Client Secret</Label>
              <Input
                id="client_secret"
                type="password"
                value={formData.additional_settings?.client_secret || ""}
                onChange={(e) => handleAdditionalSettingChange("client_secret", e.target.value)}
                placeholder="Insira o Client Secret do PayPal"
                className={formErrors.client_secret ? "border-red-500" : ""}
              />
              {formErrors.client_secret && <p className="text-xs text-red-500">{formErrors.client_secret}</p>}
            </div>
          </>
        );
        
      // Implementação para outros gateways omitida por brevidade
        
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-blue-600" />
          {gatewayData ? "Editar Gateway de Pagamento" : "Novo Gateway de Pagamento"}
        </CardTitle>
        <CardDescription>
          Configure a integração com gateways de pagamento para processamento de faturas.
        </CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mx-6 mb-4">
            <TabsTrigger value="general">Geral</TabsTrigger>
            <TabsTrigger value="config">Configuração</TabsTrigger>
            <TabsTrigger value="advanced">Avançado</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general">
            <CardContent className="space-y-6">
              {formErrors.general && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{formErrors.general}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Gateway</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Ex: Stripe Produção, PayPal Teste"
                  className={formErrors.name ? "border-red-500" : ""}
                />
                {formErrors.name && <p className="text-xs text-red-500">{formErrors.name}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="provider">Provedor</Label>
                <Select
                  value={formData.provider}
                  onValueChange={(value) => {
                    updateFeatures(value);
                  }}
                >
                  <SelectTrigger id="provider" className={formErrors.provider ? "border-red-500" : ""}>
                    <SelectValue placeholder="Selecione o provedor" />
                  </SelectTrigger>
                  <SelectContent>
                    {gatewayProviders.map((provider) => (
                      <SelectItem key={provider.value} value={provider.value}>
                        <div className="flex items-center gap-2">
                          {provider.icon && (
                            <img src={provider.icon} alt={provider.label} className="w-4 h-4 object-contain" />
                          )}
                          {provider.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.provider && <p className="text-xs text-red-500">{formErrors.provider}</p>}
              </div>
              
              {selectedGatewayInfo && (
                <div className="rounded-md bg-blue-50 p-3 flex gap-3 items-start">
                  {selectedGatewayInfo.icon && (
                    <img src={selectedGatewayInfo.icon} alt={selectedGatewayInfo.label} className="w-10 h-10 object-contain" />
                  )}
                  <div>
                    <h3 className="font-medium text-blue-800">{selectedGatewayInfo.label}</h3>
                    <p className="text-sm text-blue-600">{selectedGatewayInfo.description}</p>
                    {selectedGatewayInfo.learnMoreUrl && (
                      <a 
                        href={selectedGatewayInfo.learnMoreUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-blue-700 flex items-center gap-1 mt-1 hover:underline"
                      >
                        Saiba mais sobre esse gateway
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
              )}
              
              <div className="border-t pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="is_active">Status</Label>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="is_active"
                        checked={formData.is_active}
                        onCheckedChange={(checked) => handleInputChange("is_active", checked)}
                      />
                      <Label htmlFor="is_active">
                        {formData.is_active ? "Ativo" : "Inativo"}
                      </Label>
                    </div>
                    <p className="text-xs text-gray-500">
                      Gateway de pagamento {formData.is_active ? "disponível" : "não disponível"} para novos pagamentos
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="sandbox_mode">Modo de Teste</Label>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="sandbox_mode"
                        checked={formData.sandbox_mode}
                        onCheckedChange={(checked) => handleInputChange("sandbox_mode", checked)}
                      />
                      <Label htmlFor="sandbox_mode">
                        {formData.sandbox_mode ? "Modo Sandbox" : "Modo Produção"}
                      </Label>
                    </div>
                    <p className="text-xs text-gray-500">
                      {formData.sandbox_mode 
                        ? "Transações em ambiente de teste, sem cobranças reais" 
                        : "Ambiente de produção, transações reais serão processadas"}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Métodos de pagamento */}
              <div className="border-t pt-4">
                <Label className="block mb-3">Métodos de Pagamento Suportados</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="supports_credit_card"
                      checked={formData.supports_credit_card}
                      onCheckedChange={(checked) => handleInputChange("supports_credit_card", checked)}
                    />
                    <Label htmlFor="supports_credit_card">Cartão de Crédito</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="supports_debit_card"
                      checked={formData.supports_debit_card}
                      onCheckedChange={(checked) => handleInputChange("supports_debit_card", checked)}
                    />
                    <Label htmlFor="supports_debit_card">Cartão de Débito</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="supports_bank_slip"
                      checked={formData.supports_bank_slip}
                      onCheckedChange={(checked) => handleInputChange("supports_bank_slip", checked)}
                    />
                    <Label htmlFor="supports_bank_slip">Boleto Bancário</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="supports_pix"
                      checked={formData.supports_pix}
                      onCheckedChange={(checked) => handleInputChange("supports_pix", checked)}
                    />
                    <Label htmlFor="supports_pix">PIX</Label>
                  </div>
                </div>
              </div>
              
              {/* Pagamentos recorrentes */}
              <div className="border-t pt-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="supports_recurring"
                    checked={formData.supports_recurring}
                    onCheckedChange={(checked) => handleInputChange("supports_recurring", checked)}
                  />
                  <Label htmlFor="supports_recurring">Suporta Pagamentos Recorrentes</Label>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Habilite para permitir cobranças automáticas mensais
                </p>
              </div>
            </CardContent>
          </TabsContent>
          
          <TabsContent value="config">
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="api_key">API Key</Label>
                <Input
                  id="api_key"
                  value={formData.api_key}
                  onChange={(e) => handleInputChange("api_key", e.target.value)}
                  placeholder="Chave de API do gateway"
                  className={formErrors.api_key ? "border-red-500" : ""}
                />
                {formErrors.api_key && <p className="text-xs text-red-500">{formErrors.api_key}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="api_secret">API Secret</Label>
                <Input
                  id="api_secret"
                  type="password"
                  value={formData.api_secret}
                  onChange={(e) => handleInputChange("api_secret", e.target.value)}
                  placeholder="Chave secreta de API"
                  className={formErrors.api_secret ? "border-red-500" : ""}
                />
                {formErrors.api_secret && <p className="text-xs text-red-500">{formErrors.api_secret}</p>}
              </div>
              
              {getProviderSpecificFields()}
              
              <div className="space-y-2">
                <Label htmlFor="webhook_url">URL de Webhook</Label>
                <Input
                  id="webhook_url"
                  value={formData.webhook_url}
                  onChange={(e) => handleInputChange("webhook_url", e.target.value)}
                  placeholder="https://seu-dominio.com/api/webhook/payments"
                />
                <p className="text-xs text-gray-500">URL para receber notificações de pagamento</p>
              </div>
            </CardContent>
          </TabsContent>
          
          <TabsContent value="advanced">
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="checkout_type">Tipo de Checkout</Label>
                <Select
                  value={formData.checkout_type}
                  onValueChange={(value) => handleInputChange("checkout_type", value)}
                >
                  <SelectTrigger id="checkout_type">
                    <SelectValue placeholder="Selecione o tipo de checkout" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="redirect">Redirecionamento</SelectItem>
                    <SelectItem value="iframe">Iframe</SelectItem>
                    <SelectItem value="direct">Direto (na página)</SelectItem>
                    <SelectItem value="api_only">Apenas API</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">Como o cliente interagirá com o checkout de pagamento</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="payment_fee">Taxa do Gateway (%)</Label>
                <Input
                  id="payment_fee"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.payment_fee}
                  onChange={(e) => handleInputChange("payment_fee", parseFloat(e.target.value))}
                  placeholder="0.00"
                />
                <p className="text-xs text-gray-500">
                  Taxa percentual cobrada pelo gateway. Usado para cálculos financeiros.
                </p>
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
                Salvar Gateway
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}