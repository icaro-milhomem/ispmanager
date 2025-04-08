
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/components/ui/use-toast";
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { format, addMonths } from "date-fns";
import { pt } from "date-fns/locale";
import { 
  CalendarIcon, 
  Receipt, 
  CreditCard, 
  BanknoteIcon, 
  QrCode, 
  FileText,
  AlertTriangle,
  Landmark,
  PlusCircle,
  Minus,
  AlertCircle,
  Loader2
} from "lucide-react";

const bankingInstitutions = [
  { id: "default", name: "Banco Padrão" },
  { id: "001", name: "Banco do Brasil" },
  { id: "033", name: "Santander" },
  { id: "104", name: "Caixa Econômica Federal" },
  { id: "237", name: "Bradesco" },
  { id: "341", name: "Itaú" },
  { id: "756", name: "Sicoob" },
  { id: "748", name: "Sicredi" }
];

export default function InvoiceForm({ invoice, customers, onSubmit, onCancel }) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("basic");
  
  const initialFormData = {
    customer_id: invoice?.customer_id || "",
    amount: invoice?.amount || "",
    due_date: invoice?.due_date || new Date().toISOString().split("T")[0],
    status: invoice?.status || "pending",
    payment_method: invoice?.payment_method || "bank_slip",
    payment_date: invoice?.payment_date || "",
    invoice_url: invoice?.invoice_url || "",
    installments: invoice?.installments || 1,
    billing_type: invoice?.billing_type || "single",
    payment_gateway: invoice?.payment_gateway || "default",
    register_title: invoice?.register_title || false,
    generate_nf: invoice?.generate_nf || false,
    installment_dates: invoice?.installment_dates || [],
    processing_fee: invoice?.processing_fee || 0,
    discount: invoice?.discount || 0,
    apply_interest: invoice?.apply_interest || false,
    interest_rate: invoice?.interest_rate || 2.0,
    apply_fine: invoice?.apply_fine || false,
    fine_rate: invoice?.fine_rate || 2.0,
    grace_period: invoice?.grace_period || 0,
    nf_tax_code: invoice?.nf_tax_code || "",
    nf_description: invoice?.nf_description || "",
    banking_institution: invoice?.banking_institution || "default",
    notification_email: invoice?.notification_email ?? true,
    notification_sms: invoice?.notification_sms || false,
    comments: invoice?.comments || ""
  };

  const [formData, setFormData] = useState(initialFormData);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerPlans, setCustomerPlans] = useState([]);
  const [planDetails, setPlanDetails] = useState(null);
  const [totalAmount, setTotalAmount] = useState(formData.amount || 0);
  const [installmentPreview, setInstallmentPreview] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (formData.billing_type === "installment_plan" && 
        formData.installments > 0 && 
        formData.amount && 
        formData.due_date) {
      generateInstallmentPreview();
    }
  }, [formData.billing_type, formData.installments, formData.amount, formData.due_date]);

  useEffect(() => {
    if (formData.customer_id) {
      loadCustomerData(formData.customer_id);
    }
  }, [formData.customer_id]);

  const loadCustomerData = async (customerId) => {
    if (!customerId) return;
    
    setIsLoading(true);
    try {
      const customer = customers?.find(c => c.id === customerId);
      setSelectedCustomer(customer);

      if (customer) {
        if (customer.preferred_banking) {
          handleChange("banking_institution", customer.preferred_banking);
        }
        if (customer.plan) {
          await loadPlanDetails(customer.plan);
        }
      }
    } catch (error) {
      console.error("Erro ao carregar dados do cliente:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadPlanDetails = async (planCode) => {
    if (!planCode) return;
    
    try {
      const mockPlans = {
        basic: { name: "Básico", monthly_price: 79.90 },
        standard: { name: "Padrão", monthly_price: 99.90 },
        premium: { name: "Premium", monthly_price: 129.90 },
        enterprise: { name: "Empresarial", monthly_price: 199.90 }
      };
      
      setPlanDetails(mockPlans[planCode] || { name: "Plano Desconhecido", monthly_price: 0 });
      handleChange("amount", mockPlans[planCode]?.monthly_price || 0);

    } catch (error) {
      console.error("Erro ao carregar detalhes do plano:", error);
    }
  };

  const handleChange = (field, value) => {
    const safeValue = value ?? "";
    
    setFormData(prev => ({
      ...prev,
      [field]: safeValue
    }));
    
    if (field === 'amount' || field === 'processing_fee' || field === 'discount') {
      calculateTotalAmount({...formData, [field]: safeValue});
    }
  };

  const calculateTotalAmount = (data) => {
    const baseAmount = parseFloat(data.amount) || 0;
    const processingFee = parseFloat(data.processing_fee) || 0;
    const discount = parseFloat(data.discount) || 0;
    
    const total = baseAmount + processingFee - discount;
    setTotalAmount(total > 0 ? total : 0);
  };

  const generateInstallmentPreview = () => {
    if (!formData.amount || !formData.installments || !formData.due_date) return;
    
    const installments = parseInt(formData.installments) || 1;
    const baseAmount = parseFloat(formData.amount) || 0;
    const dueDate = formData.due_date ? new Date(formData.due_date) : new Date();
    
    const baseInstallmentValue = baseAmount / installments;
    
    const preview = [];
    for (let i = 0; i < installments; i++) {
      const installmentDate = addMonths(dueDate, i);
      const formattedDate = format(installmentDate, 'yyyy-MM-dd');
      
      preview.push({
        number: i + 1,
        amount: parseFloat(baseInstallmentValue.toFixed(2)),
        due_date: formattedDate,
      });
    }
    
    setInstallmentPreview(preview);
    setFormData(prev => ({
      ...prev,
      installment_dates: preview
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.customer_id || !formData.amount || !formData.due_date) {
      toast({
        title: "Erro de validação",
        description: "Por favor, preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }
    
    let submitData = {...formData};
    
    if (submitData.billing_type === "installment_plan") {
      submitData.installment_data = installmentPreview;
    }
    
    onSubmit(submitData);
  };

  const handleGenerateInvoices = () => {
    toast({
      title: "Faturas geradas",
      description: "Faturas foram geradas com sucesso!",
      variant: "success"
    });
  };

  const handleGenerateInstallmentPlans = () => {
    toast({
      title: "Carnês gerados",
      description: "Carnês foram gerados com sucesso!",
      variant: "success"
    });
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>
          {invoice ? "Editar Fatura" : "Nova Fatura"}
        </CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mx-6">
            <TabsTrigger value="basic">Dados Básicos</TabsTrigger>
            <TabsTrigger value="payment">Pagamento</TabsTrigger>
            <TabsTrigger value="fiscalization">Fiscalização</TabsTrigger>
            <TabsTrigger value="notification">Notificações</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic" className="space-y-6 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="customer_id">Cliente</Label>
                <Select
                  value={formData.customer_id}
                  onValueChange={(value) => handleChange("customer_id", value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {selectedCustomer && planDetails && (
                <div className="space-y-2">
                  <Label>Plano Contratado</Label>
                  <div className="p-3 border rounded-md bg-blue-50 flex justify-between items-center">
                    <div>
                      <div className="font-medium text-blue-800">{planDetails.name}</div>
                      <div className="text-sm text-blue-600">
                        Valor mensal: R$ {typeof planDetails.monthly_price === 'number' ? planDetails.monthly_price.toFixed(2) : planDetails.monthly_price}
                      </div>
                    </div>
                    {selectedCustomer.status === 'active' && (
                      <Badge className="bg-green-100 text-green-800">Cliente Ativo</Badge>
                    )}
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="billing_type">Tipo de Cobrança</Label>
                <RadioGroup 
                  value={formData.billing_type} 
                  onValueChange={(value) => handleChange("billing_type", value)}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="single" id="option-single" />
                    <Label htmlFor="option-single" className="font-normal cursor-pointer">
                      Título Avulso
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="installment_plan" id="option-installments" />
                    <Label htmlFor="option-installments" className="font-normal cursor-pointer">
                      Carnê de Parcelas
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="amount">Valor Base (R$)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => handleChange("amount", parseFloat(e.target.value))}
                  required
                />
                {selectedCustomer && planDetails && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    className="mt-1 text-xs"
                    onClick={() => handleChange("amount", planDetails.monthly_price)}
                  >
                    Usar valor do plano (R$ {planDetails.monthly_price.toFixed(2)})
                  </Button>
                )}
              </div>
              
              {formData.billing_type === "installment_plan" && (
                <div className="space-y-2">
                  <Label htmlFor="installments">Número de Parcelas</Label>
                  <Select
                    value={formData.installments.toString()}
                    onValueChange={(value) => handleChange("installments", parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} {num === 1 ? 'parcela' : 'parcelas'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="due_date">Data de Vencimento</Label>
                <div className="relative">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.due_date ? 
                          format(new Date(formData.due_date), "dd/MM/yyyy") : 
                          "Selecione uma data"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.due_date ? new Date(formData.due_date) : undefined}
                        onSelect={(date) => date && handleChange("due_date", format(date, "yyyy-MM-dd"))}
                        locale={pt}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="processing_fee">Taxa de Processamento (R$)</Label>
                <Input
                  id="processing_fee"
                  type="number"
                  step="0.01"
                  value={formData.processing_fee}
                  onChange={(e) => handleChange("processing_fee", parseFloat(e.target.value))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="discount">Desconto (R$)</Label>
                <Input
                  id="discount"
                  type="number"
                  step="0.01"
                  value={formData.discount}
                  onChange={(e) => handleChange("discount", parseFloat(e.target.value))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleChange("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="paid">Pago</SelectItem>
                    <SelectItem value="overdue">Vencido</SelectItem>
                    <SelectItem value="cancelled">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="payment_date">Data de Pagamento</Label>
                <div className="relative">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={`w-full justify-start text-left ${formData.status !== 'paid' ? 'opacity-50' : ''}`}
                        disabled={formData.status !== 'paid'}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.payment_date ? 
                          format(new Date(formData.payment_date), "dd/MM/yyyy") : 
                          "Selecione uma data"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.payment_date ? new Date(formData.payment_date) : undefined}
                        onSelect={(date) => date && handleChange("payment_date", format(date, "yyyy-MM-dd"))}
                        disabled={formData.status !== 'paid'}
                        locale={pt}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="comments">Observações</Label>
                <Input
                  id="comments"
                  value={formData.comments || ""}
                  onChange={(e) => handleChange("comments", e.target.value)}
                  placeholder="Observações sobre esta fatura"
                />
              </div>
              
              {formData.billing_type === "installment_plan" && installmentPreview.length > 0 && (
                <div className="space-y-4 md:col-span-2 p-4 border rounded-md bg-gray-50">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-medium">Previsão de Parcelas</h3>
                    <span className="text-sm font-medium">
                      Total: R$ {totalAmount.toFixed(2)}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {installmentPreview.map((item) => (
                      <div key={item.number} className="p-2 border rounded-md bg-white text-sm">
                        <div className="flex justify-between">
                          <span className="font-medium">Parcela {item.number}/{formData.installments}</span>
                          <span>R$ {item.amount.toFixed(2)}</span>
                        </div>
                        <div className="text-gray-500 text-xs mt-1">
                          Vencimento: {format(new Date(item.due_date), "dd/MM/yyyy")}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-between mt-4">
              <Button variant="outline" onClick={handleGenerateInvoices}>
                Gerar Faturas
              </Button>
              <Button variant="outline" onClick={handleGenerateInstallmentPlans}>
                Gerar Carnês
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="payment" className="space-y-6 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="payment_method">Forma de Pagamento</Label>
                <Select
                  value={formData.payment_method}
                  onValueChange={(value) => handleChange("payment_method", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank_slip">
                      <div className="flex items-center">
                        <Receipt className="w-4 h-4 mr-2 text-blue-600" />
                        Boleto Bancário
                      </div>
                    </SelectItem>
                    <SelectItem value="credit_card">
                      <div className="flex items-center">
                        <CreditCard className="w-4 h-4 mr-2 text-purple-600" />
                        Cartão de Crédito
                      </div>
                    </SelectItem>
                    <SelectItem value="pix">
                      <div className="flex items-center">
                        <QrCode className="w-4 h-4 mr-2 text-green-600" />
                        PIX
                      </div>
                    </SelectItem>
                    <SelectItem value="cash">
                      <div className="flex items-center">
                        <BanknoteIcon className="w-4 h-4 mr-2 text-green-700" />
                        Dinheiro
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="banking_institution">Instituição Bancária</Label>
                <Select
                  value={formData.banking_institution}
                  onValueChange={(value) => handleChange("banking_institution", value)}
                  disabled={formData.payment_method !== "bank_slip"}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {bankingInstitutions.map((bank) => (
                      <SelectItem key={bank.id} value={bank.id}>
                        {bank.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {selectedCustomer && selectedCustomer.preferred_banking && selectedCustomer.preferred_banking !== "default" && (
                  <p className="text-xs text-blue-600 mt-1">
                    Banco preferencial do cliente: {bankingInstitutions.find(b => b.id === selectedCustomer.preferred_banking)?.name || selectedCustomer.preferred_banking}
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="grace_period">Dias de Carência</Label>
                <Select
                  value={formData.grace_period.toString()}
                  onValueChange={(value) => handleChange("grace_period", parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[0, 1, 2, 3, 5, 7, 10, 15, 30].map((days) => (
                      <SelectItem key={days} value={days.toString()}>
                        {days === 0 ? "Sem carência" : `${days} dias`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex flex-col gap-3 justify-between py-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="apply_interest" 
                    checked={formData.apply_interest}
                    onCheckedChange={(checked) => handleChange("apply_interest", checked)}
                  />
                  <Label htmlFor="apply_interest" className="font-normal cursor-pointer">
                    Aplicar juros por atraso
                  </Label>
                </div>
                
                {formData.apply_interest && (
                  <div className="pl-6">
                    <Label htmlFor="interest_rate" className="text-sm">Taxa de Juros (% a.m.)</Label>
                    <Input
                      id="interest_rate"
                      type="number"
                      step="0.1"
                      value={formData.interest_rate}
                      onChange={(e) => handleChange("interest_rate", parseFloat(e.target.value))}
                      className="mt-1"
                    />
                  </div>
                )}
              </div>
              
              <div className="flex flex-col gap-3 justify-between py-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="apply_fine" 
                    checked={formData.apply_fine}
                    onCheckedChange={(checked) => handleChange("apply_fine", checked)}
                  />
                  <Label htmlFor="apply_fine" className="font-normal cursor-pointer">
                    Aplicar multa por atraso
                  </Label>
                </div>
                
                {formData.apply_fine && (
                  <div className="pl-6">
                    <Label htmlFor="fine_rate" className="text-sm">Taxa de Multa (%)</Label>
                    <Input
                      id="fine_rate"
                      type="number"
                      step="0.1"
                      value={formData.fine_rate}
                      onChange={(e) => handleChange("fine_rate", parseFloat(e.target.value))}
                      className="mt-1"
                    />
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-2 md:col-span-2">
                <Checkbox 
                  id="register_title" 
                  checked={formData.register_title}
                  onCheckedChange={(checked) => handleChange("register_title", checked)}
                />
                <div>
                  <Label htmlFor="register_title" className="font-medium cursor-pointer">
                    Registrar Título Bancário
                  </Label>
                  <p className="text-sm text-gray-500">
                    Envia automaticamente para registro na instituição bancária selecionada
                  </p>
                </div>
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="invoice_url">URL do Boleto/Fatura</Label>
                <Input
                  id="invoice_url"
                  value={formData.invoice_url || ""}
                  onChange={(e) => handleChange("invoice_url", e.target.value)}
                  placeholder="https://..."
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="fiscalization" className="space-y-6 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2 flex items-start space-x-2">
                <Checkbox 
                  id="generate_nf" 
                  checked={formData.generate_nf}
                  onCheckedChange={(checked) => handleChange("generate_nf", checked)}
                />
                <div>
                  <Label htmlFor="generate_nf" className="font-medium cursor-pointer">
                    Gerar Nota Fiscal
                  </Label>
                  <p className="text-sm text-gray-500">
                    Gera e envia automaticamente a NF para a SEFAZ quando o pagamento for confirmado
                  </p>
                </div>
              </div>
              
              {formData.generate_nf && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="nf_type">Tipo de Nota Fiscal</Label>
                    <Select
                      value={formData.nf_type}
                      onValueChange={(value) => handleChange("nf_type", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="nfse">NFS-e (Serviços)</SelectItem>
                        <SelectItem value="nfe">NF-e (Produtos)</SelectItem>
                        <SelectItem value="nfce">NFC-e (Consumidor)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="nf_tax_code">Código de Serviço/NCM</Label>
                    <Input
                      id="nf_tax_code"
                      value={formData.nf_tax_code || ""}
                      onChange={(e) => handleChange("nf_tax_code", e.target.value)}
                      placeholder={formData.nf_type === "nfse" ? "Código LC 116" : "Código NCM"}
                    />
                  </div>
                  
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="nf_description">Descrição para Nota Fiscal</Label>
                    <Input
                      id="nf_description"
                      value={formData.nf_description || ""}
                      onChange={(e) => handleChange("nf_description", e.target.value)}
                      placeholder="Descrição detalhada do serviço ou produto"
                    />
                  </div>
                  
                  <div className="md:col-span-2 bg-yellow-50 border border-yellow-200 rounded-md p-4 flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-yellow-800 font-medium">
                        Atenção aos dados fiscais
                      </p>
                      <p className="text-sm text-yellow-700 mt-1">
                        Certifique-se que o cliente possui todos os dados fiscais preenchidos corretamente para emissão de NF.
                        A emissão automática depende de configurações adicionais no sistema.
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="notification" className="space-y-6 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="notification_email" 
                  checked={formData.notification_email}
                  onCheckedChange={(checked) => handleChange("notification_email", checked)}
                />
                <Label htmlFor="notification_email" className="font-normal cursor-pointer">
                  Enviar notificação por E-mail
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="notification_sms" 
                  checked={formData.notification_sms}
                  onCheckedChange={(checked) => handleChange("notification_sms", checked)}
                />
                <Label htmlFor="notification_sms" className="font-normal cursor-pointer">
                  Enviar notificação por SMS
                </Label>
              </div>
              
              <div className="md:col-span-2 bg-blue-50 border border-blue-200 rounded-md p-4 flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-blue-800 font-medium">
                    Automação de notificações
                  </p>
                  <p className="text-sm text-blue-700 mt-1">
                    As notificações serão enviadas automaticamente quando a fatura for gerada, 3 dias antes do vencimento e quando houver atraso.
                    Certifique-se que o cliente possua e-mail e telefone cadastrados corretamente.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <CardFooter className="flex justify-end gap-4 pt-6 border-t">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" className="bg-blue-600">
            {invoice ? "Salvar Alterações" : "Criar Fatura"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
