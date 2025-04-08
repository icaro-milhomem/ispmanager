import React, { useState, useEffect, useRef } from 'react';
import { Equipment } from "@/api/entities";
import { Customer } from "@/api/entities";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Network, 
  Search, 
  Router, 
  Layers,
  Wifi,
  Server,
  Radio,
  Monitor,
  Settings,
  Download,
  ZoomIn,
  ZoomOut,
  RefreshCw,
  Maximize,
  Link2,
  User
} from "lucide-react";

// Importar componentes para o mapa de rede
import NetworkNode from "../components/network/NetworkNode";
import NetworkConnection from "../components/network/NetworkConnection";
import EquipmentDetails from "../components/equipment/EquipmentDetails";

export default function NetworkMapPage() {
  const [equipment, setEquipment] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedNode, setSelectedNode] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [showDetails, setShowDetails] = useState(false);
  const mapRef = useRef(null);
  
  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = async () => {
    try {
      setLoading(true);
      const equipmentData = await Equipment.list();
      const customersData = await Customer.list();
      
      setEquipment(equipmentData);
      setCustomers(customersData);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.1, 1.5));
  };
  
  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.1, 0.5));
  };
  
  const handleReset = () => {
    setZoom(1);
  };
  
  const getCustomerName = (customerId) => {
    const customer = customers.find(c => c.id === customerId);
    return customer ? customer.full_name : null;
  };
  
  // Organiza equipamentos por categorias
  const categorizeEquipment = () => {
    return {
      core: equipment.filter(e => e.type === 'router' || e.type === 'olt'),
      distribution: equipment.filter(e => e.type === 'switch'),
      access: equipment.filter(e => e.type === 'ont' || e.type === 'radio'),
      others: equipment.filter(e => !['router', 'switch', 'ont', 'olt', 'radio'].includes(e.type))
    };
  };
  
  const categories = categorizeEquipment();
  
  // Filtrar equipamentos com base na busca
  const filteredEquipment = equipment.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.ip_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Mapa da Rede</h1>
          <p className="text-gray-500">Visualização topológica da sua infraestrutura</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadData} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Atualizar
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Exportar
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="md:w-3/4">
          <Card className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Network className="w-5 h-5 text-blue-600" />
                  Topologia de Rede
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={handleZoomIn}>
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={handleZoomOut}>
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={handleReset}>
                    <Maximize className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <CardDescription>
                {filteredEquipment.length} equipamentos visualizados
              </CardDescription>
            </CardHeader>
            <CardContent className="relative">
              {loading ? (
                <div className="h-[600px] flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div 
                  ref={mapRef}
                  className="h-[600px] relative bg-gray-50 rounded-lg overflow-hidden border"
                  style={{ transform: `scale(${zoom})` }}
                >
                  {/* Conexões entre equipamentos */}
                  <svg className="absolute inset-0 w-full h-full">
                    {/* Conexões Core -> Distribution */}
                    {categories.core.flatMap(core => 
                      categories.distribution.map(dist => (
                        <NetworkConnection 
                          key={`${core.id}-${dist.id}`}
                          x1="50%" y1="100"
                          x2={`${(categories.distribution.indexOf(dist) + 1) * (100 / (categories.distribution.length + 1))}%`} 
                          y2="200"
                          status={core.status === 'online' && dist.status === 'online' ? 'active' : 'inactive'}
                        />
                      ))
                    )}
                    
                    {/* Conexões Distribution -> Access */}
                    {categories.distribution.flatMap(dist => 
                      categories.access
                        .filter((_, idx) => idx % categories.distribution.length === categories.distribution.indexOf(dist) % categories.distribution.length)
                        .map(access => (
                          <NetworkConnection 
                            key={`${dist.id}-${access.id}`}
                            x1={`${(categories.distribution.indexOf(dist) + 1) * (100 / (categories.distribution.length + 1))}%`} 
                            y1="200"
                            x2={`${(categories.access.indexOf(access) + 1) * (100 / (categories.access.length + 1))}%`} 
                            y2="300"
                            status={dist.status === 'online' && access.status === 'online' ? 'active' : 'inactive'}
                          />
                        ))
                    )}
                  </svg>
                  
                  {/* Layer 1: Core (Roteadores, OLTs) */}
                  <div className="absolute top-16 left-0 right-0 flex justify-center gap-10">
                    {categories.core.map(item => (
                      <NetworkNode 
                        key={item.id}
                        equipment={item}
                        size="lg"
                        label={item.name}
                        onClick={() => setSelectedNode(item)}
                        isSelected={selectedNode?.id === item.id}
                      />
                    ))}
                  </div>
                  
                  {/* Layer 2: Distribution (Switches) */}
                  <div className="absolute top-48 left-0 right-0 flex justify-around px-10">
                    {categories.distribution.map(item => (
                      <NetworkNode 
                        key={item.id}
                        equipment={item}
                        size="md"
                        label={item.name}
                        onClick={() => setSelectedNode(item)}
                        isSelected={selectedNode?.id === item.id}
                      />
                    ))}
                  </div>
                  
                  {/* Layer 3: Access (ONTs, CPEs, Radios) */}
                  <div className="absolute top-80 left-0 right-0 flex flex-wrap justify-around px-6 gap-4">
                    {categories.access.map(item => (
                      <NetworkNode 
                        key={item.id}
                        equipment={item}
                        size="sm"
                        label={item.name}
                        customer={getCustomerName(item.customer_id)}
                        onClick={() => setSelectedNode(item)}
                        isSelected={selectedNode?.id === item.id}
                      />
                    ))}
                  </div>
                  
                  {/* Legend */}
                  <div className="absolute bottom-4 right-4 bg-white p-3 rounded-lg shadow-sm border flex gap-4 text-xs">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span>Online</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <span>Offline</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <span>Manutenção</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div className="md:w-1/4 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Filtrar Equipamentos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar equipamentos..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="pl-10"
                />
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Router className="w-4 h-4 text-blue-600" />
                    <span>Roteadores/OLTs</span>
                  </div>
                  <Badge>{categories.core.length}</Badge>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-purple-600" />
                    <span>Switches</span>
                  </div>
                  <Badge>{categories.distribution.length}</Badge>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Wifi className="w-4 h-4 text-green-600" />
                    <span>ONTs/CPEs</span>
                  </div>
                  <Badge>{categories.access.length}</Badge>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Settings className="w-4 h-4 text-gray-600" />
                    <span>Outros</span>
                  </div>
                  <Badge>{categories.others.length}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {selectedNode && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Server className="w-5 h-5 text-blue-600" />
                  Detalhes do Equipamento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{selectedNode.name}</h3>
                  <Badge 
                    className={
                      selectedNode.status === 'online' 
                        ? 'bg-green-100 text-green-800' 
                        : selectedNode.status === 'offline'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                    }
                  >
                    {selectedNode.status}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-gray-500">Tipo</p>
                    <p className="font-medium capitalize">{selectedNode.type}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Modelo</p>
                    <p className="font-medium">{selectedNode.model || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">IP</p>
                    <p className="font-medium">{selectedNode.ip_address}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">MAC</p>
                    <p className="font-medium">{selectedNode.mac_address || "N/A"}</p>
                  </div>
                  
                  {selectedNode.customer_id && (
                    <div className="col-span-2">
                      <p className="text-gray-500">Cliente</p>
                      <div className="font-medium flex items-center gap-1">
                        <User className="w-4 h-4 text-gray-400" />
                        {getCustomerName(selectedNode.customer_id)}
                      </div>
                    </div>
                  )}
                  
                  <div className="col-span-2">
                    <p className="text-gray-500">Localização</p>
                    <p className="font-medium">{selectedNode.location || "N/A"}</p>
                  </div>
                </div>
                
                <div className="pt-2 flex justify-end">
                  <Button 
                    className="w-full gap-2"
                    onClick={() => {
                      setShowDetails(true);
                    }}
                  >
                    <Link2 className="w-4 h-4" />
                    Ver Detalhes Completos
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Estatísticas */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Status da Rede</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Equipamentos Online</span>
                  <span className="font-medium text-green-600">
                    {equipment.filter(e => e.status === 'online').length}/{equipment.length}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-green-600 h-2.5 rounded-full" 
                    style={{ width: `${(equipment.filter(e => e.status === 'online').length / equipment.length) * 100}%` }}
                  ></div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm">ONTs de Clientes</span>
                  <span className="font-medium text-blue-600">
                    {equipment.filter(e => e.type === 'ont' && e.customer_id).length}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm">Manutenção Pendente</span>
                  <span className="font-medium text-yellow-600">
                    {equipment.filter(e => e.status === 'manutenção').length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Modal de detalhes completos */}
      {showDetails && selectedNode && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl">
            <EquipmentDetails
              equipment={selectedNode}
              customerName={getCustomerName(selectedNode.customer_id)}
              onEdit={() => {
                setShowDetails(false);
              }}
              onClose={() => {
                setShowDetails(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}