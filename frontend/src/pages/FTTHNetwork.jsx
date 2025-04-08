
import React, { useState, useEffect } from "react";
import { 
  Network,
  Plus,
  MapPin,
  Search, 
  Filter,
  Eye,
  EyeOff,
  Download,
  Wifi,
  Box,
  Layers,
  Router,
  LineChart,
  Home,
  Cable,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import CTOViewer from "../components/ftth/CTOViewer";
import CTOForm from "../components/ftth/CTOForm";
import NetworkTopology from "../components/ftth/NetworkTopology";
import FTTHMap from "../components/ftth/FTTHMap";
import MapDocumentation from "../components/ftth/MapDocumentation"; // Importando o componente de documentação do mapa

export default function FTTHNetworkPage() {
  const [ctos, setCTOs] = useState([]);
  const [selectedCTO, setSelectedCTO] = useState(null);
  const [showCTOForm, setShowCTOForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("map");
  
  const [networkElements, setNetworkElements] = useState([]);
  const [fiberPaths, setFiberPaths] = useState([]);
  
  const generateNetworkData = () => {
    const oltCount = ctos.length > 10 ? 2 : 1;
    const olts = Array.from({ length: oltCount }, (_, i) => ({
      id: `olt-${i+1}`,
      name: `OLT-${i+1}`,
      type: "OLT",
      status: "online",
      capacity: 128,
      utilization: Math.floor(Math.random() * 80) + 10
    }));
    
    const ctoNodes = ctos.map(cto => ({
      id: cto.id,
      name: cto.name,
      type: "CTO",
      status: "online",
      capacity: cto.properties?.capacity || 16,
      utilization: cto.ports ? (cto.ports.length / cto.properties?.capacity) * 100 : 0,
      address: cto.properties?.address || ""
    }));
    
    const splitterCount = Math.max(1, Math.floor(ctos.length / 3));
    const splitters = Array.from({ length: splitterCount }, (_, i) => ({
      id: `splitter-${i+1}`,
      name: `Splitter-${i+1}`,
      type: "SPLITTER",
      status: "online",
      capacity: 8,
      utilization: Math.floor(Math.random() * 90) + 10
    }));
    
    const clientNodes = [];
    ctos.forEach((cto, ctoIndex) => {
      if (cto.ports && cto.ports.length > 0) {
        cto.ports.forEach((port, portIndex) => {
          if (port.client_name) {
            clientNodes.push({
              id: `client-${ctoIndex}-${portIndex}`,
              name: port.client_name,
              type: "CLIENT",
              status: port.status === "active" ? "online" : "offline",
              port: port.number
            });
          }
        });
      }
    });
    
    const links = [];
    
    ctoNodes.forEach((cto, index) => {
      const oltIndex = oltCount > 1 ? index % oltCount : 0;
      links.push({
        id: `link-olt-${oltIndex+1}-${cto.id}`,
        source: olts[oltIndex].id,
        target: cto.id,
        type: "backbone",
        capacity: 144
      });
    });
    
    if (splitters.length > 0 && ctoNodes.length > 3) {
      for (let i = 0; i < Math.min(ctoNodes.length, splitters.length * 4); i++) {
        const splitterIndex = i % splitters.length;
        links.push({
          id: `link-splitter-${splitters[splitterIndex].id}-${ctoNodes[i].id}`,
          source: splitters[splitterIndex].id,
          target: ctoNodes[i].id,
          type: "distribution",
          capacity: 36
        });
      }
      
      splitters.forEach((splitter, index) => {
        const oltIndex = oltCount > 1 ? index % oltCount : 0;
        links.push({
          id: `link-olt-${oltIndex+1}-${splitter.id}`,
          source: olts[oltIndex].id,
          target: splitter.id,
          type: "backbone",
          capacity: 144
        });
      });
    }
    
    clientNodes.forEach(client => {
      const ctoIndex = parseInt(client.id.split('-')[1]);
      if (ctoNodes[ctoIndex]) {
        links.push({
          id: `link-${ctoNodes[ctoIndex].id}-${client.id}`,
          source: ctoNodes[ctoIndex].id,
          target: client.id,
          type: "drop",
          capacity: 1
        });
      }
    });
    
    const allNodes = [...olts, ...splitters, ...ctoNodes, ...clientNodes];
    
    return {
      nodes: allNodes,
      links: links
    };
  };

  const [networkData, setNetworkData] = useState({ nodes: [], links: [] });

  useEffect(() => {
    loadCTOs();
  }, []);

  useEffect(() => {
    if (ctos.length > 0) {
      const generatedData = generateNetworkData();
      setNetworkData(generatedData);
      
      const mapElements = [];
      const mapFiberPaths = [];
      
      generatedData.nodes.filter(node => node.type === "OLT").forEach(olt => {
        mapElements.push({
          id: olt.id,
          name: olt.name,
          type: "OLT",
          position: {
            lat: -23.550520 - (Math.random() * 0.01),
            lng: -46.633308 - (Math.random() * 0.01)
          },
          properties: {
            capacity: olt.capacity,
            utilization: olt.utilization,
            status: olt.status
          }
        });
      });
      
      ctos.forEach(cto => {
        if (cto.position && cto.position.lat && cto.position.lng) {
          mapElements.push({
            id: cto.id,
            name: cto.name,
            type: "CTO",
            position: cto.position,
            properties: {
              ...cto.properties,
              portCount: cto.ports ? cto.ports.length : 0
            }
          });
        }
      });
      
      generatedData.nodes.filter(node => node.type === "SPLITTER").forEach(splitter => {
        mapElements.push({
          id: splitter.id,
          name: splitter.name,
          type: "SPLITTER",
          position: {
            lat: -23.550520 + (Math.random() * 0.01),
            lng: -46.633308 + (Math.random() * 0.01)
          },
          properties: {
            capacity: splitter.capacity,
            utilization: splitter.utilization,
            status: splitter.status
          }
        });
      });
      
      ctos.forEach(cto => {
        if (cto.position && cto.ports && cto.ports.length > 0) {
          cto.ports.forEach((port, index) => {
            if (port.client_name) {
              mapElements.push({
                id: `client-${cto.id}-${port.number}`,
                name: port.client_name,
                type: "BUILDING",
                position: {
                  lat: cto.position.lat + (Math.random() * 0.002 - 0.001),
                  lng: cto.position.lng + (Math.random() * 0.002 - 0.001)
                },
                properties: {
                  ctoId: cto.id,
                  portNumber: port.number,
                  status: port.status
                }
              });
            }
          });
        }
      });
      
      generatedData.links.forEach(link => {
        const source = generatedData.nodes.find(n => n.id === link.source);
        const target = generatedData.nodes.find(n => n.id === link.target);
        
        if (source && target) {
          const sourceElement = mapElements.find(e => e.id === source.id);
          const targetElement = mapElements.find(e => e.id === target.id);
          
          if (sourceElement && targetElement && sourceElement.position && targetElement.position) {
            const midPoints = [];
            const pointCount = Math.floor(Math.random() * 3) + 1;
            
            for (let i = 0; i < pointCount; i++) {
              const ratio = (i + 1) / (pointCount + 1);
              
              const jitterLat = Math.random() * 0.001 - 0.0005;
              const jitterLng = Math.random() * 0.001 - 0.0005;
              
              midPoints.push({
                lat: sourceElement.position.lat + (targetElement.position.lat - sourceElement.position.lat) * ratio + jitterLat,
                lng: sourceElement.position.lng + (targetElement.position.lng - sourceElement.position.lng) * ratio + jitterLng
              });
            }
            
            const coordinates = [
              sourceElement.position,
              ...midPoints,
              targetElement.position
            ];
            
            mapFiberPaths.push({
              id: link.id,
              source: sourceElement.id,
              target: targetElement.id,
              type: link.type,
              coordinates: coordinates,
              properties: {
                capacity: link.capacity,
                length: Math.random() * 500 + 100
              }
            });
          }
        }
      });
      
      setNetworkElements(mapElements);
      setFiberPaths(mapFiberPaths);
    }
  }, [ctos]);

  const loadCTOs = () => {
    const savedCTOs = localStorage.getItem('ctos');
    if (savedCTOs) {
      try {
        const data = JSON.parse(savedCTOs);
        setCTOs(data);
      } catch (e) {
        console.error("Erro ao carregar CTOs:", e);
      }
    }
  };

  const saveCTOs = (newCTOs) => {
    localStorage.setItem('ctos', JSON.stringify(newCTOs));
    setCTOs(newCTOs);
  };

  const handleAddCTO = (ctoData) => {
    const newCTO = {
      ...ctoData,
      id: `cto-${Date.now()}`,
      ports: [],
      created: new Date().toISOString()
    };
    
    const updatedCTOs = [...ctos, newCTO];
    saveCTOs(updatedCTOs);
    setShowCTOForm(false);
  };

  const handleUpdateCTO = (ctoData) => {
    const updatedCTOs = ctos.map(cto => 
      cto.id === ctoData.id ? { ...cto, ...ctoData } : cto
    );
    
    saveCTOs(updatedCTOs);
    setSelectedCTO(null);
    setShowCTOForm(false);
  };

  const handleDeleteCTO = (ctoId) => {
    if (window.confirm("Tem certeza que deseja excluir esta CTO?")) {
      const updatedCTOs = ctos.filter(cto => cto.id !== ctoId);
      saveCTOs(updatedCTOs);
      setSelectedCTO(null);
    }
  };

  const handleAddClient = (cto, portData) => {
    const updatedCTO = {
      ...cto,
      ports: [...(cto.ports || []), portData]
    };
    
    const updatedCTOs = ctos.map(c => 
      c.id === cto.id ? updatedCTO : c
    );
    
    saveCTOs(updatedCTOs);
    setSelectedCTO(updatedCTO);
  };

  const handleNodeClick = (node) => {
    if (node.type === "CTO") {
      const cto = ctos.find(c => c.id === node.id);
      if (cto) {
        setSelectedCTO(cto);
        setShowCTOForm(false);
      }
    }
  };

  const handleMapElementClick = (element) => {
    if (element.type === "CTO") {
      const cto = ctos.find(c => c.id === element.id);
      if (cto) {
        setSelectedCTO(cto);
        setActiveTab("list");
      }
    }
  };
  
  const handleAddMapElement = (element) => {
    if (element.type === "CTO") {
      handleAddCTO(element);
    }
  };

  const filteredCTOs = ctos.filter(cto => 
    cto.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cto.properties?.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cto.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Rede FTTH</h1>
        <Button 
          onClick={() => {
            setShowCTOForm(true);
            setSelectedCTO(null);
          }} 
          className="bg-blue-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova CTO
        </Button>
      </div>

      {showCTOForm && (
        <Card>
          <CardHeader>
            <CardTitle>{selectedCTO ? "Editar CTO" : "Nova CTO"}</CardTitle>
          </CardHeader>
          <CardContent>
            <CTOForm
              cto={selectedCTO}
              onSubmit={selectedCTO ? handleUpdateCTO : handleAddCTO}
              onCancel={() => {
                setShowCTOForm(false);
                setSelectedCTO(null);
              }}
              onDelete={selectedCTO ? () => handleDeleteCTO(selectedCTO.id) : null}
            />
          </CardContent>
        </Card>
      )}

      {ctos.length === 0 && !showCTOForm && (
        <Alert>
          <AlertTitle className="flex items-center gap-2">
            <Info className="h-4 w-4" />
            Nenhuma CTO cadastrada
          </AlertTitle>
          <AlertDescription className="mt-2">
            <p className="mb-2">
              Para começar a usar a visualização de rede, você precisa cadastrar CTOs com suas portas e clientes.
            </p>
            <div className="flex gap-2 mt-3">
              <Button 
                onClick={() => {
                  setShowCTOForm(true);
                  setSelectedCTO(null);
                }}
                size="sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Cadastrar CTO
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  const sampleCTOs = [
                    {
                      id: `cto-${Date.now()}-1`,
                      name: "CTO-001",
                      position: { lat: -23.550520, lng: -46.633308 },
                      properties: {
                        capacity: 16,
                        address: "Av. Paulista, 1000 - São Paulo",
                        notes: "CTO principal do Centro"
                      },
                      ports: [
                        { number: 1, status: 'active', client_name: "João Silva", client_id: "12345" },
                        { number: 2, status: 'active', client_name: "Maria Souza", client_id: "23456" },
                        { number: 3, status: 'blocked', client_name: "Carlos Oliveira", client_id: "34567" }
                      ],
                      created: new Date().toISOString()
                    },
                    {
                      id: `cto-${Date.now()}-2`,
                      name: "CTO-002",
                      position: { lat: -23.555520, lng: -46.638308 },
                      properties: {
                        capacity: 8,
                        address: "Rua Augusta, 500 - São Paulo",
                        notes: "CTO secundária"
                      },
                      ports: [
                        { number: 1, status: 'active', client_name: "Ana Pereira", client_id: "45678" }
                      ],
                      created: new Date().toISOString()
                    },
                    {
                      id: `cto-${Date.now()}-3`,
                      name: "CTO-003",
                      position: { lat: -23.545520, lng: -46.628308 },
                      properties: {
                        capacity: 16,
                        address: "Rua 25 de Março, 100 - São Paulo",
                        notes: "CTO da região comercial"
                      },
                      ports: [
                        { number: 1, status: 'active', client_name: "José Santos", client_id: "56789" },
                        { number: 2, status: 'active', client_name: "Empresa ABC", client_id: "67890" },
                        { number: 3, status: 'active', client_name: "Loja XYZ", client_id: "78901" },
                        { number: 4, status: 'active', client_name: "Restaurante Delícia", client_id: "89012" }
                      ],
                      created: new Date().toISOString()
                    }
                  ];
                  
                  saveCTOs(sampleCTOs);
                }}
              >
                Adicionar dados de exemplo
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {ctos.length > 0 && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="map" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Mapa
            </TabsTrigger>
            <TabsTrigger value="topology" className="flex items-center gap-2">
              <Network className="w-4 h-4" />
              Topologia
            </TabsTrigger>
            <TabsTrigger value="list" className="flex items-center gap-2">
              <Box className="w-4 h-4" />
              Lista de CTOs
            </TabsTrigger>
            <TabsTrigger value="docs" className="flex items-center gap-2">
              <Info className="w-4 h-4" />
              Documentação
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="map">
            <FTTHMap 
              elements={networkElements}
              fiberPaths={fiberPaths}
              onElementClick={handleMapElementClick}
              onAddElement={handleAddMapElement}
            />
          </TabsContent>
          
          <TabsContent value="topology">
            <NetworkTopology 
              networkData={networkData}
              onNodeClick={handleNodeClick}
            />
          </TabsContent>
          
          <TabsContent value="list">
            <Card>
              <CardHeader>
                <CardTitle>Caixas de Terminação Óptica</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative mb-6">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Buscar CTOs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredCTOs.map(cto => (
                    <Card 
                      key={cto.id} 
                      className="cursor-pointer hover:border-blue-300 transition-colors"
                      onClick={() => setSelectedCTO(cto)}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{cto.name}</h3>
                            <p className="text-sm text-gray-500">
                              <MapPin className="w-3 h-3 inline mr-1" />
                              {cto.properties?.address || "Sem endereço"}
                            </p>
                          </div>
                          <Badge>
                            {cto.ports?.length || 0} / {cto.properties?.capacity || 0} portas
                          </Badge>
                        </div>
                        
                        <div className="mt-4 flex flex-wrap gap-1">
                          {Array.from({ length: Math.min(16, cto.properties?.capacity || 0) }, (_, i) => {
                            const port = cto.ports?.find(p => p.number === i + 1);
                            return (
                              <div 
                                key={i} 
                                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                                  port?.status === 'active' ? 'bg-green-100 text-green-800' : 
                                  port?.status === 'blocked' ? 'bg-red-100 text-red-800' : 
                                  'bg-gray-100 text-gray-800'
                                }`}
                                title={port ? `${port.client_name || 'Cliente'} - ${port.status}` : 'Vazio'}
                              >
                                {i + 1}
                              </div>
                            );
                          })}
                          {cto.properties?.capacity > 16 && (
                            <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs">
                              +
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="docs">
            <MapDocumentation />
          </TabsContent>
        </Tabs>
      )}

      {selectedCTO && !showCTOForm && (
        <Card>
          <CardHeader>
            <CardTitle>Detalhes da CTO: {selectedCTO.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <CTOViewer
              ctos={ctos}
              selectedCTO={selectedCTO}
              onCTOSelect={setSelectedCTO}
              onCTOEdit={() => {
                setShowCTOForm(true);
              }}
              onAddClient={(cto) => {
                const portNumber = prompt("Número da porta para o cliente:");
                if (portNumber) {
                  const newPort = {
                    number: parseInt(portNumber),
                    status: 'active',
                    client_name: "Novo Cliente",
                    client_id: Date.now().toString()
                  };
                  handleAddClient(cto, newPort);
                }
              }}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
