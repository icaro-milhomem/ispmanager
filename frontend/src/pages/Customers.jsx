import React, { useState, useEffect, useMemo } from "react";
import { Customer, Plan } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import {
  Plus,
  Search,
  UserCheck,
  UserX,
  AlertCircle,
  RefreshCcw,
  Loader2,
  Filter,
  Download
} from "lucide-react";
import CustomerForm from "../components/customers/CustomerForm";
import CustomerDetails from "../components/customers/CustomerDetails";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Calendar } from "@/components/ui/calendar";

const statusColors = {
  ACTIVE: "bg-green-100 text-green-800",
  INACTIVE: "bg-gray-100 text-gray-800",
  SUSPENDED: "bg-red-100 text-red-800",
  PENDING: "bg-yellow-100 text-yellow-800",
};

export default function CustomersPage() {
  const { toast } = useToast();
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: "all",
    city: "all",
    plan: "all"
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [customerDialogOpen, setCustomerDialogOpen] = useState(false);
  const [createMode, setCreateMode] = useState(false);
  const [plans, setPlans] = useState([]);
  const [initialCustomerData, setInitialCustomerData] = useState(null);

  useEffect(() => {
    loadCustomers();
    loadPlans();
  }, []);

  const loadCustomers = async () => {
    setIsLoading(true);
    try {
      const response = await Customer.list({ dashboard: true, limit: 100 });
      // Verificar se a resposta é um objeto com propriedade customers ou um array direto
      const customerData = Array.isArray(response) ? response : 
                          response.customers ? response.customers : [];
      
      console.log("Dados dos clientes carregados:", customerData);
      setCustomers(customerData);
    } catch (error) {
      console.error("Erro ao carregar clientes:", error);
      toast({
        title: "Erro ao carregar clientes",
        description: "Não foi possível obter a lista de clientes",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadPlans = async () => {
    try {
      const response = await Plan.list({ active: true });
      console.log("Planos carregados:", response);
      setPlans(response);
    } catch (error) {
      console.error("Erro ao carregar planos:", error);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filterCustomers = (customers) => {
    return customers.filter(customer => {
      // Filtro por status
      if (filters.status !== "all" && customer.status !== filters.status) {
        return false;
      }
      
      // Filtro por cidade
      if (filters.city !== "all" && customer.city !== filters.city) {
        return false;
      }
      
      // Filtro por plano
      if (filters.plan !== "all") {
        // Verifica se o plano é um objeto ou uma string
        if (typeof customer.plan === 'object' && customer.plan !== null) {
          if (customer.plan.id !== filters.plan) {
            return false;
          }
        } else if (customer.plan !== filters.plan) {
          return false;
        }
      }
      
      // Filtro por texto de pesquisa
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          customer.full_name?.toLowerCase().includes(searchLower) ||
          customer.document_number?.toLowerCase().includes(searchLower) ||
          customer.email?.toLowerCase().includes(searchLower) ||
          customer.phone?.toLowerCase().includes(searchLower) ||
          customer.address?.toLowerCase().includes(searchLower)
        );
      }
      
      return true;
    });
  };

  const filteredCustomers = useMemo(() => {
    return filterCustomers(customers);
  }, [customers, searchTerm, filters]);

  const activeCustomers = useMemo(() => {
    return filteredCustomers.filter(c => c.status === "ACTIVE");
  }, [filteredCustomers]);

  const pendingCustomers = useMemo(() => {
    return filteredCustomers.filter(c => c.status === "PENDING");
  }, [filteredCustomers]);

  const suspendedCustomers = useMemo(() => {
    return filteredCustomers.filter(c => c.status === "SUSPENDED");
  }, [filteredCustomers]);

  const inactiveCustomers = useMemo(() => {
    return filteredCustomers.filter(c => c.status === "INACTIVE");
  }, [filteredCustomers]);

  // Adicionar os clientes filtrados sem filtro de status
  const allCustomers = useMemo(() => {
    return filteredCustomers;
  }, [filteredCustomers]);

  const handleDeleteCustomer = async (customer) => {
    try {
      await Customer.delete(customer.id);
      setShowDeleteDialog(false);
      setSelectedCustomer(null);
      toast({
        title: "Cliente excluído",
        description: "O cliente foi excluído com sucesso"
      });
      loadCustomers();
    } catch (error) {
      console.error("Erro ao excluir cliente:", error);
      toast({
        title: "Erro ao excluir cliente",
        description: "Não foi possível excluir o cliente",
        variant: "destructive"
      });
    }
  };

  const handleSuspendCustomer = async (customer) => {
    try {
      await Customer.update(customer.id, {
        ...customer,
        status: "SUSPENDED"
      });
      toast({
        title: "Cliente suspenso",
        description: "O cliente foi suspenso com sucesso"
      });
      loadCustomers();
    } catch (error) {
      console.error("Erro ao suspender cliente:", error);
      toast({
        title: "Erro ao suspender cliente",
        description: "Não foi possível suspender o cliente",
        variant: "destructive"
      });
    }
  };

  const handleReactivateCustomer = async (customer) => {
    try {
      await Customer.update(customer.id, {
        ...customer,
        status: "ACTIVE"
      });
      toast({
        title: "Cliente reativado",
        description: "O cliente foi reativado com sucesso"
      });
      loadCustomers();
    } catch (error) {
      console.error("Erro ao reativar cliente:", error);
      toast({
        title: "Erro ao reativar cliente",
        description: "Não foi possível reativar o cliente",
        variant: "destructive"
      });
    }
  };

  const handleSubmit = async (customerData) => {
    setLoading(true);
    setError('');
    try {
      let savedCustomer;
      if (selectedCustomer) {
        savedCustomer = await Customer.update(selectedCustomer.id, customerData);
        toast({
          title: "Cliente atualizado",
          description: "Os dados do cliente foram atualizados com sucesso"
        });
      } else {
        // Já temos a geração do número de contrato no componente CustomerForm
        savedCustomer = await Customer.create(customerData);
        toast({
          title: "Cliente cadastrado",
          description: "O novo cliente foi cadastrado com sucesso"
        });
      }
      setShowForm(false);
      setSelectedCustomer(null);
      loadCustomers();
      return savedCustomer;
    } catch (error) {
      console.error("Erro ao salvar cliente:", error);
      setError(error.message || 'Erro ao salvar cliente.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (customer) => {
    setSelectedCustomer(customer);
    setShowForm(true);
    // Garantir que voltamos para a lista ao fechar o formulário
    setActiveTab("all");
  };

  const handleCustomerSelect = (customer) => {
    setSelectedCustomer(customer);
    setActiveTab("details");
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "ACTIVE":
        return <UserCheck className="w-4 h-4 text-green-600" />;
      case "SUSPENDED":
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      case "INACTIVE":
        return <UserX className="w-4 h-4 text-gray-600" />;
      default:
        return null;
    }
  };

  const getCities = () => {
    const citySet = new Set();
    customers.forEach(customer => {
      if (customer.city) {
        citySet.add(customer.city);
      }
    });
    return Array.from(citySet).sort();
  };

  const getPlans = () => {
    // Função corrigida para retornar apenas strings ou valores simples
    const planSet = new Set();
    customers.forEach(customer => {
      if (customer.plan) {
        // Se plan for um objeto, pegamos apenas o ID
        if (typeof customer.plan === 'object' && customer.plan !== null) {
          planSet.add(customer.plan.id);
        } else {
          // Se for uma string ou outro valor simples
          planSet.add(customer.plan);
        }
      }
    });
    
    return Array.from(planSet);
  };

  // Definição dos rótulos de planos
  const planLabels = {
    basic: "Básico",
    standard: "Padrão",
    premium: "Premium",
    business: "Empresarial"
  };

  // Mapeamento de IDs de planos para nomes legíveis
  const getPlanName = (planId) => {
    // Procurar nos planos carregados do backend
    const plan = plans.find(p => p.id === planId);
    if (plan) return plan.name;
    
    // Se não encontrar, verificar nos clientes que têm plano como objeto
    for (const customer of customers) {
      if (typeof customer.plan === 'object' && customer.plan !== null && customer.plan.id === planId) {
        return customer.plan.name;
      }
    }
    
    // Fallback para os planos fixos antigos
    return planLabels[planId] || planId || "Sem plano";
  };

  const exportToCSV = () => {
    // Preparar os dados para exportação
    const headers = [
      "Nome", "Documento", "Email", "Telefone", "Endereço", 
      "Cidade", "Estado", "Status", "Plano", "Data de Instalação"
    ];
    
    const csvData = filteredCustomers.map(customer => [
      customer.full_name,
      customer.document_number,
      customer.email,
      customer.phone,
      `${customer.address || ""}, ${customer.address_number || ""}, ${customer.neighborhood || ""}, ${customer.city || ""}, ${customer.state || ""}`,
      customer.city,
      customer.state,
      customer.status,
      customer.plan,
      customer.installation_date ? new Date(customer.installation_date).toLocaleDateString() : ""
    ]);
    
    // Adicionar cabeçalho
    csvData.unshift(headers);
    
    // Converter para CSV
    const csvContent = csvData.map(row => row.join(";")).join("\n");
    
    // Criar arquivo blob e iniciar download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `clientes_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCreateCustomer = async (formData) => {
    setLoading(true);
    setError('');
    try {
      // Verificar se planId está definido
      if (!formData.planId) {
        setError('Selecione um plano válido para o cliente');
        setLoading(false);
        return;
      }
      
      await Customer.create(formData);
      loadCustomers();
      setCustomerDialogOpen(false);
      setCreateMode(false);
      toast.success('Cliente criado com sucesso!');
    } catch (err) {
      console.error('Erro ao criar cliente:', err);
      setError(err.message || 'Erro ao criar cliente.');
    } finally {
      setLoading(false);
    }
  };

  // Função para gerar número de contrato
  const generateContractNumber = async () => {
    try {
      // Obter ano e mês atual para o número do contrato
      const now = new Date();
      const year = now.getFullYear();
      const month = (now.getMonth() + 1).toString().padStart(2, '0');
      
      // Base do número de contrato: CONT-YYYYMM
      const baseContractNumber = `CONT-${year}${month}`;
      
      // Buscar todos os clientes
      const allCustomers = await Customer.list();
      
      // Filtrar clientes com número de contrato do mês atual
      const currentMonthContracts = allCustomers.filter(c => 
        c.contract_number && c.contract_number.startsWith(baseContractNumber)
      );
      
      // Encontrar o maior número sequencial
      let maxSequence = 0;
      currentMonthContracts.forEach(c => {
        try {
          const parts = c.contract_number.split('-');
          if (parts.length === 3) {
            const sequence = parseInt(parts[2], 10);
            if (!isNaN(sequence) && sequence > maxSequence) {
              maxSequence = sequence;
            }
          }
        } catch (e) {
          console.error("Erro ao analisar número de contrato:", e);
        }
      });
      
      // Incrementar para o próximo número disponível
      const nextSequence = maxSequence + 1;
      
      // Formatar com zeros à esquerda (ex: 001, 012, 123)
      const sequenceFormatted = nextSequence.toString().padStart(3, '0');
      
      // Número de contrato completo
      return `${baseContractNumber}-${sequenceFormatted}`;
    } catch (error) {
      console.error("Erro ao gerar número de contrato:", error);
      toast({
        title: "Erro",
        description: "Não foi possível gerar um número de contrato automaticamente",
        variant: "destructive",
      });
      return "";
    }
  };

  // Função para criar um novo cliente
  const handleNewCustomer = async () => {
    try {
      setLoading(true);
      
      // Gerar número de contrato
      const contractNumber = await generateContractNumber();
      
      // Dados iniciais para o formulário
      const initialData = {
        contract_number: contractNumber,
        status: "PENDING",
        due_day: 10,
        payment_method: "BANK_SLIP",
      };
      
      setInitialCustomerData(initialData);
      setSelectedCustomer(null);
      setShowForm(true);
    } catch (error) {
      console.error("Erro ao preparar novo cliente:", error);
      toast({
        title: "Erro",
        description: "Não foi possível preparar o formulário de novo cliente",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestão de Clientes</h1>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={exportToCSV}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Exportar CSV
          </Button>
          <Button 
            onClick={handleNewCustomer} 
            className="bg-blue-600"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Plus className="w-4 h-4 mr-2" />
            )}
            Novo Cliente
          </Button>
        </div>
      </div>

      {showForm && (
        <CustomerForm
          customer={selectedCustomer}
          initialData={selectedCustomer ? null : initialCustomerData}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowForm(false);
            setSelectedCustomer(null);
            setInitialCustomerData(null);
          }}
        />
      )}

      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="flex flex-1 max-w-md items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, CPF, email, telefone..."
              type="search"
              className="pl-8"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          <Button 
            variant="outline" 
            size="icon"
            onClick={loadCustomers}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCcw className="h-4 w-4" />
            )}
          </Button>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select 
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
            >
              <option value="all">Todos os status</option>
              <option value="ACTIVE">Ativos</option>
              <option value="PENDING">Pendentes</option>
              <option value="SUSPENDED">Suspensos</option>
              <option value="INACTIVE">Inativos</option>
            </select>
          </div>
          
          <div className="flex items-center">
            <select 
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={filters.city}
              onChange={(e) => setFilters({...filters, city: e.target.value})}
            >
              <option value="all">Todas as cidades</option>
              {getCities().map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center">
            <select 
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={filters.plan}
              onChange={(e) => setFilters({...filters, plan: e.target.value})}
            >
              <option value="all">Todos os planos</option>
              {getPlans().map(plan => {
                // Garantir que plan é uma string, não um objeto
                const planId = typeof plan === 'object' ? plan.id : plan;
                return (
                  <option key={planId} value={planId}>
                    {getPlanName(planId)}
                  </option>
                );
              })}
            </select>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">
            Todos ({allCustomers.length})
          </TabsTrigger>
          <TabsTrigger value="active">
            Ativos ({activeCustomers.length})
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pendentes ({pendingCustomers.length})
          </TabsTrigger>
          <TabsTrigger value="suspended">
            Suspensos ({suspendedCustomers.length})
          </TabsTrigger>
          <TabsTrigger value="inactive">
            Inativos ({inactiveCustomers.length})
          </TabsTrigger>
          {selectedCustomer && <TabsTrigger value="details">Detalhes do Cliente</TabsTrigger>}
        </TabsList>

        <TabsContent value="all">
          <CustomersTable 
            customers={allCustomers}
            onSelect={handleCustomerSelect}
            onEdit={handleEdit}
            onDelete={(customer) => {
              setSelectedCustomer(customer);
              setShowDeleteDialog(true);
            }}
            statusColors={statusColors}
            getStatusIcon={getStatusIcon}
            planLabels={planLabels}
          />
        </TabsContent>

        <TabsContent value="active">
          <CustomersTable 
            customers={activeCustomers}
            onSelect={handleCustomerSelect}
            onEdit={handleEdit}
            onSuspend={(customer) => {
              setSelectedCustomer(customer);
              handleSuspendCustomer(customer);
            }}
            statusColors={statusColors}
            getStatusIcon={getStatusIcon}
            planLabels={planLabels}
          />
        </TabsContent>

        <TabsContent value="pending">
          <CustomersTable 
            customers={pendingCustomers}
            onSelect={handleCustomerSelect}
            onEdit={handleEdit}
            onDelete={(customer) => {
              setSelectedCustomer(customer);
              setShowDeleteDialog(true);
            }}
            statusColors={statusColors}
            getStatusIcon={getStatusIcon}
            planLabels={planLabels}
          />
        </TabsContent>

        <TabsContent value="suspended">
          <CustomersTable 
            customers={suspendedCustomers}
            onSelect={handleCustomerSelect}
            onEdit={handleEdit}
            onReactivate={(customer) => {
              setSelectedCustomer(customer);
              handleReactivateCustomer(customer);
            }}
            onDelete={(customer) => {
              setSelectedCustomer(customer);
              setShowDeleteDialog(true);
            }}
            statusColors={statusColors}
            getStatusIcon={getStatusIcon}
            planLabels={planLabels}
          />
        </TabsContent>

        <TabsContent value="inactive">
          <CustomersTable 
            customers={inactiveCustomers}
            onSelect={handleCustomerSelect}
            onEdit={handleEdit}
            onDelete={(customer) => {
              setSelectedCustomer(customer);
              setShowDeleteDialog(true);
            }}
            statusColors={statusColors}
            getStatusIcon={getStatusIcon}
            planLabels={planLabels}
          />
        </TabsContent>

        <TabsContent value="details">
          {selectedCustomer && (
            <CustomerDetails 
              customer={selectedCustomer} 
              onEdit={(customer) => {
                setSelectedCustomer(customer);
                setShowForm(true);
                setActiveTab("form");
              }}
              onDelete={selectedCustomer.status !== 'active' ? () => {
                setShowDeleteDialog(true);
              } : null}
              onBack={() => {
                setSelectedCustomer(null);
                setActiveTab("all");
              }}
            />
          )}
        </TabsContent>

        <TabsContent value="form">
          {showForm && (
            <CustomerForm
              customer={selectedCustomer}
              onSubmit={async (customerData) => {
                try {
                  // Garantir que temos os dados corretos
                  const dataToSubmit = {
                    ...customerData
                  };

                  console.log("Enviando dados para o servidor:", dataToSubmit);

                  if (selectedCustomer) {
                    const updatedCustomer = await Customer.update(selectedCustomer.id, dataToSubmit);
                    console.log("Cliente atualizado:", updatedCustomer);
                    toast({
                      title: "Cliente atualizado",
                      description: "Os dados do cliente foram atualizados com sucesso"
                    });
                  } else {
                    const newCustomer = await Customer.create(dataToSubmit);
                    console.log("Novo cliente criado:", newCustomer);
                    toast({
                      title: "Cliente cadastrado",
                      description: "O novo cliente foi cadastrado com sucesso"
                    });
                  }
                  setShowForm(false);
                  setSelectedCustomer(null);
                  setActiveTab("all");
                  await loadCustomers(); // Recarregar clientes para obter dados atualizados
                } catch (error) {
                  console.error("Erro ao salvar cliente:", error);
                  toast({
                    title: "Erro ao salvar cliente",
                    description: error.message || "Não foi possível salvar os dados do cliente",
                    variant: "destructive"
                  });
                }
              }}
              onCancel={() => {
                setShowForm(false);
                setSelectedCustomer(null);
                setActiveTab(selectedCustomer ? "details" : "all");
              }}
            />
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Cliente</DialogTitle>
            <DialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente o cliente e todos os seus dados relacionados.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedCustomer ? (
              <p className="text-red-600 font-medium">
                Tem certeza que deseja excluir o cliente: {selectedCustomer.full_name}?
              </p>
            ) : (
              <p className="text-red-600 font-medium">
                Erro: Cliente não encontrado
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteDialog(false);
                setSelectedCustomer(null);
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedCustomer && handleDeleteCustomer(selectedCustomer)}
              disabled={!selectedCustomer}
            >
              Excluir Permanentemente
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CustomersTable({ 
  customers, 
  onSelect,
  onEdit,
  onDelete,
  onSuspend,
  onReactivate,
  statusColors,
  getStatusIcon,
  planLabels
}) {
  const statusLabels = {
    ACTIVE: "Ativo",
    INACTIVE: "Inativo",
    SUSPENDED: "Suspenso",
    PENDING: "Pendente",
  };

  // Função para renderizar o nome do plano
  const renderPlanName = (customer) => {
    // Se o plano for um objeto, pegamos o nome diretamente
    if (customer.plan && typeof customer.plan === 'object') {
      return customer.plan.name;
    }
    
    // Se tiver planId e não tiver objeto plan, buscamos nos labels ou mostramos o ID
    if (customer.planId) {
      return planLabels[customer.planId] || customer.planId;
    }
    
    // Se não tiver nem plan nem planId
    return "Sem plano";
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Plano</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Cidade</TableHead>
            <TableHead>Contato</TableHead>
            <TableHead>Data de Instalação</TableHead>
            <TableHead className="w-[150px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-gray-500 py-6">
                Nenhum cliente encontrado
              </TableCell>
            </TableRow>
          ) : (
            customers.map((customer) => (
              <TableRow
                key={customer.id}
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => onSelect(customer)}
              >
                <TableCell>
                  <div className="font-medium">{customer.full_name}</div>
                  <div className="text-sm text-gray-500">
                    {customer.document_number}
                    {customer.contract_number && (
                      <span className="ml-2 text-blue-500">Contrato: {customer.contract_number}</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {renderPlanName(customer)}
                </TableCell>
                <TableCell>
                  <Badge
                    className={statusColors[customer.status]}
                    variant="secondary"
                  >
                    <span className="flex items-center gap-1">
                      {getStatusIcon(customer.status)}
                      {statusLabels[customer.status]}
                    </span>
                  </Badge>
                </TableCell>
                <TableCell>{customer.city}</TableCell>
                <TableCell>
                  <div>{customer.phone}</div>
                  <div className="text-sm text-gray-500">
                    {customer.email}
                  </div>
                </TableCell>
                <TableCell>
                  {customer.installation_date && 
                    new Date(customer.installation_date).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-blue-600 w-full justify-start"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(customer);
                      }}
                    >
                      Editar
                    </Button>
                    
                    {onSuspend && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-amber-600 w-full justify-start"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSuspend(customer);
                        }}
                      >
                        Suspender
                      </Button>
                    )}
                    
                    {onReactivate && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-green-600 w-full justify-start"
                        onClick={(e) => {
                          e.stopPropagation();
                          onReactivate(customer);
                        }}
                      >
                        Reativar
                      </Button>
                    )}
                    
                    {onDelete && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-600 w-full justify-start"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(customer);
                        }}
                      >
                        Excluir
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
