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
  Users,
  RefreshCw,
  Search,
  MoreVertical,
  ExternalLink,
  Lock,
  Unlock,
  SignalHigh,
  Loader2,
  Copy,
  Clock,
  Filter,
  ArrowUpDown,
  Info,
  User,
  FileText,
  Network
} from "lucide-react";

export default function ClientConnectionsList({ router, connections, isLoading, onRefresh }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedConnection, setSelectedConnection] = useState(null);
  const [showClientDetails, setShowClientDetails] = useState(false);
  const [connectionTypeFilter, setConnectionTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("username");
  const [sortOrder, setSortOrder] = useState("asc");

  // Lista de tipos de conexão disponíveis
  const connectionTypes = [
    { value: "all", label: "Todos" },
    { value: "pppoe", label: "PPPoE" },
    { value: "dhcp", label: "DHCP" },
    { value: "hotspot", label: "Hotspot" },
    { value: "static", label: "Estático" }
  ];

  // Filtrar e ordenar conexões
  const filteredConnections = connections
    .filter(conn => {
      const typeMatch = 
        connectionTypeFilter === "all" || conn.connection_type === connectionTypeFilter;
      
      const searchMatch = 
        searchTerm === "" || 
        conn.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conn.ip_address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conn.mac_address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conn.customer_name?.toLowerCase().includes(searchTerm.toLowerCase());
      
      return typeMatch && searchMatch;
    })
    .sort((a, b) => {
      let aValue = a[sortBy] || "";
      let bValue = b[sortBy] || "";
      
      // Tratamento especial para campos numéricos
      if (sortBy === "uptime") {
        aValue = parseUptime(a.uptime || "");
        bValue = parseUptime(b.uptime || "");
      }
      
      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  // Parseamento de uptime para ordenação (converte para segundos)
  const parseUptime = (uptime) => {
    if (!uptime) return 0;
    
    let seconds = 0;
    const parts = uptime.match(/(\d+)([hms])/g);
    
    if (!parts) return 0;
    
    parts.forEach(part => {
      const value = parseInt(part.match(/\d+/)[0]);
      const unit = part.match(/[hms]/)[0];
      
      if (unit === 'h') seconds += value * 3600;
      else if (unit === 'm') seconds += value * 60;
      else if (unit === 's') seconds += value;
    });
    
    return seconds;
  };

  // Formato legível de uptime
  const formatUptime = (uptime) => {
    if (!uptime) return "-";
    return uptime;
  };

  // Alternar ordem de classificação
  const toggleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  // Formatação de MAC address
  const formatMac = (mac) => {
    if (!mac) return "-";
    
    // Verifica se o MAC já está formatado
    if (mac.includes(":") || mac.includes("-")) return mac;
    
    // Formata MAC para o formato XX:XX:XX:XX:XX:XX
    return mac.match(/.{1,2}/g)?.join(":").toUpperCase() || mac;
  };

  // Lidar com ação de bloqueio
  const handleBlockClient = (connection) => {
    if (window.confirm(`Você tem certeza que deseja bloquear o cliente ${connection.username || connection.ip_address}?`)) {
      alert(`Bloqueio do cliente ${connection.username || connection.ip_address} em implementação.`);
    }
  };

  // Lidar com ação de desconexão
  const handleDisconnectClient = (connection) => {
    if (window.confirm(`Você tem certeza que deseja desconectar o cliente ${connection.username || connection.ip_address}?`)) {
      alert(`Desconexão do cliente ${connection.username || connection.ip_address} em implementação.`);
    }
  };

  // Visualizar detalhes do cliente
  const handleViewDetails = (connection) => {
    setSelectedConnection(connection);
    setShowClientDetails(true);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" /> 
              Clientes Conectados
            </CardTitle>
            <CardDescription>
              Lista de clientes atualmente conectados ao roteador {router.name}
            </CardDescription>
          </div>
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
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input 
              placeholder="Buscar por nome, IP ou MAC..." 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            <Select 
              value={connectionTypeFilter}
              onValueChange={setConnectionTypeFilter}
            >
              <SelectTrigger className="w-[180px]">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <span>Tipo de Conexão</span>
                </div>
              </SelectTrigger>
              <SelectContent>
                {connectionTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="w-6 h-6 text-blue-600 animate-spin mr-2" />
            <span>Carregando conexões...</span>
          </div>
        ) : (
          <>
            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => toggleSort("username")}
                    >
                      <div className="flex items-center gap-1">
                        Cliente/Usuário
                        {sortBy === "username" && (
                          <ArrowUpDown className="w-3.5 h-3.5 text-gray-500" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => toggleSort("ip_address")}
                    >
                      <div className="flex items-center gap-1">
                        Endereço IP
                        {sortBy === "ip_address" && (
                          <ArrowUpDown className="w-3.5 h-3.5 text-gray-500" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead>MAC / Interface</TableHead>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => toggleSort("uptime")}
                    >
                      <div className="flex items-center gap-1">
                        Tempo Conectado
                        {sortBy === "uptime" && (
                          <ArrowUpDown className="w-3.5 h-3.5 text-gray-500" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead>Info</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredConnections.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6 text-gray-500">
                        Nenhuma conexão encontrada.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredConnections.map((connection) => (
                      <TableRow key={`${connection.ip_address}-${connection.mac_address}`}>
                        <TableCell>
                          <div className="font-medium">{connection.username || "N/D"}</div>
                          <div className="text-xs text-gray-500">
                            {connection.customer_name === "Não associado" 
                              ? <Badge variant="outline" className="text-gray-500">Não associado</Badge>
                              : connection.customer_name
                            }
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-mono text-sm">{connection.ip_address}</div>
                          <div className="text-xs text-gray-500">
                            {connection.connection_type && (
                              <Badge variant="secondary" className="text-xs">
                                {connection.connection_type === "pppoe" ? "PPPoE" : 
                                 connection.connection_type === "dhcp" ? "DHCP" :
                                 connection.connection_type === "hotspot" ? "Hotspot" : 
                                 connection.connection_type}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-mono text-xs">{formatMac(connection.mac_address)}</div>
                          <div className="text-xs text-gray-500">{connection.interface || "-"}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5 text-gray-500" />
                            <span>{formatUptime(connection.uptime)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {connection.plan && (
                            <Badge className="bg-blue-100 text-blue-800">
                              {connection.plan}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Ações</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => handleViewDetails(connection)}>
                                <Info className="h-4 w-4 mr-2" />
                                Ver detalhes
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(connection.ip_address)}>
                                <Copy className="h-4 w-4 mr-2" />
                                Copiar IP
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleDisconnectClient(connection)}>
                                <Unlock className="h-4 w-4 mr-2" />
                                Desconectar
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleBlockClient(connection)} className="text-red-600">
                                <Lock className="h-4 w-4 mr-2" />
                                Bloquear
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            
            <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
              <div>
                Total de clientes conectados: <span className="font-medium">{filteredConnections.length}</span>
              </div>
              {connections.length > 0 && filteredConnections.length !== connections.length && (
                <div>
                  Exibindo <span className="font-medium">{filteredConnections.length}</span> de <span className="font-medium">{connections.length}</span> conexões
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
      
      {/* Modal de detalhes do cliente */}
      <Dialog open={showClientDetails} onOpenChange={setShowClientDetails}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Detalhes da Conexão</DialogTitle>
            <DialogDescription>
              Informações detalhadas sobre a conexão do cliente
            </DialogDescription>
          </DialogHeader>
          
          {selectedConnection && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-gray-500">Cliente</Label>
                  <div className="font-medium">{selectedConnection.customer_name || "Não associado"}</div>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Username</Label>
                  <div className="font-medium">{selectedConnection.username || "N/D"}</div>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Endereço IP</Label>
                  <div className="font-mono">{selectedConnection.ip_address}</div>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">MAC Address</Label>
                  <div className="font-mono">{formatMac(selectedConnection.mac_address)}</div>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Tipo de Conexão</Label>
                  <div>{selectedConnection.connection_type?.toUpperCase() || "N/D"}</div>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Tempo Conectado</Label>
                  <div>{formatUptime(selectedConnection.uptime)}</div>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Interface</Label>
                  <div>{selectedConnection.interface || "N/D"}</div>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Plano</Label>
                  <div>{selectedConnection.plan || "N/D"}</div>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <Label className="text-xs text-gray-500 mb-2">Uso de Banda</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <ArrowUpDown className="h-4 w-4 text-blue-600" />
                    <div>
                      <div className="text-sm">Download</div>
                      <div className="font-medium">{selectedConnection.download_usage ? `${(selectedConnection.download_usage / (1024 * 1024)).toFixed(2)} MB` : "N/D"}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <ArrowUpDown className="h-4 w-4 text-green-600" />
                    <div>
                      <div className="text-sm">Upload</div>
                      <div className="font-medium">{selectedConnection.upload_usage ? `${(selectedConnection.upload_usage / (1024 * 1024)).toFixed(2)} MB` : "N/D"}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setShowClientDetails(false)}>
              Fechar
            </Button>
            <Button variant="default" className="gap-1" onClick={() => alert("Em implementação")}>
              <User className="h-4 w-4" />
              Ver Perfil
            </Button>
            <Button variant="secondary" className="gap-1" onClick={() => alert("Em implementação")}>
              <Network className="h-4 w-4" />
              Monitorar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}