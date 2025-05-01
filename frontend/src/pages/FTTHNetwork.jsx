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
import MapDocumentation from "../components/ftth/MapDocumentation";
import { createEntityClient } from '@/api/apiClient';
import { ftthConnectionsClient } from '@/lib/ftth-clients';
import { toast } from "react-hot-toast";

export default function FTTHNetworkPage() {
  const [ctos, setCTOs] = useState([]);
  const [selectedCTO, setSelectedCTO] = useState(null);
  const [showCTOForm, setShowCTOForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("map");
  
  const [networkElements, setNetworkElements] = useState([]);
  const [fiberPaths, setFiberPaths] = useState([]);
  
  const ctoClient = createEntityClient('ctos');
  const fiberClient = createEntityClient('ftth/connections');

  console.log('Clientes de API inicializados:', { ctoClient, fiberClient });

  useEffect(() => {
    loadCTOs();
    loadConnections();
  }, []);

  useEffect(() => {
    const allElements = [];
    
    // Processar CTOs
    if (ctos.length > 0) {
      console.log("CTOs brutas:", ctos);
      const ctoElements = ctos.map(cto => {
        // Validar e converter coordenadas
        const lat = typeof cto.latitude === 'number' ? cto.latitude : 
                   typeof cto.position?.lat === 'number' ? cto.position.lat :
                   parseFloat(cto.latitude || cto.position?.lat);
                   
        const lng = typeof cto.longitude === 'number' ? cto.longitude :
                   typeof cto.position?.lng === 'number' ? cto.position.lng :
                   parseFloat(cto.longitude || cto.position?.lng);

        // Verificar se as coordenadas são válidas
        if (isNaN(lat) || isNaN(lng)) {
          console.error('Coordenadas inválidas para CTO:', cto);
          return null;
        }

        return {
          id: cto.id,
          name: cto.name,
          type: "CTO",
          position: { lat, lng },
          properties: {
            capacity: parseInt(cto.capacity) || 16,
            address: cto.address || 'Sem endereço',
            portCount: cto.ports?.length || 0,
            status: cto.status || 'active'
          }
        };
      }).filter(Boolean);
      
      allElements.push(...ctoElements);
    }

    console.log("Elementos do mapa processados:", allElements);
    setNetworkElements(allElements);
  }, [ctos]);

  const loadCTOs = async (retryCount = 0) => {
    try {
      console.log('Tentando carregar CTOs...');
      const data = await ctoClient.list();
      console.log('CTOs carregadas com sucesso:', data);
      
      if (Array.isArray(data)) {
      setCTOs(data);
        localStorage.setItem('ctos', JSON.stringify(data));
      } else {
        console.error('Resposta inválida ao carregar CTOs:', data);
        throw new Error('Formato de resposta inválido');
      }
    } catch (error) {
      console.error('Erro ao carregar CTOs:', error);
      
      if (retryCount < 3) {
        console.log(`Tentando novamente (${retryCount + 1}/3)...`);
        setTimeout(() => loadCTOs(retryCount + 1), 1000);
      } else {
      const storedCTOs = JSON.parse(localStorage.getItem('ctos') || '[]');
        console.log('Usando CTOs do localStorage:', storedCTOs);
      setCTOs(storedCTOs);
      }
    }
  };

  const loadConnections = async () => {
    try {
      console.log('Carregando conexões...');
      const connections = await fiberClient.list();
      
      if (!Array.isArray(connections)) {
        console.error('Resposta inválida do servidor:', connections);
        throw new Error('Resposta inválida do servidor');
      }

      console.log('Conexões brutas:', connections);
      
      // Processar conexões
      const processedConnections = connections.map(conn => {
        // Validar e processar coordenadas
        if (!conn.coordinates || !Array.isArray(conn.coordinates)) {
          console.error('Coordenadas inválidas para conexão:', conn);
          return null;
        }

        // Converter coordenadas para o formato esperado
        const validCoordinates = conn.coordinates.map(coord => {
          if (Array.isArray(coord) && coord.length === 2) {
            return coord;
          }
          if (typeof coord === 'object' && coord.lat !== undefined && coord.lng !== undefined) {
            return [coord.lat, coord.lng];
          }
          return null;
        }).filter(Boolean);

        if (validCoordinates.length < 2) {
          console.error('Número insuficiente de coordenadas válidas:', conn);
          return null;
        }

        return {
          ...conn,
          coordinates: validCoordinates
        };
      }).filter(Boolean);

      console.log('Conexões processadas:', processedConnections);
      setFiberPaths(processedConnections);
      
    } catch (error) {
      console.error('Erro ao carregar conexões:', error);
      toast.error('Erro ao carregar conexões');
    }
  };

  const saveCTOs = async (newCTOs) => {
    try {
      console.log('Iniciando salvamento de CTOs:', newCTOs);
      
      // Garantir que as coordenadas estejam no formato correto
      const formattedCTOs = newCTOs.map(cto => ({
        ...cto,
        latitude: typeof cto.latitude === 'number' ? cto.latitude : 
                 typeof cto.position?.lat === 'number' ? cto.position.lat :
                 parseFloat(cto.latitude || cto.position?.lat),
        longitude: typeof cto.longitude === 'number' ? cto.longitude :
                  typeof cto.position?.lng === 'number' ? cto.position.lng :
                  parseFloat(cto.longitude || cto.position?.lng)
      }));

      localStorage.setItem('ctos', JSON.stringify(formattedCTOs));
      
      setCTOs(formattedCTOs);
      
      const mapElements = formattedCTOs.map(cto => ({
        id: cto.id,
        name: cto.name,
        type: "CTO",
        position: {
          lat: cto.latitude,
          lng: cto.longitude
        },
        properties: {
          capacity: parseInt(cto.capacity) || 16,
          address: cto.address || 'Sem endereço',
          portCount: cto.ports?.length || 0,
          status: cto.status || 'active'
        }
      }));
      
      setNetworkElements(mapElements);
      
      console.log('CTOs salvas com sucesso. Estado atualizado:', {
        ctos: formattedCTOs,
        mapElements: mapElements
      });
      
      return true;
    } catch (error) {
      console.error('Erro ao salvar CTOs:', error);
      toast.error('Erro ao salvar CTOs. Os dados foram salvos localmente como backup.');
      return false;
    }
  };

  const handleAddCTO = async (ctoData) => {
    try {
      console.log("Dados para criar CTO:", ctoData);
      const newCTO = await ctoClient.create({
        name: ctoData.name,
        latitude: ctoData.position.lat,
        longitude: ctoData.position.lng,
        capacity: parseInt(ctoData.properties.capacity) || 16,
        address: ctoData.properties.address || 'Sem endereço',
        notes: ctoData.properties.notes || '',
        ports: [],
        status: 'active'
      });
      
      console.log("Nova CTO criada:", newCTO);
      const updatedCTOs = [...ctos, {
        ...newCTO,
        properties: {
          capacity: parseInt(newCTO.capacity) || 16,
          address: newCTO.address || 'Sem endereço',
          portCount: 0
        }
      }];
      saveCTOs(updatedCTOs);
      setShowCTOForm(false);
    } catch (error) {
      console.error('Erro ao criar CTO:', error);
      alert('Erro ao criar CTO. Por favor, tente novamente.');
    }
  };

  const handleUpdateCTO = async (ctoData) => {
    try {
      console.log("Dados para atualizar CTO:", ctoData);
      if (!ctoData.id) {
        throw new Error('ID da CTO não fornecido');
      }

      // Validação das coordenadas
      let lat, lng;
      
      // Função auxiliar para extrair coordenadas de um objeto
      const extractCoords = (obj) => {
        if (obj.position) {
          if (typeof obj.position.lat === 'number' && typeof obj.position.lng === 'number') {
            return { lat: obj.position.lat, lng: obj.position.lng };
          }
          return extractCoords(obj.position);
        }
        return null;
      };

      // Tentar obter as coordenadas de diferentes formatos possíveis
      const coords = extractCoords(ctoData);
      if (coords) {
        lat = coords.lat;
        lng = coords.lng;
      } else if (ctoData.latitude && ctoData.longitude) {
        lat = parseFloat(ctoData.latitude);
        lng = parseFloat(ctoData.longitude);
      } else {
        throw new Error('Coordenadas não fornecidas');
      }
      
      // Validação adicional das coordenadas
      if (isNaN(lat) || isNaN(lng)) {
        console.error('Coordenadas inválidas:', { lat, lng, ctoData });
        throw new Error('Coordenadas inválidas');
      }
      
      if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        console.error('Coordenadas fora do intervalo:', { lat, lng });
        throw new Error('Coordenadas fora do intervalo válido');
      }

      const updateData = {
        name: ctoData.name || undefined,
        latitude: lat,
        longitude: lng,
        capacity: parseInt(ctoData.properties?.capacity || ctoData.capacity) || 16,
        address: ctoData.properties?.address || ctoData.address || 'Sem endereço',
        notes: ctoData.properties?.notes || ctoData.notes || '',
        ports: ctoData.ports || [],
        status: ctoData.status || 'active'
      };

      // Remover campos undefined
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined) {
          delete updateData[key];
        }
      });

      console.log("Enviando dados de atualização:", updateData);
      
      try {
        // Primeiro tenta atualizar
        const updatedCTO = await ctoClient.update(ctoData.id, updateData);
        console.log("CTO atualizada:", updatedCTO);
        
        // Atualizar o estado local imediatamente
        const updatedCTOs = ctos.map(cto => 
          cto.id === ctoData.id ? {
            ...updatedCTO,
            latitude: lat,
            longitude: lng,
            position: { lat, lng },
            properties: {
              capacity: parseInt(updatedCTO.capacity) || 16,
              address: updatedCTO.address || 'Sem endereço',
              portCount: updatedCTO.ports?.length || 0
            }
          } : cto
        );

        // Atualizar o estado local antes de salvar
        setCTOs(updatedCTOs);
        
        // Atualizar os elementos do mapa
        const mapElements = updatedCTOs.map(cto => ({
          id: cto.id,
          name: cto.name,
          type: "CTO",
          position: {
            lat: cto.latitude,
            lng: cto.longitude
          },
          properties: {
            capacity: parseInt(cto.capacity) || 16,
            address: cto.address || 'Sem endereço',
            portCount: cto.ports?.length || 0
          }
        }));
        
        setNetworkElements(mapElements);
        
        // Salvar no localStorage
        localStorage.setItem('ctos', JSON.stringify(updatedCTOs));
        
        toast.success('CTO atualizada com sucesso!');
      } catch (error) {
        // Se o erro for 404 (CTO não encontrada), tenta criar uma nova
        if (error.response?.status === 404) {
          console.log("CTO não encontrada, tentando criar uma nova...");
          
          // Validação adicional para criação
          if (!updateData.name) {
            updateData.name = `CTO ${ctoData.id.slice(0, 8)}`;
          }
          
          if (!updateData.ports) {
            updateData.ports = [];
          }
          
          if (!updateData.status) {
            updateData.status = 'active';
          }

          try {
            const newCTO = await ctoClient.create(updateData);
            console.log("Nova CTO criada:", newCTO);
            
            const updatedCTOs = [...ctos, {
              ...newCTO,
              latitude: lat,
              longitude: lng,
              position: { lat, lng },
              properties: {
                capacity: parseInt(newCTO.capacity) || 16,
                address: newCTO.address || 'Sem endereço',
                portCount: newCTO.ports?.length || 0
              }
            }];
            
            // Atualizar o estado local
            setCTOs(updatedCTOs);
            
            // Atualizar os elementos do mapa
            const mapElements = updatedCTOs.map(cto => ({
              id: cto.id,
              name: cto.name,
              type: "CTO",
              position: {
                lat: cto.latitude,
                lng: cto.longitude
              },
              properties: {
                capacity: parseInt(cto.capacity) || 16,
                address: cto.address || 'Sem endereço',
                portCount: cto.ports?.length || 0
              }
            }));
            
            setNetworkElements(mapElements);
            
            // Salvar no localStorage
            localStorage.setItem('ctos', JSON.stringify(updatedCTOs));
            
            toast.success('Nova CTO criada com sucesso!');
          } catch (createError) {
            console.error('Erro ao criar nova CTO:', createError);
            if (createError.response?.status === 500) {
              throw new Error('Erro interno do servidor ao criar CTO. Por favor, tente novamente mais tarde.');
            } else {
              throw new Error('Falha ao criar nova CTO: ' + (createError.message || 'Erro desconhecido'));
            }
          }
        } else {
          // Se for outro erro, propaga
          throw error;
        }
      }
      
      setSelectedCTO(null);
      setShowCTOForm(false);
    } catch (error) {
      console.error('Erro ao atualizar CTO:', error);
      toast.error('Erro ao atualizar CTO: ' + (error.message || 'Erro desconhecido'));
    }
  };

  const handleDeleteCTO = async (ctoId) => {
    if (window.confirm("Tem certeza que deseja excluir esta CTO?")) {
      try {
        await ctoClient.delete(ctoId);
        const updatedCTOs = ctos.filter(cto => cto.id !== ctoId);
        saveCTOs(updatedCTOs);
        setSelectedCTO(null);
      } catch (error) {
        console.error('Erro ao excluir CTO:', error);
        const updatedCTOs = ctos.filter(cto => cto.id !== ctoId);
        saveCTOs(updatedCTOs);
        setSelectedCTO(null);
      }
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
  
  const handleAddMapElement = async (element) => {
    if (element.type === "CTO") {
      try {
        console.log("Iniciando adição de nova CTO:", element);
        
        // Preparar dados para a CTO
        const ctoData = {
          name: element.name,
          latitude: element.position.lat,
          longitude: element.position.lng,
          capacity: parseInt(element.capacity) || 16,
          address: element.address || '',
          status: 'active',
          ports: []
        };

        console.log("Dados preparados para criar CTO:", ctoData);
        
        // Criar CTO no backend
        const newCTO = await ctoClient.create(ctoData);
        console.log("CTO criada no backend:", newCTO);

        if (!newCTO || !newCTO.id) {
          throw new Error('Resposta inválida do servidor ao criar CTO');
      }

        // Criar objeto formatado para o mapa
        const updatedCTO = {
          id: newCTO.id,
          name: newCTO.name,
          type: "CTO",
        position: {
            lat: parseFloat(newCTO.latitude),
            lng: parseFloat(newCTO.longitude)
        },
        properties: {
            capacity: parseInt(newCTO.capacity),
            address: newCTO.address,
            portCount: 0,
            status: newCTO.status
          }
        };

        console.log("Objeto formatado para o mapa:", updatedCTO);

        // Atualizar estados
        setCTOs(prev => {
          const updated = [...prev, newCTO];
          console.log("Atualizando lista de CTOs:", updated);
          return updated;
        });

        setNetworkElements(prev => {
          const updated = [...prev, updatedCTO];
          console.log("Atualizando elementos do mapa:", updated);
          return updated;
        });

        // Salvar no localStorage
        const storedCTOs = JSON.parse(localStorage.getItem('ctos') || '[]');
        const updatedStoredCTOs = [...storedCTOs, newCTO];
        localStorage.setItem('ctos', JSON.stringify(updatedStoredCTOs));
        
        console.log("CTO salva com sucesso em todos os estados");
        toast.success('CTO adicionada com sucesso!');
        
        return updatedCTO;
      } catch (error) {
        console.error('Erro ao adicionar CTO:', error);
        toast.error('Erro ao adicionar CTO: ' + (error.message || 'Erro desconhecido'));
        throw error;
      }
    }
  };

  const handleAddConnection = async (connectionData) => {
    try {
      console.log("Nova conexão:", connectionData);
      
      const savedConnection = await ftthConnectionsClient.create(connectionData);
      
      if (!savedConnection || !savedConnection.id) {
        throw new Error('Erro ao salvar conexão no servidor');
      }

      setFiberPaths(prevPaths => [...prevPaths, savedConnection]);
      
      return savedConnection;
    } catch (error) {
      console.error('Erro ao salvar conexão:', error);
      throw error;
    }
  };

  const handleUpdateConnection = async (connectionId, connectionData) => {
    try {
      await fiberClient.update(connectionId, connectionData);
      await loadConnections();
      toast.success('Conexão atualizada com sucesso');
    } catch (error) {
      console.error('Erro ao atualizar conexão:', error);
      toast.error('Erro ao atualizar conexão');
    }
  };

  const handleMarkerDrag = async (id, newPos) => {
    try {
      console.log("Marcador arrastado:", id, newPos);
      
      // Encontrar o elemento pelo ID
      const element = networkElements.find(el => el.id === id);
      if (!element) {
        throw new Error('Elemento não encontrado');
      }

      // Determinar o tipo do elemento e chamar a função apropriada
      if (element.type === 'CTO') {
        await handleUpdateCTO({
          ...element,
          position: newPos
        });
      }
    } catch (error) {
      console.error('Erro ao atualizar posição:', error);
      toast.error(error.message || 'Erro ao atualizar posição');
    }
  };

  const filteredCTOs = ctos.filter(cto => {
    if (!searchTerm) return true;
    
    const searchTermLower = searchTerm.toLowerCase().trim();
    const searchFields = [
      cto.name,
      cto.properties?.address,
      cto.id,
      cto.properties?.reference,
      cto.properties?.neighborhood
    ];
    
    return searchFields.some(field => 
      field?.toLowerCase().includes(searchTermLower)
    );
  });

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
            </div>
          </AlertDescription>
        </Alert>
      )}

      {ctos.length > 0 && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="map">Mapa</TabsTrigger>
            <TabsTrigger value="list">Lista</TabsTrigger>
            <TabsTrigger value="topology">Topologia</TabsTrigger>
          </TabsList>
          
          <TabsContent value="map" className="h-[calc(100vh-200px)]">
            <FTTHMap
              elements={networkElements}
              fiberPaths={fiberPaths}
              onElementClick={handleMapElementClick}
              onAddElement={handleAddMapElement}
              onUpdateElement={handleMarkerDrag}
              onDeleteElement={handleDeleteCTO}
              onAddConnection={handleAddConnection}
              onUpdateConnection={handleUpdateConnection}
            >
            </FTTHMap>
          </TabsContent>
          
          <TabsContent value="topology">
            <NetworkTopology 
              networkData={{ nodes: networkElements, links: fiberPaths }}
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
