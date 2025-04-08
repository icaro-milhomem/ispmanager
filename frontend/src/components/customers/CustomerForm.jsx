import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Card, 
  CardContent, 
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, UserPlus, Loader2, Search } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Customer, Plan } from "@/api/entities";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { customerSchema } from "@/lib/validations/customer";
import { formatForInput } from "@/lib/utils";

export default function CustomerForm({ 
  customer, 
  onSubmit, 
  onCancel,
  initialData
}) {
  const form = useForm({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: customer?.name || initialData?.name || "",
      email: customer?.email || initialData?.email || "",
      document_type: customer?.document_type || initialData?.document_type || "CPF",
      document: customer?.document || initialData?.document || "",
      phone: customer?.phone || initialData?.phone || "",
      contract_number: customer?.contract_number || initialData?.contract_number || "",
      installation_address: {
        street: customer?.installation_address?.street || initialData?.installation_address?.street || "",
        number: customer?.installation_address?.number || initialData?.installation_address?.number || "",
        complement: customer?.installation_address?.complement || initialData?.installation_address?.complement || "",
        neighborhood: customer?.installation_address?.neighborhood || initialData?.installation_address?.neighborhood || "",
        city: customer?.installation_address?.city || initialData?.installation_address?.city || "",
        state: customer?.installation_address?.state || initialData?.installation_address?.state || "",
        postal_code: customer?.installation_address?.postal_code || initialData?.installation_address?.postal_code || "",
      },
      billing_address_same: customer ? customer.billing_address_same : true,
      billing_address: {
        street: customer?.billing_address?.street || "",
        number: customer?.billing_address?.number || "",
        complement: customer?.billing_address?.complement || "",
        neighborhood: customer?.billing_address?.neighborhood || "",
        city: customer?.billing_address?.city || "",
        state: customer?.billing_address?.state || "",
        postal_code: customer?.billing_address?.postal_code || "",
      },
      plan_id: customer?.plan_id || initialData?.plan_id || "",
      installation_fee: customer?.installation_fee || initialData?.installation_fee || 0,
      due_day: customer?.due_day || initialData?.due_day || 10,
      payment_method: customer?.payment_method || initialData?.payment_method || "BANK_SLIP",
      status: customer?.status || initialData?.status || "PENDING",
      notes: customer?.notes || initialData?.notes || "",
      coordinates: {
        latitude: customer?.coordinates?.latitude || initialData?.coordinates?.latitude || null,
        longitude: customer?.coordinates?.longitude || initialData?.coordinates?.longitude || null,
      },
      bandwidth_limit: {
        download: customer?.bandwidth_limit?.download || initialData?.bandwidth_limit?.download || 100,
        upload: customer?.bandwidth_limit?.upload || initialData?.bandwidth_limit?.upload || 50,
      },
    },
  });

  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMap, setLoadingMap] = useState(false);
  const [coordinates, setCoordinates] = useState({ latitude: null, longitude: null });
  const [addressQuery, setAddressQuery] = useState('');
  const [showAddressSearch, setShowAddressSearch] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const loadPlans = async () => {
      try {
        const plansList = await Plan.list();
        setPlans(plansList);
      } catch (error) {
        console.error("Erro ao carregar planos:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os planos disponíveis",
          variant: "destructive",
        });
      }
    };

    const loadCustomerData = async () => {
      if (customer) {
        setLoading(true);
        try {
          setCustomerData(customer);
          
          form.reset({
            ...customer,
            plan_id: customer.plan_id || "",
            installation_fee: customer.installation_fee || 0,
            due_day: customer.due_day || 10,
          });
        } catch (error) {
          console.error("Erro ao carregar dados do cliente:", error);
          toast({
            title: "Erro",
            description: "Não foi possível carregar os dados do cliente",
            variant: "destructive",
          });
        } finally {
          setLoading(false);
        }
      } else if (initialData) {
        console.log("Usando dados iniciais:", initialData);
        form.reset({
          ...form.getValues(),
          ...initialData,
        });
        
        const contractField = document.getElementById("contract_number");
        if (contractField && initialData.contract_number) {
          contractField.value = initialData.contract_number;
        }
      }
    };

    loadPlans();
    loadCustomerData();
  }, [customer, form, initialData]);

  const handleChange = (field, value) => {
    form.reset(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedChange = (parent, field, value) => {
    form.reset(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
  };

  const handleCEPSearch = async (cep) => {
    if (!cep || cep.length !== 8) return;

    setLoadingMap(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();
      
      if (!data.erro) {
        form.reset(prev => ({
          ...prev,
          installation_address: {
            ...prev.installation_address,
            street: data.logradouro,
            neighborhood: data.bairro,
            city: data.localidade,
            state: data.uf
          },
          coordinates: {
            latitude: data.latitude,
            longitude: data.longitude
          }
        }));
        setCoordinates(data.coordinates);
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
    } finally {
      setLoadingMap(false);
    }
  };

  const generateContractNumber = async () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const baseNumber = `${year}${month}`;
    
    try {
      const customers = await Customer.list();
      const contractNumbers = customers
        .map(c => c.contract_number)
        .filter(num => num && num.startsWith(baseNumber))
        .map(num => parseInt(num.split('-')[1] || 0));

      let sequence = 1;
      if (contractNumbers.length > 0) {
        sequence = Math.max(...contractNumbers) + 1;
      }

      return `${baseNumber}-${String(sequence).padStart(4, '0')}`;
    } catch (error) {
      console.error('Erro ao gerar número do contrato:', error);
      return `${baseNumber}-0001`;
    }
  };

  const handleSubmit = async (data) => {
    try {
      setLoading(true);
      
      const dataToSubmit = {
        ...data,
      };
      
      if (!customer && !dataToSubmit.contract_number) {
        dataToSubmit.contract_number = await generateContractNumber();
      }
      
      await onSubmit(dataToSubmit);
      
      form.reset();
    } catch (error) {
      console.error("Erro ao salvar cliente:", error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível salvar o cliente",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>
          <div className="flex items-center">
            <UserPlus className="mr-2 h-5 w-5 text-blue-600" />
            {customer ? `Editar Cliente: ${customer.name}` : "Novo Cliente"}
          </div>
        </CardTitle>
      </CardHeader>
      
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 bg-white p-6 rounded-lg shadow-md">
        <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
          <CardContent className="space-y-4">
            <Tabs value={form.watch('plan_id')} onValueChange={(value) => handleChange('plan_id', value)}>
              <TabsList className="mb-4">
                <TabsTrigger value="personal">Dados Pessoais</TabsTrigger>
                <TabsTrigger value="address">Endereço</TabsTrigger>
                <TabsTrigger value="connection">Conexão</TabsTrigger>
                <TabsTrigger value="billing">Faturamento</TabsTrigger>
              </TabsList>
              
              <TabsContent value="personal" className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <div className="text-sm font-medium mb-1.5">Nome Completo *</div>
                    <Input
                      placeholder="Digite o nome completo"
                      {...form.register('name')}
                      required
                    />
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium mb-1.5">Número do Contrato {customer ? '' : '(Gerado automaticamente)'}</div>
                    <Input
                      placeholder="Número do contrato"
                      {...form.register('contract_number')}
                      disabled={!customer}
                      readOnly={!customer}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm font-medium mb-1.5">Tipo de Documento *</div>
                      <Select
                        {...form.register('document_type')}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CPF">CPF</SelectItem>
                          <SelectItem value="CNPJ">CNPJ</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <div className="text-sm font-medium mb-1.5">
                        {form.watch('document_type') === 'CPF' ? 'CPF' : 'CNPJ'} *
                      </div>
                      <Input
                        placeholder={form.watch('document_type') === "CPF" ? "000.000.000-00" : "00.000.000/0001-00"}
                        {...form.register('document')}
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium mb-1.5">Email *</div>
                    <Input
                      type="email"
                      placeholder="email@exemplo.com"
                      {...form.register('email')}
                      required
                    />
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium mb-1.5">Telefone Principal *</div>
                    <Input
                      placeholder="(00) 00000-0000"
                      {...form.register('phone')}
                      required
                    />
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium mb-1.5">WhatsApp</div>
                    <Input
                      placeholder="(00) 00000-0000"
                      {...form.register('whatsapp')}
                    />
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium mb-1.5">Status</div>
                    <Select
                      {...form.register('status')}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ACTIVE">Ativo</SelectItem>
                        <SelectItem value="PENDING">Pendente</SelectItem>
                        <SelectItem value="SUSPENDED">Suspenso</SelectItem>
                        <SelectItem value="INACTIVE">Inativo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="address" className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <div className="text-sm font-medium mb-1.5">CEP *</div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="00000-000"
                        {...form.register('installation_address.postal_code')}
                        onChange={(e) => {
                          const cep = e.target.value.replace(/\D/g, '');
                          handleChange('installation_address.postal_code', cep);
                          if (cep.length === 8) handleCEPSearch(cep);
                        }}
                        maxLength="8"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleCEPSearch(form.watch('installation_address.postal_code').replace(/\D/g, ''))}
                        disabled={loadingMap}
                      >
                        {loadingMap ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Search className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <div className="text-sm font-medium mb-1.5">Endereço *</div>
                    <Input
                      placeholder="Nome da rua, avenida, etc"
                      {...form.register('installation_address.street')}
                      required
                    />
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium mb-1.5">Número *</div>
                    <Input
                      placeholder="123"
                      {...form.register('installation_address.number')}
                      required
                    />
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium mb-1.5">Complemento</div>
                    <Input
                      placeholder="Apto, Sala, etc."
                      {...form.register('installation_address.complement')}
                    />
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium mb-1.5">Bairro</div>
                    <Input
                      placeholder="Nome do bairro"
                      {...form.register('installation_address.neighborhood')}
                    />
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium mb-1.5">Cidade</div>
                    <Input
                      placeholder="Nome da cidade"
                      {...form.register('installation_address.city')}
                    />
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium mb-1.5">Estado</div>
                    <Input
                      placeholder="UF"
                      {...form.register('installation_address.state')}
                    />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="connection" className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <div className="text-sm font-medium mb-1.5">Data de Instalação</div>
                    <Input
                      type="date"
                      {...form.register('installation_date')}
                    />
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium mb-1.5">Plano Contratado</div>
                    <Select
                      {...form.register('plan_id')}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o plano" />
                      </SelectTrigger>
                      <SelectContent>
                        {plans.length > 0 ? (
                          plans.map(plan => (
                            <SelectItem key={plan.id} value={plan.id}>
                              {plan.name} - R$ {plan.price.toFixed(2)} ({plan.download}/{plan.upload} Mbps)
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="" disabled>Carregando planos...</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium mb-1.5">Usuário PPPoE</div>
                    <Input
                      placeholder="Usuário para conexão"
                      {...form.register('pppoe_username')}
                    />
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium mb-1.5">Senha PPPoE</div>
                    <Input
                      placeholder="Senha para conexão"
                      type="password"
                      {...form.register('pppoe_password')}
                    />
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium mb-1.5">IP Fixo</div>
                    <Input
                      placeholder="Ex: 192.168.1.100"
                      {...form.register('ip_address')}
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <div className="text-sm font-medium mb-1.5">Limite de Banda</div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm font-medium mb-1.5">Download (Mbps)</div>
                        <Input
                          type="number"
                          {...form.register('bandwidth_limit.download')}
                        />
                      </div>
                      <div>
                        <div className="text-sm font-medium mb-1.5">Upload (Mbps)</div>
                        <Input
                          type="number"
                          {...form.register('bandwidth_limit.upload')}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="billing" className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <div className="text-sm font-medium mb-1.5">Dia de Vencimento</div>
                    <Input
                      type="number"
                      min="1"
                      max="28"
                      {...form.register('due_day')}
                    />
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium mb-1.5">Método de Pagamento</div>
                    <Select
                      {...form.register('payment_method')}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o método" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BANK_SLIP">Boleto Bancário</SelectItem>
                        <SelectItem value="CREDIT_CARD">Cartão de Crédito</SelectItem>
                        <SelectItem value="PIX">PIX</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </div>
        
        <CardFooter className="flex justify-between border-t p-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            Cancelar
          </Button>
          <Button 
            type="submit" 
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Salvar Cliente
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
