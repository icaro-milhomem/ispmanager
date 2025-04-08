
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Database,
  RefreshCw,
  Search,
  MoreVertical,
  ExternalLink,
  Loader2,
  Copy,
  Clock,
  Users,
  PlusCircle,
  Trash2,
  Edit,
  Zap,
  ArrowUpDown,
  Info,
  Link,
  List,
  CheckCircle,
  XCircle,
  Activity,
  Download,
  Settings,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function IPPoolManager({ router, pools, isLoading, onRefresh }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddPoolDialog, setShowAddPoolDialog] = useState(false);
  const [showIPsDialog, setShowIPsDialog] = useState(false);
  const [selectedPool, setSelectedPool] = useState(null);
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [formData, setFormData] = useState({
    name: "",
    start_address: "",
    end_address: "",
    service_type: "pppoe",
    is_static: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const serviceTypes = [
    { value: "pppoe", label: "PPPoE" },
    { value: "dhcp", label: "DHCP" },
    { value: "hotspot", label: "Hotspot" },
    { value: "outros", label: "Outros" }
  ];
  
  const filteredPools = pools
    .filter(pool => {
      return searchTerm === "" || 
        pool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pool.start_address.includes(searchTerm) ||
        pool.end_address.includes(searchTerm);
    })
    .sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (["total_ips", "used_ips", "available_ips"].includes(sortBy)) {
        aValue = Number(aValue);
        bValue = Number(bValue);
      }
      
      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  
  const toggleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };
  
  const calculatePoolStats = () => {
    let totalIPs = 0;
    let usedIPs = 0;
    let availableIPs = 0;
    
    pools.forEach(pool => {
      totalIPs += pool.total_ips || 0;
      usedIPs += pool.used_ips || 0;
      availableIPs += pool.available_ips || 0;
    });
    
    const usagePercentage = totalIPs > 0 ? Math.round((usedIPs / totalIPs) * 100) : 0;
    
    return {
      totalIPs,
      usedIPs,
      availableIPs,
      usagePercentage
    };
  };
  
  const getPoolUtilization = (pool) => {
    const utilization = pool.total_ips > 0 
      ? Math.round((pool.used_ips / pool.total_ips) * 100) 
      : 0;
    
    return utilization;
  };
  
  const getUtilizationClass = (utilization) => {
    if (utilization >= 90) return "text-red-600";
    if (utilization >= 70) return "text-yellow-600";
    return "text-green-600";
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const handleSwitchChange = (checked) => {
    setFormData({ ...formData, is_static: checked });
  };
  
  const handleSelectChange = (value) => {
    setFormData({ ...formData, service_type: value });
  };
  
  const handleViewIPs = (pool) => {
    setSelectedPool(pool);
    setShowIPsDialog(true);
  };
  
  const handleAddPool = async () => {
    setIsSubmitting(true);
    
    try {
      if (!formData.name || !formData.start_address || !formData.end_address) {
        alert("Todos os campos obrigatórios devem ser preenchidos.");
        setIsSubmitting(false);
        return;
      }
      
      setTimeout(() => {
        setShowAddPoolDialog(false);
        setFormData({
          name: "",
          start_address: "",
          end_address: "",
          service_type: "pppoe",
          is_static: false
        });
        onRefresh(); 
        setIsSubmitting(false);
      }, 1500);
      
    } catch (error) {
      console.error("Erro ao adicionar pool:", error);
      setIsSubmitting(false);
      alert("Ocorreu um erro ao adicionar a pool. Tente novamente.");
    }
  };
  
  const handleDeletePool = (pool) => {
    if (window.confirm(`Você tem certeza que deseja excluir a pool "${pool.name}"?`)) {
      alert(`Exclusão da pool "${pool.name}" em implementação.`);
    }
  };
  
  const stats = calculatePoolStats();
  
  const mockIPs = [
    { 
      ip: "192.168.1.100", 
      status: "active", 
      customer_name: "João Silva", 
      assignment_type: "static",
      mac_address: "00:11:22:33:44:55",
      last_seen: "2023-06-15T14:30:00"
    },
    { 
      ip: "192.168.1.101", 
      status: "active", 
      customer_name: "Maria Oliveira", 
      assignment_type: "dynamic",
      mac_address: "AA:BB:CC:DD:EE:FF",
      last_seen: "2023-06-15T15:40:00" 
    },
    { 
      ip: "192.168.1.102", 
      status: "reserved", 
      customer_name: "Carlos Santos", 
      assignment_type: "static",
      mac_address: null,
      last_seen: null
    },
    { 
      ip: "192.168.1.103", 
      status: "available", 
      customer_name: null, 
      assignment_type: null,
      mac_address: null,
      last_seen: null
    },
    { 
      ip: "192.168.1.104", 
      status: "available", 
      customer_name: null, 
      assignment_type: null,
      mac_address: null,
      last_seen: null
    }
  ];
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-blue-600" /> 
              Pools de Endereços IP
            </CardTitle>
            <CardDescription>
              Gerenciamento de pools de endereços IP no roteador {router.name}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
              className="gap-1"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Atualizar
            </Button>
            
            <Button 
              size="sm"
              onClick={() => setShowAddPoolDialog(true)}
              className="gap-1 bg-blue-600 hover:bg-blue-700"
            >
              <PlusCircle className="h-4 w-4" />
              Nova Pool
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Database className="h-5 w-5 text-blue-600" />
                <h3 className="font-medium">Total de Pools</h3>
              </div>
              <div className="text-2xl font-bold text-blue-700">{pools.length}</div>
            </CardContent>
          </Card>
          
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4">
              <div className="flex justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="h-5 w-5 text-green-600" />
                    <h3 className="font-medium">Utilização</h3>
                  </div>
                  <div className="text-2xl font-bold text-green-700">
                    {stats.usedIPs} / {stats.totalIPs}
                  </div>
                </div>
                <div className="text-xl font-bold text-green-700">
                  {stats.usagePercentage}%
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Activity className="h-5 w-5 text-purple-600" />
                <h3 className="font-medium">IPs Disponíveis</h3>
              </div>
              <div className="text-2xl font-bold text-purple-700">{stats.availableIPs}</div>
            </CardContent>
          </Card>
        </div>
        
        <div className="flex items-center gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input 
              placeholder="Buscar pools por nome ou faixa de IPs..." 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="w-6 h-6 text-blue-600 animate-spin mr-2" />
            <span>Carregando pools de IPs...</span>
          </div>
        ) : (
          <>
            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => toggleSort("name")}
                    >
                      <div className="flex items-center gap-1">
                        Nome da Pool
                        {sortBy === "name" && (
                          <ArrowUpDown className="w-3.5 h-3.5 text-gray-500" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead>Faixa de IPs</TableHead>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => toggleSort("total_ips")}
                    >
                      <div className="flex items-center gap-1">
                        Total IPs
                        {sortBy === "total_ips" && (
                          <ArrowUpDown className="w-3.5 h-3.5 text-gray-500" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => toggleSort("used_ips")}
                    >
                      <div className="flex items-center gap-1">
                        Em Uso
                        {sortBy === "used_ips" && (
                          <ArrowUpDown className="w-3.5 h-3.5 text-gray-500" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => toggleSort("available_ips")}
                    >
                      <div className="flex items-center gap-1">
                        Disponíveis
                        {sortBy === "available_ips" && (
                          <ArrowUpDown className="w-3.5 h-3.5 text-gray-500" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead>Utilização</TableHead>
                    <TableHead>Serviço</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPools.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-6 text-gray-500">
                        Nenhuma pool de IPs encontrada.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPools.map((pool) => {
                      const utilization = getPoolUtilization(pool);
                      const utilizationClass = getUtilizationClass(utilization);
                      
                      return (
                        <TableRow key={pool.id}>
                          <TableCell>
                            <div className="font-medium">{pool.name}</div>
                            <div className="text-xs text-gray-500">
                              {pool.is_static ? (
                                <Badge variant="outline" className="text-blue-600 border-blue-200">
                                  Estático
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-green-600 border-green-200">
                                  Dinâmico
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-mono text-sm">{pool.start_address} - {pool.end_address}</div>
                            <div className="text-xs text-gray-500">{pool.subnet}</div>
                          </TableCell>
                          <TableCell className="font-medium">{pool.total_ips}</TableCell>
                          <TableCell className="font-medium text-red-600">{pool.used_ips}</TableCell>
                          <TableCell className="font-medium text-green-600">{pool.available_ips}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <div className="w-24 h-2 bg-gray-200 rounded-full mr-2">
                                <div 
                                  className={`h-full rounded-full ${
                                    utilization >= 90 ? 'bg-red-500' : 
                                    utilization >= 70 ? 'bg-yellow-500' : 
                                    'bg-green-500'
                                  }`}
                                  style={{ width: `${utilization}%` }}
                                ></div>
                              </div>
                              <span className={utilizationClass}>{utilization}%</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={
                              pool.service_type === "pppoe" ? "bg-indigo-100 text-indigo-800" :
                              pool.service_type === "dhcp" ? "bg-amber-100 text-amber-800" :
                              pool.service_type === "hotspot" ? "bg-orange-100 text-orange-800" :
                              "bg-gray-100 text-gray-800"
                            }>
                              {pool.service_type === "pppoe" ? "PPPoE" :
                               pool.service_type === "dhcp" ? "DHCP" :
                               pool.service_type === "hotspot" ? "Hotspot" :
                               pool.service_type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleViewIPs(pool)}
                                className="h-8 w-8"
                              >
                                <List className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="h-8 w-8"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleDeletePool(pool)}
                                className="h-8 w-8 text-red-500"
                              >
                                <Trash2 className="h-4 w-4" />
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
            
            <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
              <div>
                Total de pools: <span className="font-medium">{filteredPools.length}</span>
              </div>
              {pools.length > 0 && filteredPools.length !== pools.length && (
                <div>
                  Exibindo <span className="font-medium">{filteredPools.length}</span> de <span className="font-medium">{pools.length}</span> pools
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
      
      <Dialog open={showAddPoolDialog} onOpenChange={setShowAddPoolDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar Nova Pool de IPs</DialogTitle>
            <DialogDescription>
              Crie uma nova pool de endereços IP no roteador {router.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="pool-name">Nome da Pool</Label>
              <Input
                id="pool-name"
                name="name"
                placeholder="Ex: Pool-PPPoE"
                value={formData.name}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-address">Endereço Inicial</Label>
                <Input
                  id="start-address"
                  name="start_address"
                  placeholder="Ex: 192.168.0.2"
                  value={formData.start_address}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="end-address">Endereço Final</Label>
                <Input
                  id="end-address"
                  name="end_address"
                  placeholder="Ex: 192.168.0.254"
                  value={formData.end_address}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="service-type">Tipo de Serviço</Label>
              <Select
                value={formData.service_type}
                onValueChange={handleSelectChange}
              >
                <SelectTrigger id="service-type">
                  <SelectValue placeholder="Selecione o serviço" />
                </SelectTrigger>
                <SelectContent>
                  {serviceTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="is-static">Pool de IPs Estáticos</Label>
                <p className="text-sm text-gray-500">
                  Ative para reservar IPs para alocação estática
                </p>
              </div>
              <Switch
                id="is-static"
                checked={formData.is_static}
                onCheckedChange={handleSwitchChange}
              />
            </div>
          </div>
          
          <Alert className="mt-2 bg-blue-50 border-blue-200">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              A pool será criada no roteador e sincronizada com o sistema.
            </AlertDescription>
          </Alert>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setShowAddPoolDialog(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button 
              type="button"
              onClick={handleAddPool}
              disabled={isSubmitting}
              className="gap-1"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Criando...
                </>
              ) : (
                <>
                  <PlusCircle className="h-4 w-4" />
                  Criar Pool
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={showIPsDialog} onOpenChange={setShowIPsDialog}>
        <DialogContent className="sm:max-w-5xl">
          <DialogHeader>
            <DialogTitle>IPs da Pool: {selectedPool?.name}</DialogTitle>
            <DialogDescription>
              Visualizando endereços IP e suas atribuições
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="font-medium">
                  Faixa: {selectedPool?.start_address} - {selectedPool?.end_address}
                </span>
                <span className="ml-4 text-sm text-gray-500">
                  Total: {selectedPool?.total_ips} IPs | 
                  Em uso: {selectedPool?.used_ips} | 
                  Disponíveis: {selectedPool?.available_ips}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Input 
                  placeholder="Buscar IP ou cliente..." 
                  className="w-[250px]"
                />
                <Button variant="outline" size="sm" className="gap-1">
                  <Search className="h-4 w-4" />
                  Buscar
                </Button>
              </div>
            </div>
            
            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Endereço IP</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>MAC Address</TableHead>
                    <TableHead>Última Atividade</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockIPs.map((ip) => (
                    <TableRow key={ip.ip}>
                      <TableCell className="font-mono">{ip.ip}</TableCell>
                      <TableCell>
                        <Badge className={
                          ip.status === "active" ? "bg-green-100 text-green-800" :
                          ip.status === "reserved" ? "bg-blue-100 text-blue-800" :
                          ip.status === "expired" ? "bg-red-100 text-red-800" :
                          "bg-gray-100 text-gray-800"
                        }>
                          {ip.status === "active" ? "Ativo" :
                           ip.status === "reserved" ? "Reservado" :
                           ip.status === "expired" ? "Expirado" :
                           "Disponível"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {ip.customer_name || (
                          <span className="text-gray-400">Não atribuído</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {ip.assignment_type && (
                          <Badge variant="outline" className={
                            ip.assignment_type === "static" ? "border-blue-200 text-blue-800" :
                            "border-green-200 text-green-800"
                          }>
                            {ip.assignment_type === "static" ? "Estático" : "Dinâmico"}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {ip.mac_address || "-"}
                      </TableCell>
                      <TableCell>
                        {ip.last_seen ? (
                          <span>{new Date(ip.last_seen).toLocaleString()}</span>
                        ) : (
                          <span>-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {ip.status === "available" ? (
                            <Button variant="ghost" size="sm" className="h-8 text-blue-600">
                              Atribuir
                            </Button>
                          ) : (
                            <>
                              <Button variant="ghost" size="sm" className="h-8">
                                Detalhes
                              </Button>
                              <Button variant="ghost" size="sm" className="h-8 text-red-600">
                                Liberar
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
          
          <DialogFooter className="flex justify-between items-center">
            <div>
              <Badge variant="outline" className="mr-2">Página 1 de 10</Badge>
              <span className="text-sm text-gray-500">Exibindo 5 de 254 IPs</span>
            </div>
            
            <div className="flex gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowIPsDialog(false)}
              >
                Fechar
              </Button>
              <Button 
                type="button"
                className="gap-1"
                onClick={() => alert("Em implementação")}
              >
                <Download className="h-4 w-4" />
                Exportar Lista
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
