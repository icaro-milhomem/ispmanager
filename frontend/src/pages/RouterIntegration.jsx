
import React, { useState, useEffect } from "react";
import { RouterIntegration } from "@/api/entities";
import { IPPool } from "@/api/entities";
import { IPAssignment } from "@/api/entities";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  Network,
  Server,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Info,
  Link2,
  Router,
  BarChart3,
  Users,
  Lock,
  Unlock,
  Search,
  Wifi,
  Database,
  Terminal,
  Code,
  Settings,
  HelpCircle,
  Download,
  Copy,
  Clock,
  Loader2,
  ArrowDownCircle,
  ArrowUpCircle,
  Share2,
  UploadCloud,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import RouterIntegrationForm from "../components/routers/RouterIntegrationForm";
import ClientConnectionsList from "../components/routers/ClientConnectionsList";
import IPPoolManager from "../components/routers/IPPoolManager";
import RouterIssuesList from "../components/routers/RouterIssuesList";

export default function RouterIntegrationPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [routers, setRouters] = useState([]);
  const [selectedRouter, setSelectedRouter] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showIntegrationForm, setShowIntegrationForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [ipPools, setIpPools] = useState([]);
  const [activeConnections, setActiveConnections] = useState([]);
  const [loadingConnections, setLoadingConnections] = useState(false);
  const [loadingPools, setLoadingPools] = useState(false);
  const [syncStatus, setSyncStatus] = useState("idle");
  const [lastSyncTime, setLastSyncTime] = useState(null);
  
  useEffect(() => {
    loadRouterIntegrations();
  }, []);
  
  useEffect(() => {
    if (selectedRouter) {
      loadIPPools(selectedRouter.id);
      loadActiveConnections(selectedRouter.id);
    }
  }, [selectedRouter]);
  
  const loadRouterIntegrations = async () => {
    try {
      const integrations = await RouterIntegration.list();
      setRouters(integrations);
      
      if (integrations.length > 0 && !selectedRouter) {
        const primaryRouter = integrations.find(router => router.is_primary) || integrations[0];
        setSelectedRouter(primaryRouter);
      }
    } catch (error) {
      console.error("Erro ao carregar integrações de roteadores:", error);
    }
  };
  
  const loadIPPools = async (routerId) => {
    setLoadingPools(true);
    try {
      const pools = await IPPool.filter({ router_id: routerId });
      setIpPools(pools);
    } catch (error) {
      console.error("Erro ao carregar pools de IPs:", error);
    } finally {
      setLoadingPools(false);
    }
  };
  
  const loadActiveConnections = async (routerId) => {
    setLoadingConnections(true);
    try {
      const assignments = await IPAssignment.filter({ 
        router_id: routerId,
        is_online: true
      });
      
      const connectionsWithCustomerInfo = await Promise.all(
        assignments.map(async (assignment) => {
          if (assignment.customer_id) {
            try {
              const customer = await Customer.get(assignment.customer_id);
              return {
                ...assignment,
                customer_name: customer?.full_name || "Cliente não encontrado",
                plan: customer?.plan || "N/A"
              };
            } catch (e) {
              return {
                ...assignment,
                customer_name: "Cliente não encontrado",
                plan: "N/A"
              };
            }
          } else {
            return {
              ...assignment,
              customer_name: "Não associado",
              plan: "N/A"
            };
          }
        })
      );
      
      setActiveConnections(connectionsWithCustomerInfo);
    } catch (error) {
      console.error("Erro ao carregar conexões ativas:", error);
    } finally {
      setLoadingConnections(false);
    }
  };
  
  const handleSaveIntegration = async (integrationData) => {
    try {
      let savedIntegration;
      
      if (isEditing) {
        savedIntegration = await RouterIntegration.update(
          selectedRouter.id,
          { ...integrationData, last_sync: new Date().toISOString() }
        );
        setSelectedRouter(savedIntegration);
      } else {
        savedIntegration = await RouterIntegration.create({
          ...integrationData,
          last_sync: new Date().toISOString(),
          status: "ativo"
        });
      }
      
      setShowIntegrationForm(false);
      setIsEditing(false);
      loadRouterIntegrations();
      
      return savedIntegration;
    } catch (error) {
      console.error("Erro ao salvar integração:", error);
      throw error;
    }
  };
  
  const handleEditIntegration = (router) => {
    setSelectedRouter(router);
    setIsEditing(true);
    setShowIntegrationForm(true);
  };
  
  const handleDeleteIntegration = async (routerId) => {
    if (window.confirm("Tem certeza que deseja excluir esta integração?")) {
      try {
        await RouterIntegration.delete(routerId);
        
        if (selectedRouter && selectedRouter.id === routerId) {
          setSelectedRouter(null);
        }
        
        loadRouterIntegrations();
      } catch (error) {
        console.error("Erro ao excluir integração:", error);
      }
    }
  };
  
  const handleSyncData = async () => {
    setSyncStatus("syncing");
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (selectedRouter) {
        await RouterIntegration.update(selectedRouter.id, {
          last_sync: new Date().toISOString()
        });
        
        setLastSyncTime(new Date().toISOString());
        setSelectedRouter({
          ...selectedRouter,
          last_sync: new Date().toISOString()
        });
        
        loadIPPools(selectedRouter.id);
        loadActiveConnections(selectedRouter.id);
      }
      
      setSyncStatus("success");
      setTimeout(() => setSyncStatus("idle"), 3000);
    } catch (error) {
      console.error("Erro na sincronização:", error);
      setSyncStatus("error");
      setTimeout(() => setSyncStatus("idle"), 3000);
    }
  };

  const handleSelectRouter = (router) => {
    setSelectedRouter(router);
  };
  
  const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return "Nunca";
    
    const date = new Date(dateTimeStr);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const getTimeSince = (dateTimeStr) => {
    if (!dateTimeStr) return "Nunca sincronizado";
    
    const date = new Date(dateTimeStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return "Agora mesmo";
    if (diffMins < 60) return `Há ${diffMins} minutos`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Há ${diffHours} horas`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `Há ${diffDays} dias`;
  };
  
  const getRouterStatus = (router) => {
    const lastSyncTime = router.last_sync ? new Date(router.last_sync) : null;
    if (!lastSyncTime) return "desconhecido";
    
    const now = new Date();
    const diffMins = (now - lastSyncTime) / 60000;
    
    if (router.status === "erro") return "erro";
    if (diffMins > 30) return "desconectado";
    return "conectado";
  };
  
  const renderSyncButton = () => {
    if (syncStatus === "syncing") {
      return (
        <Button disabled className="gap-1">
          <Loader2 className="h-4 w-4 animate-spin" />
          Sincronizando...
        </Button>
      );
    }
    
    if (syncStatus === "success") {
      return (
        <Button variant="outline" className="gap-1 text-green-600 border-green-200">
          <CheckCircle2 className="h-4 w-4" />
          Sincronizado
        </Button>
      );
    }
    
    if (syncStatus === "error") {
      return (
        <Button variant="outline" className="gap-1 text-red-600 border-red-200">
          <XCircle className="h-4 w-4" />
          Erro na sincronização
        </Button>
      );
    }
    
    return (
      <Button 
        variant="outline" 
        className="gap-1" 
        onClick={handleSyncData}
      >
        <RefreshCw className="h-4 w-4" />
        Sincronizar Dados
      </Button>
    );
  };
  
  const getStatusBadge = (status) => {
    switch (status) {
      case "conectado":
        return <Badge className="bg-green-100 text-green-800">Conectado</Badge>;
      case "desconectado":
        return <Badge className="bg-red-100 text-red-800">Desconectado</Badge>;
      case "erro":
        return <Badge className="bg-red-100 text-red-800">Erro</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Desconhecido</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Integração de Roteadores</h1>
          <p className="text-gray-500">
            Gerencie conexões com roteadores MikroTik, Cisco e Juniper
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {selectedRouter && renderSyncButton()}
          
          <Button 
            onClick={() => {
              setIsEditing(false);
              setShowIntegrationForm(true);
            }}
            className="gap-1 bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Nova Integração
          </Button>
        </div>
      </div>
      
      {showIntegrationForm ? (
        <RouterIntegrationForm 
          integration={isEditing ? selectedRouter : null}
          onSubmit={handleSaveIntegration}
          onCancel={() => {
            setShowIntegrationForm(false);
            setIsEditing(false);
          }}
        />
      ) : (
        <>
          {routers.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Router className="w-16 h-16 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium">Nenhuma integração configurada</h3>
                  <p className="text-gray-500 max-w-md mt-2 mb-4">
                    Configure uma integração com seu roteador para gerenciar IPs, clientes e conexões.
                  </p>
                  <Button 
                    onClick={() => {
                      setIsEditing(false);
                      setShowIntegrationForm(true);
                    }}
                    className="gap-1 bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4" />
                    Configurar Integração
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-12 md:col-span-3">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Roteadores Integrados</CardTitle>
                  </CardHeader>
                  <CardContent className="px-2">
                    <div className="space-y-1">
                      {routers.map(router => (
                        <Button
                          key={router.id}
                          variant={selectedRouter && selectedRouter.id === router.id ? "secondary" : "ghost"}
                          className="w-full justify-start relative py-6"
                          onClick={() => handleSelectRouter(router)}
                        >
                          <div className="flex items-center">
                            <div className="mr-2">
                              {router.type === "mikrotik" && <Router className="w-5 h-5 text-blue-500" />}
                              {router.type === "cisco" && <Server className="w-5 h-5 text-blue-500" />}
                              {router.type === "juniper" && <Network className="w-5 h-5 text-blue-500" />}
                              {router.type === "huawei" && <Share2 className="w-5 h-5 text-blue-500" />}
                              {router.type === "outro" && <Share2 className="w-5 h-5 text-blue-500" />}
                            </div>
                            <div className="flex flex-col items-start">
                              <span className="font-medium">{router.name}</span>
                              <span className="text-xs text-gray-500">{router.host}</span>
                            </div>
                          </div>
                          <div className="absolute right-2 top-2">
                            {getStatusBadge(getRouterStatus(router))}
                          </div>
                          {router.is_primary && (
                            <div className="absolute left-2 bottom-1">
                              <Badge variant="outline" className="text-xs">Principal</Badge>
                            </div>
                          )}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                {selectedRouter && (
                  <Card className="mt-4">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Informações do Roteador</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Modelo:</span>
                          <span className="font-medium">{selectedRouter.type.toUpperCase()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Método:</span>
                          <span className="font-medium">{selectedRouter.integration_method.toUpperCase()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Endereço:</span>
                          <span className="font-medium">{selectedRouter.host}:{selectedRouter.port}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Status:</span>
                          <span>
                            {getStatusBadge(getRouterStatus(selectedRouter))}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Última sincronização:</span>
                          <span className="font-medium">{getTimeSince(selectedRouter.last_sync)}</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 gap-1"
                          onClick={() => handleEditIntegration(selectedRouter)}
                        >
                          <Edit className="h-3.5 w-3.5" />
                          Editar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 gap-1"
                          onClick={() => handleDeleteIntegration(selectedRouter.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Excluir
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
              
              {selectedRouter ? (
                <div className="col-span-12 md:col-span-9">
                  <Tabs defaultValue="clients" className="w-full">
                    <TabsList className="mb-4">
                      <TabsTrigger value="clients" className="gap-1">
                        <Users className="h-4 w-4" />
                        Clientes Conectados
                      </TabsTrigger>
                      <TabsTrigger value="pools" className="gap-1">
                        <Database className="h-4 w-4" />
                        Pools de IPs
                      </TabsTrigger>
                      <TabsTrigger value="commands" className="gap-1">
                        <Terminal className="h-4 w-4" />
                        Comandos
                      </TabsTrigger>
                      <TabsTrigger value="guides" className="gap-1">
                        <HelpCircle className="h-4 w-4" />
                        Manuais de Integração
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="clients">
                      <ClientConnectionsList 
                        router={selectedRouter}
                        connections={activeConnections}
                        isLoading={loadingConnections}
                        onRefresh={() => loadActiveConnections(selectedRouter.id)}
                      />
                    </TabsContent>
                    
                    <TabsContent value="pools">
                      <IPPoolManager 
                        router={selectedRouter}
                        pools={ipPools}
                        isLoading={loadingPools}
                        onRefresh={() => loadIPPools(selectedRouter.id)}
                      />
                    </TabsContent>
                    
                    <TabsContent value="commands">
                      <CommandsTab router={selectedRouter} />
                    </TabsContent>
                    
                    <TabsContent value="guides">
                      <IntegrationGuides router={selectedRouter} />
                    </TabsContent>
                  </Tabs>
                </div>
              ) : (
                <div className="col-span-12 md:col-span-9">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <Router className="w-16 h-16 text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium">Selecione um roteador</h3>
                        <p className="text-gray-500 max-w-md mt-2">
                          Selecione um roteador na lista à esquerda para visualizar e gerenciar os detalhes de integração.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function CommandsTab({ router }) {
  const [selectedCommand, setSelectedCommand] = useState("list_users");
  
  const commands = {
    list_users: {
      title: "Listar Usuários",
      description: "Lista todos os usuários PPPoE conectados",
      api: "/ppp/active/getall",
      ssh: "/ppp active print",
      snmp: "snmpwalk -v2c -c community 1.3.6.1.4.1.14988.1.1.2.1.1",
      result: `[
  { "name": "usuario01", "address": "192.168.0.101", "uptime": "2h30m20s", "mac-address": "00:11:22:33:44:55" },
  { "name": "usuario02", "address": "192.168.0.102", "uptime": "1h15m10s", "mac-address": "AA:BB:CC:DD:EE:FF" }
]`
    },
    list_pools: {
      title: "Listar Pools de IPs",
      description: "Lista todas as pools de endereços IP configuradas",
      api: "/ip/pool/getall",
      ssh: "/ip pool print",
      snmp: "snmpwalk -v2c -c community 1.3.6.1.2.1.4.22.1.3",
      result: `[
  { "name": "pool-pppoe", "ranges": "192.168.0.2-192.168.0.254", "next-pool": "none" },
  { "name": "pool-hotspot", "ranges": "10.0.0.2-10.0.0.254", "next-pool": "none" }
]`
    },
    add_user: {
      title: "Adicionar Usuário PPPoE",
      description: "Cria um novo usuário PPPoE no roteador",
      api: `/ppp/secret/add
{
  "name": "novo_usuario",
  "password": "senha123",
  "service": "pppoe",
  "profile": "default"
}`,
      ssh: `/ppp secret add name=novo_usuario password=senha123 service=pppoe profile=default`,
      snmp: "SNMP não suporta este comando diretamente",
      result: `{
  "ret": "*1",
  "status": "success"
}`
    },
    set_ip: {
      title: "Atribuir IP Fixo",
      description: "Define um endereço IP fixo para um cliente",
      api: `/ppp/secret/set
{
  ".id": "*1",
  "remote-address": "192.168.0.10"
}`,
      ssh: `/ppp secret set [find name="cliente01"] remote-address=192.168.0.10`,
      snmp: "SNMP não suporta este comando diretamente",
      result: `{
  "status": "success"
}`
    },
    block_ip: {
      title: "Bloquear IP",
      description: "Bloqueia um IP específico na firewall",
      api: `/ip/firewall/filter/add
{
  "chain": "forward",
  "src-address": "192.168.0.123",
  "action": "drop",
  "comment": "IP Bloqueado"
}`,
      ssh: `/ip firewall filter add chain=forward src-address=192.168.0.123 action=drop comment="IP Bloqueado"`,
      snmp: "SNMP não suporta este comando diretamente",
      result: `{
  "ret": "*1",
  "status": "success"
}`
    },
    create_pool: {
      title: "Criar Pool de IPs",
      description: "Cria uma nova pool de endereços IP",
      api: `/ip/pool/add
{
  "name": "nova-pool",
  "ranges": "192.168.0.100-192.168.0.200"
}`,
      ssh: `/ip pool add name=nova-pool ranges=192.168.0.100-192.168.0.200`,
      snmp: "SNMP não suporta este comando diretamente",
      result: `{
  "ret": "*1",
  "status": "success"
}`
    },
    monitor_bandwidth: {
      title: "Monitorar Banda",
      description: "Monitora o uso de banda de um cliente específico",
      api: `/interface/monitor-traffic
{
  "interface": "ether1",
  "once": "true"
}`,
      ssh: `/interface monitor-traffic ether1 once`,
      snmp: "snmpwalk -v2c -c community 1.3.6.1.2.1.2.2.1.10.1 1.3.6.1.2.1.2.2.1.16.1",
      result: `{
  "rx-bits-per-second": 2547328,
  "tx-bits-per-second": 1268664,
  "rx-packets-per-second": 420,
  "tx-packets-per-second": 210
}`
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Comandos de Integração</CardTitle>
        <CardDescription>
          Comandos disponíveis para integração com {router.type === "mikrotik" ? "MikroTik" : router.type === "cisco" ? "Cisco" : "Juniper"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="font-medium text-sm mb-3">Comandos Disponíveis</div>
            <div className="space-y-1">
              {Object.entries(commands).map(([key, command]) => (
                <Button
                  key={key}
                  variant={selectedCommand === key ? "secondary" : "ghost"}
                  className="w-full justify-start text-left"
                  onClick={() => setSelectedCommand(key)}
                >
                  <div className="truncate">
                    {command.title}
                  </div>
                </Button>
              ))}
            </div>
          </div>
          
          <div className="lg:col-span-2">
            <div className="border rounded-md p-4 space-y-4">
              <div>
                <h3 className="font-medium text-lg mb-1">{commands[selectedCommand].title}</h3>
                <p className="text-gray-500 mb-4">{commands[selectedCommand].description}</p>
                
                <Tabs defaultValue="api">
                  <TabsList className="mb-4">
                    <TabsTrigger value="api">API</TabsTrigger>
                    <TabsTrigger value="ssh">SSH</TabsTrigger>
                    <TabsTrigger value="snmp">SNMP</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="api">
                    <div className="bg-gray-950 text-gray-100 p-3 rounded-md font-mono text-sm overflow-x-auto">
                      <div className="flex items-start justify-between">
                        <pre className="whitespace-pre-wrap">{commands[selectedCommand].api}</pre>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-400 hover:text-white"
                          onClick={() => {
                            navigator.clipboard.writeText(commands[selectedCommand].api);
                          }}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <div className="text-sm font-medium mb-2">Resposta:</div>
                      <div className="bg-gray-950 text-gray-100 p-3 rounded-md font-mono text-sm overflow-x-auto">
                        <pre className="whitespace-pre-wrap">{commands[selectedCommand].result}</pre>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="ssh">
                    <div className="bg-gray-950 text-gray-100 p-3 rounded-md font-mono text-sm overflow-x-auto">
                      <div className="flex items-start justify-between">
                        <pre className="whitespace-pre-wrap">{commands[selectedCommand].ssh}</pre>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-400 hover:text-white"
                          onClick={() => {
                            navigator.clipboard.writeText(commands[selectedCommand].ssh);
                          }}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="snmp">
                    <div className="bg-gray-950 text-gray-100 p-3 rounded-md font-mono text-sm overflow-x-auto">
                      <div className="flex items-start justify-between">
                        <pre className="whitespace-pre-wrap">{commands[selectedCommand].snmp}</pre>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-400 hover:text-white"
                          onClick={() => {
                            navigator.clipboard.writeText(commands[selectedCommand].snmp);
                          }}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
              
              <div className="pt-2">
                <Alert className="bg-blue-50 border-blue-200">
                  <Info className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    Este comando pode ser utilizado via API REST, SSH ou SNMP dependendo da configuração do seu roteador.
                  </AlertDescription>
                </Alert>
              </div>
              
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" className="gap-1">
                  <Terminal className="h-3.5 w-3.5" />
                  Testar Comando
                </Button>
                <Button size="sm" className="gap-1">
                  <Download className="h-3.5 w-3.5" />
                  Salvar Comando
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function IntegrationGuides({ router }) {
  const [selectedGuide, setSelectedGuide] = useState("mikrotik-api");
  
  const guides = {
    "mikrotik-api": {
      title: "MikroTik API",
      description: "Integração via API REST do MikroTik",
      content: `# Integração com MikroTik via API REST

## Configuração do Roteador

Antes de iniciar a integração, é necessário habilitar a API no roteador MikroTik:

1. Acesse o Winbox ou WebFig
2. Vá em IP → Services
3. Certifique-se de que o serviço "www" e "api" estejam ativos
4. Configure uma porta segura para a API (padrão: 8728 para HTTP, 8729 para HTTPS)

## Autenticação na API

A API do MikroTik requer autenticação básica:

\`\`\`javascript
// Exemplo em JavaScript
async function authenticateMikrotik(host, username, password) {
  const url = \`http://\${host}:8728/rest/login\`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: username,
      password: password
    })
  });
  
  const token = await response.text();
  return token;
}
\`\`\`

## Consulta de Clientes PPPoE

Para obter a lista de clientes conectados via PPPoE:

\`\`\`javascript
async function getPPPoEUsers(host, token) {
  const url = \`http://\${host}:8728/rest/ppp/active/getall\`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': \`Bearer \${token}\`
    }
  });
  
  const users = await response.json();
  return users;
}
\`\`\`

## Consulta de Pools de IPs

Para obter as pools de IPs configuradas:

\`\`\`javascript
async function getIPPools(host, token) {
  const url = \`http://\${host}:8728/rest/ip/pool/getall\`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': \`Bearer \${token}\`
    }
  });
  
  const pools = await response.json();
  return pools;
}
\`\`\`

## Criação de Usuários PPPoE

Para criar um novo usuário PPPoE:

\`\`\`javascript
async function createPPPoEUser(host, token, username, password, profile = "default") {
  const url = \`http://\${host}:8728/rest/ppp/secret/add\`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': \`Bearer \${token}\`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: username,
      password: password,
      service: "pppoe",
      profile: profile
    })
  });
  
  const result = await response.json();
  return result;
}
\`\`\`

## Monitoramento de Tráfego

Para monitorar o tráfego de uma interface:

\`\`\`javascript
async function monitorTraffic(host, token, interface = "ether1") {
  const url = \`http://\${host}:8728/rest/interface/monitor-traffic\`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': \`Bearer \${token}\`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      "interface": interface,
      "once": "true"
    })
  });
  
  const traffic = await response.json();
  return traffic;
}
\`\`\`

## Dicas e Boas Práticas

- Utilize HTTPS sempre que possível para maior segurança
- Crie um usuário específico para a API com permissões restritas
- Implemente cache para reduzir o número de requisições ao roteador
- Lide corretamente com erros e timeouts na comunicação com o roteador`
    },
    "mikrotik-ssh": {
      title: "MikroTik SSH",
      description: "Integração via SSH com MikroTik",
      content: `# Integração com MikroTik via SSH

## Configuração do Roteador

Para habilitar o acesso SSH ao seu roteador MikroTik:

1. Acesse o Winbox ou WebFig
2. Vá em IP → Services
3. Certifique-se de que o serviço "ssh" esteja ativo
4. Configure uma porta segura (padrão: 22)
5. Idealmente, configure autenticação por chave pública

## Conexão SSH via Node.js

Exemplo usando a biblioteca ssh2:

\`\`\`javascript
const { Client } = require('ssh2');

async function executeCommand(host, username, password, command) {
  return new Promise((resolve, reject) => {
    const conn = new Client();
    let output = '';
    
    conn.on('ready', () => {
      conn.exec(command, (err, stream) => {
        if (err) return reject(err);
        
        stream.on('data', (data) => {
          output += data.toString();
        });
        
        stream.on('close', (code) => {
          conn.end();
          if (code !== 0) {
            reject(new Error(\`Command failed with code \${code}\`));
          } else {
            resolve(output);
          }
        });
      });
    }).connect({
      host,
      port: 22,
      username,
      password
    });
    
    conn.on('error', (err) => {
      reject(err);
    });
  });
}
\`\`\`

## Comandos Comuns para Gerenciamento

### Listar Usuários PPPoE Ativos

\`\`\`javascript
const activePPPoE = await executeCommand(router, username, password, '/ppp active print');
\`\`\`

### Listar Pools de IPs

\`\`\`javascript
const ipPools = await executeCommand(router, username, password, '/ip pool print');
\`\`\`

### Adicionar Usuário PPPoE

\`\`\`javascript
const createUserCmd = \`/ppp secret add name=\${username} password=\${password} service=pppoe profile=default\`;
await executeCommand(router, username, password, createUserCmd);
\`\`\`

### Definir IP Fixo para Cliente

\`\`\`javascript
const setIPCmd = \`/ppp secret set [find name="\${clientName}"] remote-address=\${ipAddress}\`;
await executeCommand(router, username, password, setIPCmd);
\`\`\`

### Bloquear um Cliente

\`\`\`javascript
const blockCmd = \`/ppp secret set [find name="\${clientName}"] disabled=yes\`;
await executeCommand(router, username, password, blockCmd);
\`\`\`

### Criar uma Pool de IPs

\`\`\`javascript
const createPoolCmd = \`/ip pool add name=\${poolName} ranges=\${startIP}-\${endIP}\`;
await executeCommand(router, username, password, createPoolCmd);
\`\`\`

## Dicas de Segurança

- Sempre use chaves SSH em vez de senhas quando possível
- Limite os IPs que podem acessar o SSH do roteador
- Crie um usuário específico para a integração com permissões restritas
- Considere o uso de port knocking ou outras técnicas de segurança
- Registre todas as ações executadas via SSH para auditoria`
    },
    "mikrotik-snmp": {
      title: "MikroTik SNMP",
      description: "Integração via SNMP com MikroTik",
      content: `# Integração com MikroTik via SNMP

## Configuração do Roteador

Para habilitar o SNMP no roteador MikroTik:

1. Acesse o Winbox ou WebFig
2. Vá em IP → SNMP
3. Habilite o serviço SNMP
4. Configure a community string (não use "public" em produção)
5. Configure a lista de acesso para limitar quais IPs podem acessar o SNMP

## Consulta SNMP com Node.js

Exemplo usando a biblioteca snmp-native:

\`\`\`javascript
const snmp = require('snmp-native');

function snmpGet(host, community, oid) {
  return new Promise((resolve, reject) => {
    const session = new snmp.Session({ host, community });
    
    session.get({ oid }, (err, varbinds) => {
      session.close();
      
      if (err) {
        reject(err);
      } else {
        resolve(varbinds[0].value);
      }
    });
  });
}

function snmpWalk(host, community, oid) {
  return new Promise((resolve, reject) => {
    const session = new snmp.Session({ host, community });
    const results = [];
    
    session.walk(oid, (varbinds) => {
      for (const vb of varbinds) {
        results.push({
          oid: vb.oid,
          value: vb.value
        });
      }
    }, (err) => {
      session.close();
      
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
}
\`\`\`

## OIDs Comuns para MikroTik

### Informações do Sistema

- sysDescr: \`1.3.6.1.2.1.1.1.0\`
- sysUpTime: \`1.3.6.1.2.1.1.3.0\`
- sysName: \`1.3.6.1.2.1.1.5.0\`

### Interfaces de Rede

- Lista de interfaces: \`1.3.6.1.2.1.2.2.1.2\`
- Status da interface: \`1.3.6.1.2.1.2.2.1.8\`
- Bytes recebidos: \`1.3.6.1.2.1.2.2.1.10\`
- Bytes enviados: \`1.3.6.1.2.1.2.2.1.16\`

### MikroTik Específicos

- Usuários PPPoE ativos: \`1.3.6.1.4.1.14988.1.1.2.1.1\`
- Informações de cliente PPPoE: \`1.3.6.1.4.1.14988.1.1.2.1.2\`
- Queue Tree: \`1.3.6.1.4.1.14988.1.1.1.3\`

## Monitoramento de Tráfego

Para monitorar o tráfego de uma interface:

\`\`\`javascript
async function getInterfaceTraffic(host, community, interfaceIndex) {
  const rxBytes = await snmpGet(host, community, \`1.3.6.1.2.1.2.2.1.10.\${interfaceIndex}\`);
  const txBytes = await snmpGet(host, community, \`1.3.6.1.2.1.2.2.1.16.\${interfaceIndex}\`);
  
  return {
    rxBytes,
    txBytes
  };
}
\`\`\`

## Monitoramento de Clientes PPPoE

Para obter informações sobre clientes PPPoE ativos:

\`\`\`javascript
async function getPPPoEClients(host, community) {
  const pppoeNameOid = '1.3.6.1.4.1.14988.1.1.2.1.1.2';
  const pppoeAddressOid = '1.3.6.1.4.1.14988.1.1.2.1.1.5';
  
  const names = await snmpWalk(host, community, pppoeNameOid);
  const addresses = await snmpWalk(host, community, pppoeAddressOid);
  
  const clients = [];
  for (let i = 0; i < names.length; i++) {
    const oidParts = names[i].oid.split('.');
    const index = oidParts[oidParts.length - 1];
    
    const addressEntry = addresses.find(addr => {
      const addrOidParts = addr.oid.split('.');
      return addrOidParts[addrOidParts.length - 1] === index;
    });
    
    clients.push({
      username: names[i].value.toString(),
      ipAddress: addressEntry ? addressEntry.value.toString() : 'N/A'
    });
  }
  
  return clients;
}
\`\`\`

## Dicas e Boas Práticas

- Use SNMP v3 para maior segurança quando possível
- Nunca use a community string "public" em ambientes de produção
- Restrinja o acesso SNMP apenas aos IPs necessários
- Utilize SNMP principalmente para monitoramento, não para configuração
- Implemente cache para reduzir o número de consultas SNMP`
    },
    "cisco-api": {
      title: "Cisco API",
      description: "Integração via API REST do Cisco IOS-XE",
      content: `# Integração com Cisco IOS-XE via API REST

## Configuração do Roteador Cisco

Para habilitar a API REST no roteador Cisco IOS-XE:

1. Configure o servidor HTTPS no roteador:
\`\`\`
router# configure terminal
router(config)# ip http secure-server
router(config)# ip http authentication local
router(config)# restconf
router(config)# end
\`\`\`

2. Crie um usuário com privilégios:
\`\`\`
router# configure terminal
router(config)# username admin privilege 15 secret cisco123
router(config)# end
\`\`\`

## Autenticação na API

A API REST do Cisco IOS-XE utiliza autenticação básica HTTP:

\`\`\`javascript
// Exemplo em JavaScript
async function authenticateCisco(host, username, password) {
  const credentials = Buffer.from(\`\${username}:\${password}\`).toString('base64');
  
  const url = \`https://\${host}/restconf/data/ietf-interfaces:interfaces\`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': \`Basic \${credentials}\`,
      'Accept': 'application/yang-data+json'
    }
  });
  
  if (response.ok) {
    return credentials; 
  } else {
    throw new Error('Falha na autenticação');
  }
}
\`\`\`

## Consulta de Interfaces

Para obter a lista de interfaces do roteador:

\`\`\`javascript
async function getInterfaces(host, credentials) {
  const url = \`https://\${host}/restconf/data/ietf-interfaces:interfaces\`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': \`Basic \${credentials}\`,
      'Accept': 'application/yang-data+json'
    }
  });
  
  const data = await response.json();
  return data['ietf-interfaces:interfaces'].interface;
}
\`\`\`

## Consulta de Clientes DHCP

Para obter a lista de clientes DHCP:

\`\`\`javascript
async function getDhcpClients(host, credentials) {
  const url = \`https://\${host}/restconf/data/Cisco-IOS-XE-dhcp-oper:dhcpv4-server-oper/statistics\`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': \`Basic \${credentials}\`,
      'Accept': 'application/yang-data+json'
    }
  });
  
  const data = await response.json();
  return data['Cisco-IOS-XE-dhcp-oper:statistics'];
}
\`\`\`

## Configuração de IP Pools

Para obter informações sobre pools de endereços IP:

\`\`\`javascript
async function getIpPools(host, credentials) {
  const url = \`https://\${host}/restconf/data/Cisco-IOS-XE-native:native/ip/dhcp/pool\`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': \`Basic \${credentials}\`,
      'Accept': 'application/yang-data+json'
    }
  });
  
  const data = await response.json();
  return data['Cisco-IOS-XE-native:pool'];
}
\`\`\`

## Criação de uma Nova Pool de IPs

Para criar uma nova pool DHCP:

\`\`\`javascript
async function createIpPool(host, credentials, poolName, network, mask, defaultRouter) {
  const url = \`https://\${host}/restconf/data/Cisco-IOS-XE-native:native/ip/dhcp/pool\`;
  
  const poolData = {
    "Cisco-IOS-XE-native:pool": [
      {
        "id": poolName,
        "network": {
          "primary": {
            "address": network,
            "mask": mask
          }
        },
        "default-router": {
          "default-router-list": [defaultRouter]
        }
      }
    ]
  };
  
  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Authorization': \`Basic \${credentials}\`,
      'Content-Type': 'application/yang-data+json',
      'Accept': 'application/yang-data+json'
    },
    body: JSON.stringify(poolData)
  });
  
  return response.ok;
}
\`\`\`

## Monitoramento de Tráfego

Para obter estatísticas de tráfego de uma interface:

\`\`\`javascript
async function getInterfaceStatistics(host, credentials, interfaceName) {
  const url = \`https://\${host}/restconf/data/Cisco-IOS-XE-interfaces-oper:interfaces/interface=\${interfaceName}\`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': \`Basic \${credentials}\`,
      'Accept': 'application/json'
    }
  });
  
  const data = await response.json();
  return data['Cisco-IOS-XE-interfaces-oper:interface'].statistics;
}
\`\`\`

## Dicas e Boas Práticas

- Sempre use HTTPS para comunicação com a API
- Crie um usuário específico para a API com privilégios mínimos necessários
- Implemente tratamento de erros robusto
- Considere utilizar certificados assinados em vez de autoassinados
- Consulte a documentação específica da versão do IOS-XE que você está utilizando`
    },
    "juniper-api": {
      title: "Juniper API",
      description: "Integração via API do Juniper Junos",
      content: `# Integração com Juniper Junos via API

## Configuração do Roteador Juniper

Para habilitar a API REST no roteador Juniper Junos:

1. Configure o servidor HTTPS e a API REST:
\`\`\`
user@router> configure
[edit]
user@router# set system services web-management https
user@router# set system services rest http
user@router# set system services rest enable-explorer
user@router# commit and-quit
\`\`\`

2. Crie um usuário com privilégios API:
\`\`\`
user@router> configure
[edit]
user@router# set system login user api-user class super-user authentication plain-text-password
New password: ********
Retype new password: ********
user@router# commit and-quit
\`\`\`

## Autenticação na API

A API REST do Juniper utiliza autenticação básica ou baseada em tokens JWT:

\`\`\`javascript
// Exemplo em JavaScript
async function authenticateJuniper(host, username, password) {
  const credentials = Buffer.from(\`\${username}:\${password}\`).toString('base64');
  
  const url = \`https://\${host}/rpc/get-interface-information\`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': \`Basic \${credentials}\`,
      'Accept': 'application/json'
    }
  });
  
  if (response.ok) {
    return credentials;
  } else {
    throw new Error('Falha na autenticação');
  }
}
\`\`\`

## Consulta de Interfaces

Para obter a lista de interfaces do roteador:

\`\`\`javascript
async function getInterfaces(host, credentials) {
  const url = \`https://\${host}/rpc/get-interface-information\`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': \`Basic \${credentials}\`,
      'Accept': 'application/json'
    }
  });
  
  const data = await response.json();
  return data['interface-information'][0]['physical-interface'];
}
\`\`\`

## Consulta de Informações de DHCP

Para obter informações sobre o servidor DHCP:

\`\`\`javascript
async function getDhcpInformation(host, credentials) {
  const url = \`https://\${host}/rpc/get-dhcp-server-statistics\`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': \`Basic \${credentials}\`,
      'Accept': 'application/json'
    }
  });
  
  const data = await response.json();
  return data['dhcp-server-statistics-information'][0];
}
\`\`\`

## Consulta de Pools de Endereços

Para obter informações sobre pools de endereços:

\`\`\`javascript
async function getAddressPools(host, credentials) {
  const url = \`https://\${host}/rpc/get-dhcp-server-binding-information\`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': \`Basic \${credentials}\`,
      'Accept': 'application/json'
    }
  });
  
  const data = await response.json();
  return data['dhcp-server-binding-information'][0]['binding'];
}
\`\`\`

## Execução de Comandos CLI

Para executar comandos CLI via API:

\`\`\`javascript
async function executeCliCommand(host, credentials, command) {
  const url = \`https://\${host}/rpc/cli\`;
  const formData = new FormData();
  formData.append('commands', command);
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': \`Basic \${credentials}\`,
      'Accept': 'application/json'
    },
    body: formData
  });
  
  const data = await response.json();
  return data.output;
}

// Exemplo: consultar usuários PPPoE ativos
async function getActivePPPoEUsers(host, credentials) {
  return executeCliCommand(host, credentials, 'show subscribers client-type pppoe');
}
\`\`\`

## Configuração via API

Para aplicar configurações via API:

\`\`\`javascript
async function applyConfiguration(host, credentials, configCommands) {
  const url = \`https://\${host}/rpc/lock-configuration\`;
  await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': \`Basic \${credentials}\`,
      'Accept': 'application/json'
    }
  });
  
  try {
    for (const command of configCommands) {
      const url = \`https://\${host}/rpc/load-configuration\`;
      const formData = new FormData();
      formData.append('configuration-xml', \`<configuration><${command}/></configuration>\`);
      formData.append('action', 'merge');
      
      await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': \`Basic \${credentials}\`,
          'Accept': 'application/json'
        },
        body: formData
      });
    }
    
    const commitUrl = \`https://\${host}/rpc/commit-configuration\`;
    await fetch(commitUrl, {
      method: 'POST',
      headers: {
        'Authorization': \`Basic \${credentials}\`,
        'Accept': 'application/json'
      }
    });
  } finally {
    const unlockUrl = \`https://\${host}/rpc/unlock-configuration\`;
    await fetch(unlockUrl, {
      method: 'POST',
      headers: {
        'Authorization': \`Basic \${credentials}\`,
        'Accept': 'application/json'
      }
    });
  }
}

// Exemplo: criar uma nova pool de endereços
async function createAddressPool(host, credentials, poolName, network, range) {
  const commands = [
    \`system services dhcp pool \${poolName} address-range low \${range.low} high \${range.high}\`,
    \`system services dhcp pool \${poolName} network \${network}\`
  ];
  
  return applyConfiguration(host, credentials, commands);
}
\`\`\`

## Dicas e Boas Práticas

- Sempre use HTTPS para comunicação com a API
- Crie um usuário específico para a API com privilégios mínimos necessários
- Utilize o bloqueio de configuração para garantir consistência
- Implemente tratamento de erros robusto
- Consulte a documentação específica da versão do Junos que você está utilizando
- Use o explorer REST (habilitado via enable-explorer) para aprender mais sobre os endpoints disponíveis`
    }
  };
  
  return (
    <Card className="border-t-4 border-t-blue-600">
      <CardHeader>
        <CardTitle>Manuais de Integração</CardTitle>
        <CardDescription>
          Documentação detalhada para integração com {router.type === "mikrotik" ? "MikroTik" : router.type === "cisco" ? "Cisco" : "Juniper"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 space-y-2">
            <div className="font-medium text-sm mb-3">Guias Disponíveis</div>
            <div className="space-y-2">
              <Button
                variant={selectedGuide === "mikrotik-api" ? "secondary" : "outline"}
                className="w-full justify-start"
                onClick={() => setSelectedGuide("mikrotik-api")}
              >
                <Code className="w-4 h-4 mr-2" />
                MikroTik API
              </Button>
              <Button
                variant={selectedGuide === "mikrotik-ssh" ? "secondary" : "outline"}
                className="w-full justify-start"
                onClick={() => setSelectedGuide("mikrotik-ssh")}
              >
                <Terminal className="w-4 h-4 mr-2" />
                MikroTik SSH
              </Button>
              <Button
                variant={selectedGuide === "mikrotik-snmp" ? "secondary" : "outline"}
                className="w-full justify-start"
                onClick={() => setSelectedGuide("mikrotik-snmp")}
              >
                <Network className="w-4 h-4 mr-2" />
                MikroTik SNMP
              </Button>
              <Button
                variant={selectedGuide === "cisco-api" ? "secondary" : "outline"}
                className="w-full justify-start"
                onClick={() => setSelectedGuide("cisco-api")}
              >
                <Code className="w-4 h-4 mr-2" />
                Cisco API
              </Button>
              <Button
                variant={selectedGuide === "juniper-api" ? "secondary" : "outline"}
                className="w-full justify-start"
                onClick={() => setSelectedGuide("juniper-api")}
              >
                <Code className="w-4 h-4 mr-2" />
                Juniper API
              </Button>
            </div>
            
            <div className="pt-4">
              <Button variant="outline" className="w-full gap-2">
                <Download className="w-4 h-4" />
                Baixar Documentação
              </Button>
            </div>
          </div>
          
          <div className="md:col-span-2">
            <Card className="border shadow-none">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle>{guides[selectedGuide].title}</CardTitle>
                  <Button variant="ghost" size="sm" className="gap-1">
                    <Copy className="w-4 h-4" />
                    Copiar
                  </Button>
                </div>
                <CardDescription>{guides[selectedGuide].description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px] pr-4">
                  <div className="prose prose-sm max-w-none">
                    <pre className="whitespace-pre-wrap font-mono text-sm bg-gray-50 p-4 rounded-md overflow-auto">
                      {guides[selectedGuide].content}
                    </pre>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
