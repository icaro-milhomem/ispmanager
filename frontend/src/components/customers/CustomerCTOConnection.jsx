
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Search, Network, Wifi, AlertTriangle } from "lucide-react";

export default function CustomerCTOConnection({ customer, onCTOPortAssign }) {
  const [ctos, setCTOs] = useState([]);
  const [selectedCTO, setSelectedCTO] = useState(null);
  const [showCTODialog, setShowCTODialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPort, setSelectedPort] = useState(null);
  
  useEffect(() => {
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
    
    loadCTOs();
  }, []);
  
  const filteredCTOs = ctos.filter(cto => 
    cto.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cto.properties?.address?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const findCustomerCTO = () => {
    if (!customer || !customer.id) return null;
    
    for (const cto of ctos) {
      if (cto.ports) {
        const customerPort = cto.ports.find(port => 
          port.client_id === customer.cpf || 
          port.client_name.toLowerCase().includes(customer.full_name.toLowerCase())
        );
        
        if (customerPort) {
          return {
            cto,
            port: customerPort
          };
        }
      }
    }
    
    return null;
  };
  
  const customerCTOInfo = findCustomerCTO();
  
  const findNearestCTO = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(function(position) {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        
        const ctosWithDistance = ctos.map(cto => {
          const distance = calculateDistance(
            { lat: userLat, lng: userLng },
            cto.position
          );
          return { ...cto, distance };
        });
        
        const nearest = [...ctosWithDistance].sort((a, b) => a.distance - b.distance)[0];
        
        if (nearest) {
          setSelectedCTO(nearest);
          setShowCTODialog(true);
        } else {
          alert("Nenhuma CTO encontrada.");
        }
      }, function(error) {
        alert("Erro ao obter localização: " + error.message);
      });
    } else {
      alert("Geolocalização não disponível neste navegador.");
    }
  };
  
  const calculateDistance = (point1, point2) => {
    const R = 6371e3; // raio da Terra em metros
    const φ1 = point1.lat * Math.PI/180;
    const φ2 = point2.lat * Math.PI/180;
    const Δφ = (point2.lat-point1.lat) * Math.PI/180;
    const Δλ = (point2.lng-point1.lng) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // em metros
  };
  
  const assignCustomerToPort = () => {
    if (!selectedCTO || !selectedPort || !customer) return;
    
    const newPort = {
      number: selectedPort,
      status: 'active',
      client_name: customer.full_name,
      client_id: customer.cpf
    };
    
    const existingPortIndex = selectedCTO.ports ? 
      selectedCTO.ports.findIndex(p => p.number === selectedPort) : -1;
    
    let updatedPorts;
    
    if (existingPortIndex >= 0) {
      updatedPorts = [...selectedCTO.ports];
      updatedPorts[existingPortIndex] = newPort;
    } else {
      updatedPorts = [...(selectedCTO.ports || []), newPort];
    }
    
    const updatedCTO = {
      ...selectedCTO,
      ports: updatedPorts
    };
    
    const updatedCTOs = ctos.map(cto => 
      cto.id === updatedCTO.id ? updatedCTO : cto
    );
    
    setCTOs(updatedCTOs);
    localStorage.setItem('ctos', JSON.stringify(updatedCTOs));
    
    if (onCTOPortAssign) {
      onCTOPortAssign(updatedCTO, newPort);
    }
    
    setShowCTODialog(false);
  };
  
  const getAvailablePorts = () => {
    if (!selectedCTO) return [];
    
    const totalPorts = selectedCTO.properties.capacity;
    const usedPortNumbers = selectedCTO.ports ? 
      selectedCTO.ports.map(p => p.number) : [];
    
    return Array.from({ length: totalPorts }, (_, i) => i + 1)
      .filter(num => !usedPortNumbers.includes(num));
  };
  
  const availablePorts = getAvailablePorts();
  
  useEffect(() => {
    if (!localStorage.getItem('ctos')) {
      const sampleCTOs = [
        {
          id: "cto1",
          name: "CTO-A1",
          position: {
            lat: -23.5505,
            lng: -46.6333
          },
          properties: {
            capacity: 16,
            address: "Rua Exemplo, 123"
          },
          ports: [
            {
              number: 1,
              status: "active",
              client_name: "Cliente Exemplo",
              client_id: "12345678900"
            }
          ]
        },
        {
          id: "cto2",
          name: "CTO-B2",
          position: {
            lat: -23.5605,
            lng: -46.6433
          },
          properties: {
            capacity: 8,
            address: "Avenida Teste, 456"
          },
          ports: []
        }
      ];
      localStorage.setItem('ctos', JSON.stringify(sampleCTOs));
      setCTOs(sampleCTOs);
    }
  }, []);
  
  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="h-5 w-5 text-blue-600" />
            Conexão FTTH
          </CardTitle>
          <CardDescription>
            Gerenciamento da conexão do cliente na rede FTTH
          </CardDescription>
        </CardHeader>
        <CardContent>
          {customerCTOInfo ? (
            <div>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="font-medium">CTO: {customerCTOInfo.cto.name}</p>
                  <p className="text-sm text-gray-500">
                    <MapPin className="h-3 w-3 inline mr-1" />
                    {customerCTOInfo.cto.properties.address || "Sem endereço"}
                  </p>
                </div>
                <Badge 
                  className={
                    customerCTOInfo.port.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }
                >
                  {customerCTOInfo.port.status === 'active' ? 'Ativo' : 'Bloqueado'}
                </Badge>
              </div>
              
              <div className="border rounded-md p-3 bg-gray-50">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                      customerCTOInfo.port.status === 'active' 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-red-100 text-red-600'
                    }`}>
                      {customerCTOInfo.port.status === 'active' 
                        ? <Wifi className="h-4 w-4" /> 
                        : <AlertTriangle className="h-4 w-4" />
                      }
                    </div>
                    <div>
                      <p className="font-medium">Porta #{customerCTOInfo.port.number}</p>
                      <p className="text-xs text-gray-500">
                        Conexão {customerCTOInfo.port.status === 'active' ? 'ativa' : 'bloqueada'}
                      </p>
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setSelectedCTO(customerCTOInfo.cto);
                      setShowCTODialog(true);
                    }}
                  >
                    Editar
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500 mb-4">Cliente não conectado a nenhuma CTO</p>
              <Button onClick={findNearestCTO}>
                <MapPin className="h-4 w-4 mr-2" />
                Buscar CTO Próxima
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Dialog open={showCTODialog} onOpenChange={setShowCTODialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Conectar Cliente à CTO</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {!selectedCTO && (
              <>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Buscar CTO por nome ou endereço..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {filteredCTOs.length === 0 ? (
                    <p className="text-center py-4 text-gray-500">
                      Nenhuma CTO encontrada
                    </p>
                  ) : (
                    filteredCTOs.map(cto => (
                      <div 
                        key={cto.id}
                        className="border rounded-md p-3 cursor-pointer hover:bg-gray-50"
                        onClick={() => setSelectedCTO(cto)}
                      >
                        <div className="flex justify-between">
                          <div>
                            <p className="font-medium">{cto.name}</p>
                            <p className="text-xs text-gray-500">
                              <MapPin className="h-3 w-3 inline mr-1" />
                              {cto.properties.address || "Sem endereço"}
                            </p>
                          </div>
                          <Badge>
                            {cto.properties.capacity} portas
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {cto.ports ? cto.ports.length : 0} de {cto.properties.capacity} portas em uso
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
            
            {selectedCTO && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">CTO: {selectedCTO.name}</h3>
                  <p className="text-sm text-gray-500">
                    <MapPin className="h-3 w-3 inline mr-1" />
                    {selectedCTO.properties.address || "Sem endereço"}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label>Selecione uma porta:</Label>
                  {availablePorts.length === 0 ? (
                    <div className="text-center py-4 bg-yellow-50 rounded-md">
                      <p className="text-yellow-800">
                        Todas as portas desta CTO estão em uso. Escolha outra CTO.
                      </p>
                      <Button 
                        variant="outline" 
                        className="mt-2" 
                        onClick={() => setSelectedCTO(null)}
                      >
                        Escolher outra CTO
                      </Button>
                    </div>
                  ) : (
                    <Select onValueChange={(value) => setSelectedPort(parseInt(value, 10))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma porta" />
                      </SelectTrigger>
                      <SelectContent>
                        {availablePorts.map(port => (
                          <SelectItem key={port} value={port.toString()}>
                            Porta {port}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
                
                <div className="flex justify-end gap-2 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setSelectedCTO(null)}
                  >
                    Voltar
                  </Button>
                  <Button 
                    onClick={assignCustomerToPort}
                    disabled={!selectedPort}
                  >
                    Conectar
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
