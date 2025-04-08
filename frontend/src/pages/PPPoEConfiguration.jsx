import React, { useState, useEffect } from "react";
import { Customer } from "@/api/entities";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Wifi,
  Server,
  RefreshCw,
  PlusCircle,
  Copy,
  Check,
  Radio,
  Network,
  Settings,
  User,
  AlertTriangle,
  HelpCircle
} from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

export default function PPPoEConfigurationPage() {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("connections");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setIsLoading(true);
      const data = await Customer.list();
      setCustomers(data);
    } catch (error) {
      console.error("Erro ao carregar clientes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredCustomers = customers.filter((customer) => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      customer.full_name.toLowerCase().includes(searchTermLower) ||
      customer.contract_number?.toLowerCase().includes(searchTermLower) ||
      customer.pppoe_username?.toLowerCase().includes(searchTermLower) ||
      customer.ip_address?.toLowerCase().includes(searchTermLower)
    );
  });

  const handleCustomerSelect = (customer) => {
    setSelectedCustomer(customer);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Dados simulados para estatísticas
  const connectionStats = {
    total: customers.length,
    active: customers.filter(c => c.status === 'active').length,
    suspended: customers.filter(c => c.status === 'suspended').length,
    pending: customers.filter(c => c.status === 'pending').length,
    ipv4_allocated: 230,
    ipv4_total: 256
  };

  // Buscar os principais modelos de roteadores usados
  const getRouterModels = () => {
    const models = {};
    customers.forEach(customer => {
      if (customer.router_model) {
        models[customer.router_model] = (models[customer.router_model] || 0) + 1;
      }
    });
    
    return Object.entries(models)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  };

  const routerModels = getRouterModels();

  // Simular dados de autenticação recentes
  const recentAuthenticationEvents = [
    { customer_name: "João Silva", time: "10:23:45", success: true, ip: "192.168.1.45" },
    { customer_name: "Maria Santos", time: "10:20:12", success: false, ip: "-" },
    { customer_name: "Carlos Oliveira", time: "10:15:33", success: true, ip: "192.168.1.78" },
    { customer_name: "Ana Costa", time: "10:10:21", success: true, ip: "192.168.1.32" },
    { customer_name: "Pedro Almeida", time: "10:05:44", success: false, ip: "-" }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Conexões PPPoE</h1>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={loadCustomers}
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Atualizar
          </Button>
          <Button className="gap-2 bg-blue-600">
            <PlusCircle className="w-4 h-4" />
            Nova Conexão
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="connections">Conexões</TabsTrigger>
          <TabsTrigger value="statistics">Estatísticas</TabsTrigger>
          <TabsTrigger value="radius">Servidor RADIUS</TabsTrigger>
        </TabsList>
        
        <TabsContent value="connections" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wifi className="h-5 w-5 text-blue-500" />
                Clientes PPPoE
              </CardTitle>
              <CardDescription>
                Lista de clientes com seus dados de conexão PPPoE
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Buscar clientes, contratos ou usernames..."
                    value={searchTerm}
                    onChange={handleSearch}
                    className="pl-10"
                  />
                </div>
                <Select defaultValue="all">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filtrar por status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Status</SelectItem>
                    <SelectItem value="active">Ativos</SelectItem>
                    <SelectItem value="suspended">Suspensos</SelectItem>
                    <SelectItem value="pending">Pendentes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {isLoading ? (
                <div className="flex justify-center items-center py-16">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-500">Carregando conexões PPPoE...</p>
                  </div>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Contrato</TableHead>
                        <TableHead>Usuário PPPoE</TableHead>
                        <TableHead>Senha PPPoE</TableHead>
                        <TableHead>IP Alocado</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCustomers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                            Nenhum cliente encontrado
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredCustomers.map((customer) => (
                          <TableRow 
                            key={customer.id}
                            className="cursor-pointer hover:bg-gray-50"
                            onClick={() => handleCustomerSelect(customer)}
                          >
                            <TableCell>
                              <div className="font-medium">{customer.full_name}</div>
                              <div className="text-xs text-gray-500">{customer.cpf}</div>
                            </TableCell>
                            <TableCell>
                              {customer.contract_number || '-'}
                            </TableCell>
                            <TableCell>
                              {customer.pppoe_username ? (
                                <div className="flex items-center gap-1">
                                  <span className="font-mono text-sm">{customer.pppoe_username}</span>
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      copyToClipboard(customer.pppoe_username);
                                    }}
                                    className="text-gray-400 hover:text-blue-600"
                                  >
                                    {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                                  </button>
                                </div>
                              ) : (
                                <span className="text-gray-400">Não definido</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {customer.pppoe_password ? (
                                <div className="flex items-center gap-1">
                                  <span className="font-mono text-sm">{'•'.repeat(8)}</span>
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      copyToClipboard(customer.pppoe_password);
                                    }}
                                    className="text-gray-400 hover:text-blue-600"
                                  >
                                    {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                                  </button>
                                </div>
                              ) : (
                                <span className="text-gray-400">Não definido</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {customer.ip_address || '-'}
                            </TableCell>
                            <TableCell>
                              <Badge className={
                                customer.status === 'active' ? 'bg-green-100 text-green-800' :
                                customer.status === 'suspended' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                              }>
                                {customer.status === 'active' ? 'Ativo' :
                                 customer.status === 'suspended' ? 'Suspenso' :
                                 customer.status === 'pending' ? 'Pendente' : 'Inativo'}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {selectedCustomer && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-500" />
                  Detalhes da Conexão: {selectedCustomer.full_name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Cliente</p>
                      <p className="text-lg font-medium">{selectedCustomer.full_name}</p>
                      <p className="text-sm text-gray-500">{selectedCustomer.cpf}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-500">Endereço</p>
                      <p className="text-sm">{selectedCustomer.address}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-500">Contrato</p>
                      <p className="text-sm">{selectedCustomer.contract_number}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Credenciais PPPoE</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="bg-gray-100 p-2 rounded text-sm font-mono flex-1">
                          <div className="flex justify-between">
                            <span>Usuário:</span>
                            <span>{selectedCustomer.pppoe_username || 'Não definido'}</span>
                          </div>
                          <div className="flex justify-between mt-1">
                            <span>Senha:</span>
                            <span>{selectedCustomer.pppoe_password || 'Não definido'}</span>
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            const info = `Usuário: ${selectedCustomer.pppoe_username}\nSenha: ${selectedCustomer.pppoe_password}`;
                            copyToClipboard(info);
                          }}
                        >
                          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-500">IP e MAC</p>
                      <div className="bg-gray-100 p-2 rounded text-sm font-mono mt-1">
                        <div className="flex justify-between">
                          <span>IP:</span>
                          <span>{selectedCustomer.ip_address || 'Dinâmico'}</span>
                        </div>
                        <div className="flex justify-between mt-1">
                          <span>MAC:</span>
                          <span>{selectedCustomer.equipment_mac || 'Não registrado'}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-500">Status da Conexão</p>
                      <Badge className={
                        selectedCustomer.status === 'active' ? 'bg-green-100 text-green-800' :
                        selectedCustomer.status === 'suspended' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }>
                        {selectedCustomer.status === 'active' ? 'Ativo' :
                         selectedCustomer.status === 'suspended' ? 'Suspenso' :
                         selectedCustomer.status === 'pending' ? 'Pendente' : 'Inativo'}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end gap-2 mt-6">
                  <Button 
                    variant="outline" 
                    onClick={() => setSelectedCustomer(null)}
                  >
                    Fechar
                  </Button>
                  <Button 
                    variant={selectedCustomer.status === 'active' ? 'destructive' : 'default'}
                    className={selectedCustomer.status === 'active' ? '' : 'bg-green-600'}
                  >
                    {selectedCustomer.status === 'active' ? 'Suspender Conexão' : 'Ativar Conexão'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="statistics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Conexões por Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-100 text-green-800">Ativas</Badge>
                    </div>
                    <span className="font-medium text-lg">{connectionStats.active}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-yellow-100 text-yellow-800">Pendentes</Badge>
                    </div>
                    <span className="font-medium text-lg">{connectionStats.pending}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-red-100 text-red-800">Suspensas</Badge>
                    </div>
                    <span className="font-medium text-lg">{connectionStats.suspended}</span>
                  </div>
                  <div className="h-px bg-gray-200 my-2"></div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-blue-100 text-blue-800">Total</Badge>
                    </div>
                    <span className="font-medium text-lg">{connectionStats.total}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Uso de IPs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-2">
                  <div className="relative pt-1">
                    <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
                      <div 
                        style={{ width: `${(connectionStats.ipv4_allocated / connectionStats.ipv4_total) * 100}%` }} 
                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                      ></div>
                    </div>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Alocados: {connectionStats.ipv4_allocated}</span>
                    <span>Disponíveis: {connectionStats.ipv4_total - connectionStats.ipv4_allocated}</span>
                    <span>Total: {connectionStats.ipv4_total}</span>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">Utilização: {Math.round((connectionStats.ipv4_allocated / connectionStats.ipv4_total) * 100)}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Equipamentos Populares</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {routerModels.length > 0 ? (
                    routerModels.map(([model, count], index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm">{model}</span>
                        <Badge variant="outline">{count} clientes</Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">Nenhum dado de equipamento disponível</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Radio className="h-5 w-5 text-blue-500" />
                Eventos de Autenticação Recentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Horário</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>IP Atribuído</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentAuthenticationEvents.map((event, index) => (
                      <TableRow key={index}>
                        <TableCell>{event.customer_name}</TableCell>
                        <TableCell>{event.time}</TableCell>
                        <TableCell>
                          <Badge className={
                            event.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }>
                            {event.success ? 'Sucesso' : 'Falha'}
                          </Badge>
                        </TableCell>
                        <TableCell>{event.ip}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="radius" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5 text-blue-500" />
                Configuração do Servidor RADIUS
              </CardTitle>
              <CardDescription>
                Configurações do servidor RADIUS para autenticação PPPoE
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Endereço do Servidor</label>
                    <div className="flex">
                      <Input value="10.0.0.1" readOnly className="bg-gray-50" />
                      <Button variant="ghost" size="icon" className="ml-2">
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Porta de Autenticação</label>
                    <Input value="1812" readOnly className="bg-gray-50" />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Porta de Accounting</label>
                    <Input value="1813" readOnly className="bg-gray-50" />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Segredo Compartilhado</label>
                    <div className="flex">
                      <Input value="••••••••••••••••" type="password" readOnly className="bg-gray-50" />
                      <Button variant="ghost" size="icon" className="ml-2">
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <h3 className="font-medium flex items-center gap-2 text-blue-700 mb-2">
                    <HelpCircle className="h-4 w-4" />
                    Como configurar o cliente RADIUS
                  </h3>
                  <div className="space-y-3 text-sm text-gray-600">
                    <p>
                      Para configurar um roteador para usar este servidor RADIUS para autenticação PPPoE, 
                      siga estas instruções:
                    </p>
                    <ol className="list-decimal ml-5 space-y-1">
                      <li>Acesse a interface administrativa do roteador</li>
                      <li>Navegue até as configurações de RADIUS ou Autenticação</li>
                      <li>Adicione um novo servidor com o endereço IP 10.0.0.1</li>
                      <li>Configure a porta de autenticação como 1812</li>
                      <li>Configure a porta de accounting como 1813</li>
                      <li>Defina o segredo compartilhado conforme fornecido</li>
                      <li>Salve as configurações e reinicie o serviço se necessário</li>
                    </ol>
                    <div className="bg-yellow-50 p-3 rounded border border-yellow-100 mt-3 flex gap-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
                      <p className="text-yellow-700">
                        Mantenha o segredo compartilhado em segurança. Nunca compartilhe esta informação 
                        ou exponha em ambientes públicos.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}