
import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { 
  MapPin, 
  Network,
  Plus,
  Trash,
  Crosshair,
  Save,
  Info,
  Search,
  Layers,
  AlertTriangle,
  AlertCircle,
  Activity,
  RefreshCw,
  ChevronRight,
  ChevronDown,
  BarChart2,
  Wifi,
  Clock,
  X as XIcon
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

export default function FTTHMap({ 
  elements = [], 
  fiberPaths = [], 
  onElementClick,
  onAddElement,
  onUpdateElement,
  onDeleteElement
}) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersLayerRef = useRef(null);
  const pathsLayerRef = useRef(null);
  const performanceLayerRef = useRef(null);
  
  const [selectedElement, setSelectedElement] = useState(null);
  const [isAddMode, setIsAddMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchAddress, setSearchAddress] = useState("");
  const [newElement, setNewElement] = useState({
    name: "",
    type: "CTO",
    position: { lat: 0, lng: 0 },
    properties: { capacity: 16 }
  });
  
  const [showPerformance, setShowPerformance] = useState(true);
  const [performanceMetric, setPerformanceMetric] = useState("traffic");
  const [performanceData, setPerformanceData] = useState({});
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isUpdatingData, setIsUpdatingData] = useState(false);
  const [alertsVisible, setAlertsVisible] = useState(true);
  const [activeAlerts, setActiveAlerts] = useState([]);
  
  useEffect(() => {
    const initialLat = -5.5256;
    const initialLng = -47.4795;
    const initialZoom = 13;
    
    console.log(`[Leaflet Simulado] Inicializando mapa em Imperatriz, MA (${initialLat}, ${initialLng})`);
    
    fetchPerformanceData();
    
    const interval = setInterval(() => {
      fetchPerformanceData();
    }, 30000);
    
    renderSimulatedMap();
    
    return () => {
      clearInterval(interval);
      console.log("[Leaflet Simulado] Mapa destruído");
    };
  }, []);
  
  useEffect(() => {
    if (elements.length > 0 || fiberPaths.length > 0) {
      console.log("[Leaflet Simulado] Atualizando elementos no mapa");
    }
  }, [elements, fiberPaths, performanceData, performanceMetric, showPerformance]);
  
  const fetchPerformanceData = async () => {
    setIsUpdatingData(true);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const perfData = {};
    
    elements.forEach(element => {
      const elementId = element.id;
      
      perfData[elementId] = {
        traffic: Math.random() * 100,
        latency: Math.floor(Math.random() * 50),
        packetLoss: Math.random() * 2,
        status: Math.random() > 0.9 ? 'warning' : Math.random() > 0.95 ? 'critical' : 'normal',
        uptime: 99.9 + (Math.random() * 0.1),
        alerts: []
      };
      
      if (perfData[elementId].status === 'warning') {
        perfData[elementId].alerts.push({
          id: `alert-${Date.now()}-${Math.random()}`,
          type: 'warning',
          message: `Alta utilização em ${element.name}`,
          timestamp: new Date().toISOString()
        });
      } else if (perfData[elementId].status === 'critical') {
        perfData[elementId].alerts.push({
          id: `alert-${Date.now()}-${Math.random()}`,
          type: 'critical',
          message: `Falha de conexão em ${element.name}`,
          timestamp: new Date().toISOString()
        });
      }
    });
    
    fiberPaths.forEach(path => {
      const pathId = path.id;
      
      perfData[pathId] = {
        traffic: Math.random() * 100,
        latency: Math.floor(Math.random() * 30),
        packetLoss: Math.random() * 1.5,
        status: Math.random() > 0.9 ? 'warning' : Math.random() > 0.97 ? 'critical' : 'normal',
        bandwidth: Math.floor((path.properties?.capacity || 144) * (0.5 + Math.random() * 0.5)),
        alerts: []
      };
      
      if (perfData[pathId].status === 'warning') {
        perfData[pathId].alerts.push({
          id: `alert-${Date.now()}-${Math.random()}`,
          type: 'warning',
          message: `Alto tráfego na conexão ${path.source} -> ${path.target}`,
          timestamp: new Date().toISOString()
        });
      } else if (perfData[pathId].status === 'critical') {
        perfData[pathId].alerts.push({
          id: `alert-${Date.now()}-${Math.random()}`,
          type: 'critical',
          message: `Conexão instável entre ${path.source} e ${path.target}`,
          timestamp: new Date().toISOString()
        });
      }
    });
    
    setPerformanceData(perfData);
    setLastUpdated(new Date());
    
    const allAlerts = [];
    Object.values(perfData).forEach(data => {
      if (data.alerts && data.alerts.length > 0) {
        allAlerts.push(...data.alerts);
      }
    });
    setActiveAlerts(allAlerts);
    
    setIsUpdatingData(false);
  };
  
  const renderElementsWithPerformanceData = () => {
  };
  
  const searchLocation = async () => {
    if (!searchAddress.trim()) return;
    
    setIsLoading(true);
    
    try {
      console.log(`[Geocoding Simulado] Buscando endereço: "${searchAddress}"`);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const simulatedResult = {
        lat: -5.5256 + (Math.random() * 0.02 - 0.01),
        lng: -47.4795 + (Math.random() * 0.02 - 0.01),
        display_name: `${searchAddress}, Imperatriz - MA`
      };
      
      console.log(`[Geocoding Simulado] Encontrado: ${simulatedResult.display_name} em (${simulatedResult.lat}, ${simulatedResult.lng})`);
      
      setNewElement({
        ...newElement,
        position: { lat: simulatedResult.lat, lng: simulatedResult.lng }
      });
      
    } catch (error) {
      console.error("Erro ao buscar localização:", error);
    }
    
    setIsLoading(false);
  };
  
  const handleMapClick = (e) => {
    if (!isAddMode) return;
    
    const latlng = { lat: -5.5256 + (Math.random() * 0.02 - 0.01), lng: -47.4795 + (Math.random() * 0.02 - 0.01) };
    
    console.log(`[Leaflet Simulado] Clique no mapa em: (${latlng.lat}, ${latlng.lng})`);
    
    setNewElement({
      ...newElement,
      position: latlng
    });
  };
  
  const saveNewElement = () => {
    if (newElement.position.lat === 0 || !newElement.name.trim()) {
      alert("Por favor, defina um local no mapa e um nome para a CTO");
      return;
    }
    
    const elementId = `cto-${Date.now()}`;
    const newCTO = {
      id: elementId,
      name: newElement.name,
      type: "CTO",
      position: newElement.position,
      properties: {
        capacity: parseInt(newElement.properties.capacity) || 16,
        address: newElement.properties.address || "Endereço não especificado"
      },
      ports: []
    };
    
    console.log("[CTO] Salva nova CTO:", newCTO);
    
    onAddElement && onAddElement(newCTO);
    setIsAddMode(false);
    setNewElement({
      name: "",
      type: "CTO",
      position: { lat: 0, lng: 0 },
      properties: { capacity: 16, address: "" }
    });
    
    fetchPerformanceData();
  };
  
  const getPerformanceColor = (elementId, defaultColor = "green") => {
    if (!showPerformance || !performanceData[elementId]) {
      return defaultColor;
    }
    
    const perfData = performanceData[elementId];
    
    if (performanceMetric === 'traffic') {
      return perfData.traffic > 90 ? 'rgb(239, 68, 68)' : 
             perfData.traffic > 70 ? 'rgb(249, 115, 22)' : 
             'rgb(34, 197, 94)'; 
    } else if (performanceMetric === 'latency') {
      return perfData.latency > 30 ? 'rgb(239, 68, 68)' : 
             perfData.latency > 15 ? 'rgb(249, 115, 22)' : 
             'rgb(34, 197, 94)';
    } else if (performanceMetric === 'packetLoss') {
      return perfData.packetLoss > 1 ? 'rgb(239, 68, 68)' : 
             perfData.packetLoss > 0.5 ? 'rgb(249, 115, 22)' : 
             'rgb(34, 197, 94)';
    }
    
    return defaultColor;
  };
  
  const getPerformanceTooltip = (elementId) => {
    if (!performanceData[elementId]) {
      return "Sem dados disponíveis";
    }
    
    const perfData = performanceData[elementId];
    
    return (
      <div className="space-y-2">
        <div className="font-bold">Métricas de Desempenho</div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
          <div>Tráfego:</div>
          <div className={
            perfData.traffic > 90 ? 'text-red-500' : 
            perfData.traffic > 70 ? 'text-orange-500' : 
            'text-green-500'
          }>{perfData.traffic.toFixed(1)}%</div>
          
          <div>Latência:</div>
          <div className={
            perfData.latency > 30 ? 'text-red-500' : 
            perfData.latency > 15 ? 'text-orange-500' : 
            'text-green-500'
          }>{perfData.latency.toFixed(1)} ms</div>
          
          <div>Perda de Pacotes:</div>
          <div className={
            perfData.packetLoss > 1 ? 'text-red-500' : 
            perfData.packetLoss > 0.5 ? 'text-orange-500' : 
            'text-green-500'
          }>{perfData.packetLoss.toFixed(2)}%</div>
          
          <div>Status:</div>
          <div className={
            perfData.status === 'critical' ? 'text-red-500' : 
            perfData.status === 'warning' ? 'text-orange-500' : 
            'text-green-500'
          }>
            {perfData.status === 'critical' ? 'Crítico' : 
             perfData.status === 'warning' ? 'Alerta' : 
             'Normal'}
          </div>
        </div>
        
        {perfData.alerts && perfData.alerts.length > 0 && (
          <div className="pt-1 border-t border-gray-200">
            <div className="font-bold text-red-500">Alertas</div>
            {perfData.alerts.map((alert, i) => (
              <div key={i} className="text-xs">
                • {alert.message}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };
  
  const getPulseClass = (elementId) => {
    if (!showPerformance || !performanceData[elementId]) {
      return "";
    }
    
    const perfData = performanceData[elementId];
    if (perfData.status === 'critical') {
      return "animate-pulse";
    }
    return "";
  };
  
  const renderSimulatedMap = () => {
    const mapWidth = "100%";
    const mapHeight = "500px";
    
    const ctosElements = elements.filter(el => el.type === "CTO");
    const oltsElements = elements.filter(el => el.type === "OLT");
    const splitterElements = elements.filter(el => el.type === "SPLITTER");
    const clientElements = elements.filter(el => el.type === "BUILDING" || el.type === "CLIENT");
    
    return (
      <div className="relative border rounded-lg overflow-hidden" style={{ height: mapHeight, width: mapWidth }}>
        <div 
          className="absolute inset-0 bg-blue-50" 
          style={{ 
            backgroundImage: `url('https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/346dd7_Capturadetela2025-03-10234049.png')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'grayscale(20%)'
          }}
          onClick={handleMapClick}
        >
          {ctosElements.map((cto, index) => (
            <div 
              key={`cto-${index}`}
              className={`absolute cursor-pointer ${getPulseClass(cto.id)}`}
              style={{ 
                left: `${((cto.position.lng + 46.64) / 0.01) * 100}%`, 
                top: `${((cto.position.lat + 23.55) / 0.01) * 100}%`,
                transform: 'translate(-50%, -50%)'
              }}
              onClick={() => {
                if (!isAddMode) {
                  setSelectedElement(cto);
                  onElementClick && onElementClick(cto);
                }
              }}
            >
              <HoverCard>
                <HoverCardTrigger asChild>
                  <div className="flex flex-col items-center">
                    <div 
                      className="w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-md"
                      style={{ 
                        backgroundColor: showPerformance 
                          ? getPerformanceColor(cto.id, "rgb(34, 197, 94)") 
                          : "rgb(34, 197, 94)" 
                      }}
                    >
                      <Network className="w-3 h-3 text-white" />
                      {showPerformance && performanceData[cto.id] && performanceData[cto.id].status !== 'normal' && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500 border border-white" />
                      )}
                    </div>
                    <div className="text-xs font-bold bg-white px-1 rounded shadow mt-1">
                      {cto.name}
                    </div>
                  </div>
                </HoverCardTrigger>
                <HoverCardContent className="w-64">
                  <div className="font-bold">{cto.name}</div>
                  <div className="text-sm text-gray-500">{cto.properties?.address}</div>
                  <div className="text-sm">Portas: {cto.properties?.portCount || 0} / {cto.properties?.capacity || 16}</div>
                  {showPerformance && performanceData[cto.id] && (
                    <div className="mt-2 pt-2 border-t">
                      {getPerformanceTooltip(cto.id)}
                    </div>
                  )}
                </HoverCardContent>
              </HoverCard>
            </div>
          ))}
          
          {oltsElements.map((olt, index) => (
            <div 
              key={`olt-${index}`}
              className={`absolute cursor-pointer ${getPulseClass(olt.id)}`}
              style={{ 
                left: `${((olt.position.lng + 46.64) / 0.01) * 100}%`, 
                top: `${((olt.position.lat + 23.55) / 0.01) * 100}%`,
                transform: 'translate(-50%, -50%)'
              }}
              onClick={() => {
                if (!isAddMode) {
                  setSelectedElement(olt);
                  onElementClick && onElementClick(olt);
                }
              }}
            >
              <HoverCard>
                <HoverCardTrigger asChild>
                  <div className="flex flex-col items-center">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center border-2 border-white shadow-md"
                      style={{ 
                        backgroundColor: showPerformance 
                          ? getPerformanceColor(olt.id, "rgb(239, 68, 68)") 
                          : "rgb(239, 68, 68)" 
                      }}
                    >
                      <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2 9H22M2 15H22M9 22V2M15 22V2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {showPerformance && performanceData[olt.id] && performanceData[olt.id].status !== 'normal' && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500 border border-white" />
                      )}
                    </div>
                    <div className="text-xs font-bold bg-white px-1 rounded shadow mt-1">
                      {olt.name}
                    </div>
                  </div>
                </HoverCardTrigger>
                <HoverCardContent className="w-64">
                  <div className="font-bold">{olt.name}</div>
                  <div className="text-sm text-gray-500">OLT</div>
                  {showPerformance && performanceData[olt.id] && (
                    <div className="mt-2 pt-2 border-t">
                      {getPerformanceTooltip(olt.id)}
                    </div>
                  )}
                </HoverCardContent>
              </HoverCard>
            </div>
          ))}
          
          {isAddMode && newElement.position.lat !== 0 && (
            <div 
              className="absolute cursor-pointer"
              style={{ 
                left: `${((newElement.position.lng + 46.64) / 0.01) * 100}%`, 
                top: `${((newElement.position.lat + 23.55) / 0.01) * 100}%`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              <div className="flex flex-col items-center">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-white shadow-md animate-pulse">
                  <Plus className="w-3 h-3 text-white" />
                </div>
                <div className="text-xs font-bold bg-white px-1 rounded shadow mt-1">
                  {newElement.name || "Nova CTO"}
                </div>
              </div>
            </div>
          )}
          
          {fiberPaths.map((fiber, index) => {
            const source = elements.find(el => el.id === fiber.source);
            const target = elements.find(el => el.id === fiber.target);
            
            if (!source || !target) return null;
            
            const baseColor = 
              fiber.type === "backbone" ? "red" : 
              fiber.type === "distribution" ? "blue" : 
              "green";
            
            const strokeColor = showPerformance && performanceData[fiber.id]
              ? getPerformanceColor(fiber.id, baseColor)
              : baseColor;
            
            const strokeWidth = fiber.properties?.capacity ? 
              Math.log(fiber.properties.capacity) * 0.3 + 1 : 2;
            
            const dashArray = fiber.type === "drop" ? "5,5" : "none";
            
            const points = fiber.coordinates.map(coord => {
              return { 
                x: ((coord.lng + 46.64) / 0.01) * 100,
                y: ((coord.lat + 23.55) / 0.01) * 100
              };
            });
            
            const pathString = points.map((point, i) => 
              `${i === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
            ).join(' ');
            
            const pulseClass = showPerformance && performanceData[fiber.id] && 
              performanceData[fiber.id].status === 'critical' ? "animate-pulse" : "";
            
            return (
              <svg 
                key={`fiber-${index}`}
                className={`absolute top-0 left-0 w-full h-full pointer-events-none ${pulseClass}`}
              >
                <path 
                  d={pathString} 
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  strokeDasharray={dashArray}
                  strokeOpacity={0.7}
                />
              </svg>
            );
          })}
        </div>
        
        <div className="absolute top-4 left-4 z-10 bg-white rounded-md shadow-md p-3 w-72">
          <div className="space-y-2">
            <div className="text-sm font-medium">Buscar localização</div>
            <div className="flex gap-2">
              <Input
                id="addressInput"
                placeholder="Digite um endereço..."
                value={searchAddress}
                onChange={(e) => setSearchAddress(e.target.value)}
                className="flex-1"
              />
              <Button
                onClick={searchLocation}
                disabled={isLoading}
                size="sm"
              >
                {isLoading ? <Spinner className="h-4 w-4" /> : <Search className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
        
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <Button 
            variant="secondary" 
            size="sm" 
            className="bg-white"
            onClick={() => setIsAddMode(!isAddMode)}
          >
            {isAddMode ? (
              <>
                <Crosshair className="w-4 h-4 mr-1" />
                Cancelar
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-1" />
                Adicionar CTO
              </>
            )}
          </Button>
          
          <Button 
            variant="secondary" 
            size="sm" 
            className="bg-white"
          >
            <Layers className="w-4 h-4 mr-1" />
            Camadas
          </Button>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="secondary" 
                size="sm" 
                className={`bg-white ${!showPerformance ? 'opacity-60' : ''}`}
              >
                <Activity className="w-4 h-4 mr-1" />
                Performance
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm">Visualização de Desempenho</h4>
                  <div className="flex items-center">
                    <Label htmlFor="show-performance" className="mr-2 text-sm">Ativar</Label>
                    <input
                      type="checkbox"
                      id="show-performance"
                      checked={showPerformance}
                      onChange={(e) => setShowPerformance(e.target.checked)}
                      className="accent-blue-600"
                    />
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm">Métrica de Desempenho</Label>
                  <Tabs value={performanceMetric} onValueChange={setPerformanceMetric} className="mt-1">
                    <TabsList className="grid grid-cols-3">
                      <TabsTrigger value="traffic" className="text-xs">Tráfego</TabsTrigger>
                      <TabsTrigger value="latency" className="text-xs">Latência</TabsTrigger>
                      <TabsTrigger value="packetLoss" className="text-xs">Perda de Pacotes</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h5 className="text-sm">Alertas</h5>
                    <div className="flex items-center">
                      <Label htmlFor="show-alerts" className="mr-2 text-xs">Mostrar</Label>
                      <input
                        type="checkbox"
                        id="show-alerts"
                        checked={alertsVisible}
                        onChange={(e) => setAlertsVisible(e.target.checked)}
                        className="accent-blue-600"
                      />
                    </div>
                  </div>
                  
                  {alertsVisible && activeAlerts.length > 0 && (
                    <div className="max-h-32 overflow-y-auto border rounded-md p-2 space-y-1">
                      {activeAlerts.map((alert, index) => (
                        <div 
                          key={alert.id || index} 
                          className={`text-xs ${
                            alert.type === 'critical' ? 'text-red-600' : 'text-orange-600'
                          }`}
                        >
                          <div className="flex gap-1 items-center">
                            {alert.type === 'critical' ? 
                              <AlertCircle className="w-3 h-3" /> : 
                              <AlertTriangle className="w-3 h-3" />
                            }
                            {alert.message}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="pt-2 text-right">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={fetchPerformanceData}
                    disabled={isUpdatingData}
                    className="text-blue-600"
                  >
                    <RefreshCw className={`w-3 h-3 mr-1 ${isUpdatingData ? 'animate-spin' : ''}`} />
                    Atualizar dados
                  </Button>
                </div>
                
                <div className="pt-1 border-t border-gray-100 text-xs text-gray-500 flex justify-between items-center">
                  <span>Última atualização: {lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : 'N/A'}</span>
                  <Button variant="ghost" size="sm" className="h-6 text-gray-500">
                    <Clock className="w-3 h-3 mr-1" />
                    Auto (30s)
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
        
        {showPerformance && alertsVisible && activeAlerts.length > 0 && (
          <div className="absolute bottom-4 right-4 bg-white rounded-md shadow-md p-2 w-64">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1 text-sm font-bold text-red-600">
                <AlertCircle className="w-4 h-4" />
                Alertas na Rede ({activeAlerts.length})
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => setAlertsVisible(false)}
              >
                <XIcon className="h-3 w-3" />
              </Button>
            </div>
            <div className="max-h-32 overflow-y-auto space-y-1">
              {activeAlerts.slice(0, 5).map((alert, index) => (
                <div 
                  key={alert.id || index} 
                  className={`text-xs p-1 rounded ${
                    alert.type === 'critical' ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'
                  }`}
                >
                  <div className="flex gap-1 items-center">
                    {alert.type === 'critical' ? 
                      <AlertCircle className="w-3 h-3 flex-shrink-0" /> : 
                      <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                    }
                    <span className="truncate">{alert.message}</span>
                  </div>
                </div>
              ))}
              {activeAlerts.length > 5 && (
                <div className="text-xs text-center py-1">
                  + {activeAlerts.length - 5} mais alertas...
                </div>
              )}
            </div>
          </div>
        )}
        
        {showPerformance && (
          <div className="absolute bottom-4 left-4 bg-white rounded-md shadow-md p-2">
            <div className="text-xs font-medium mb-1">
              {performanceMetric === 'traffic' ? 'Tráfego' : 
               performanceMetric === 'latency' ? 'Latência' : 
               'Perda de Pacotes'}
            </div>
            <div className="flex gap-2">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-xs">Bom</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                <span className="text-xs">Alerta</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-xs">Crítico</span>
              </div>
            </div>
          </div>
        )}
        
        {isAddMode && (
          <div className="absolute bottom-4 left-4 right-4 bg-white p-4 rounded-lg shadow-lg">
            <h3 className="font-medium text-sm mb-2">Adicionar nova CTO</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="cto-name" className="text-xs">Nome da CTO</Label>
                <Input 
                  id="cto-name"
                  placeholder="Ex: CTO-123"
                  value={newElement.name}
                  onChange={(e) => setNewElement({...newElement, name: e.target.value})}
                  className="h-8 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs">Capacidade</Label>
                <select
                  value={newElement.properties.capacity}
                  onChange={(e) => setNewElement({
                    ...newElement, 
                    properties: {
                      ...newElement.properties,
                      capacity: parseInt(e.target.value)
                    }
                  })}
                  className="w-full h-8 text-sm rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="2">2 portas</option>
                  <option value="4">4 portas</option>
                  <option value="8">8 portas</option>
                  <option value="16">16 portas</option>
                  <option value="32">32 portas</option>
                </select>
              </div>
              
              <div className="col-span-2">
                <Label htmlFor="cto-address" className="text-xs">Endereço</Label>
                <Input 
                  id="cto-address"
                  placeholder="Ex: Rua A, 123 - Centro"
                  value={newElement.properties.address || ""}
                  onChange={(e) => setNewElement({
                    ...newElement, 
                    properties: {
                      ...newElement.properties,
                      address: e.target.value
                    }
                  })}
                  className="h-8 text-sm"
                />
              </div>
              
              <div className="col-span-2">
                <Label className="text-xs">Posição (Lat/Lng)</Label>
                <div className="flex gap-2 items-center">
                  <div className="text-xs bg-gray-100 p-1 rounded flex-1 overflow-hidden">
                    Lat: {newElement.position.lat.toFixed(6)}
                  </div>
                  <div className="text-xs bg-gray-100 p-1 rounded flex-1 overflow-hidden">
                    Lng: {newElement.position.lng.toFixed(6)}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-3">
              <Button 
                variant="outline"
                size="sm"
                onClick={() => setIsAddMode(false)}
              >
                Cancelar
              </Button>
              <Button
                size="sm"
                onClick={saveNewElement}
                disabled={!newElement.name.trim() || newElement.position.lat === 0}
              >
                <Save className="w-3 h-3 mr-1" />
                Salvar CTO
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Mapa de Rede FTTH
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="flex items-center gap-1">
              <Network className="h-3 w-3" />
              {elements.filter(e => e.type === "CTO").length} CTOs
            </Badge>
            <Badge variant={activeAlerts.length > 0 ? "destructive" : "outline"} className="flex items-center gap-1">
              {activeAlerts.length > 0 ? <AlertTriangle className="h-3 w-3" /> : <Wifi className="h-3 w-3" />}
              {activeAlerts.length > 0 ? `${activeAlerts.length} Alertas` : "Rede Estável"}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchPerformanceData}
              disabled={isUpdatingData}
              className="h-8"
            >
              <RefreshCw className={`h-4 w-4 ${isUpdatingData ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-0">
        {renderSimulatedMap()}
      </CardContent>
    </Card>
  );
}
