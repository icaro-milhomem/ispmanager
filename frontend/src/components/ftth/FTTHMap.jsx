import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
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
  X as XIcon,
  Cable,
  Split,
  Pencil
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
import { 
  CABLE_TYPES, 
  FIBER_COLORS, 
  SPLITTER_TYPES, 
  SPLITTER_RATIOS,
  ELEMENT_STATUS 
} from '@/config/ftthConfig';
import FiberConnectionForm from './FiberConnectionForm';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "react-hot-toast";
import { createEntityClient } from '../../api/apiClient';
import { ctoService } from '../../services/ctoService';

// Corrigir o ícone do marcador do Leaflet
import L from 'leaflet';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Mapeamento de cores em português para hexadecimal
const COLOR_MAP = {
  'verde': '#22c55e',
  'azul': '#3b82f6',
  'vermelho': '#ef4444',
  'amarelo': '#eab308',
  'laranja': '#f97316',
  'roxo': '#a855f7',
  'rosa': '#ec4899',
  'preto': '#000000',
  'branco': '#ffffff'
};

// Componente para capturar cliques no mapa
function MapClickHandler({ onMapClick }) {
  const map = useMap();
  
  useEffect(() => {
    const handleClick = (e) => {
      console.log('Mapa clicado:', e.latlng);
      onMapClick(e);
    };

    map.on('click', handleClick);
    
    return () => {
      map.off('click', handleClick);
    };
  }, [map, onMapClick]);

  return null;
}

// Componente de marcador arrastável
function DraggableMarker({ position, element, onDragEnd, children }) {
  const markerRef = useRef(null);
  const eventHandlers = {
    dragend() {
      const marker = markerRef.current;
      if (marker != null) {
        const newPos = marker.getLatLng();
        onDragEnd(element.id, { lat: newPos.lat, lng: newPos.lng });
      }
    },
  };

  return (
    <Marker
      draggable={true}
      eventHandlers={eventHandlers}
      position={position}
      ref={markerRef}
    >
      {children}
    </Marker>
  );
}

// Componente para atualizar o centro do mapa
function MapCenter({ center }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center);
  }, [center, map]);
  return null;
}

// Componente para renderizar o splitter no mapa
function SplitterMarker({ position, ratio, type }) {
  const splitterType = SPLITTER_TYPES[type];
  const outputs = SPLITTER_RATIOS.find(r => r.value === ratio)?.outputs || 8;

  return (
    <Marker position={position} icon={L.divIcon({
      className: 'splitter-marker',
      html: `
        <div class="bg-white p-2 rounded-md shadow-md text-xs border">
          <div class="font-medium">${ratio}</div>
          <div class="text-gray-500">${splitterType.name}</div>
        </div>
      `,
      iconSize: [60, 40],
      iconAnchor: [30, 20]
    })}>
    </Marker>
  );
}

// Componente para renderizar a conexão de fibra
function FiberConnection({ connection, color, onEdit, onDelete }) {
  if (!connection || !connection.coordinates || connection.coordinates.length < 2) {
    console.error('Conexão inválida:', connection);
    return null;
  }

  // Função para obter a cor correta
  const getColor = (colorStr) => {
    // Se for uma cor em português, usar o mapeamento
    if (typeof colorStr === 'string' && COLOR_MAP[colorStr.toLowerCase()]) {
      return COLOR_MAP[colorStr.toLowerCase()];
    }
    // Se for um código hexadecimal válido, usar diretamente
    if (typeof colorStr === 'string' && /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(colorStr)) {
      return colorStr;
    }
    // Cor padrão caso nenhuma das anteriores seja válida
    return '#00FF00'; // Verde como cor padrão
  };

  // Garantir que as coordenadas estejam no formato correto [lat, lng]
  const positions = connection.coordinates.map(coord => {
    if (Array.isArray(coord)) {
      return coord;
    }
    return [coord.lat, coord.lng];
  });

  const [showPopup, setShowPopup] = useState(false);
  const [popupPosition, setPopupPosition] = useState(null);

  // Calcular o ponto médio da linha para posicionar o popup
  const getMidPoint = () => {
    const mid = Math.floor(positions.length / 2);
    return positions[mid];
  };

  const handleLineClick = (e) => {
    L.DomEvent.stopPropagation(e);
    setPopupPosition(e.latlng);
    setShowPopup(true);
  };

  return (
    <>
      <Polyline
        positions={positions}
        pathOptions={{
          color: getColor(color),
          weight: 3,
          opacity: 1,
          dashArray: null
        }}
        eventHandlers={{
          click: handleLineClick
        }}
      />
      {showPopup && popupPosition && (
        <Popup
          position={popupPosition}
          onClose={() => setShowPopup(false)}
        >
          <div className="p-2 space-y-2">
            <div className="font-medium">Conexão de Fibra</div>
            <div className="text-sm text-gray-600">
              {connection.fibers} FO - {connection.color}
            </div>
            <div className="flex gap-2 mt-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setShowPopup(false);
                  onEdit(connection);
                }}
              >
                <Pencil className="w-4 h-4 mr-1" />
                Editar
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => {
                  if (window.confirm('Tem certeza que deseja excluir esta conexão?')) {
                    setShowPopup(false);
                    onDelete(connection);
                  }
                }}
              >
                <Trash className="w-4 h-4 mr-1" />
                Excluir
              </Button>
            </div>
          </div>
        </Popup>
      )}
    </>
  );
}

// Constantes para tipos de fibra
const FIBER_OPTIONS = [
  { value: 1, label: '1 FO' },
  { value: 2, label: '2 FO' },
  { value: 4, label: '4 FO' },
  { value: 6, label: '6 FO' },
  { value: 8, label: '8 FO' },
  { value: 12, label: '12 FO' },
  { value: 24, label: '24 FO' },
  { value: 36, label: '36 FO' }
];

export default function FTTHMap({ 
  elements = [], 
  fiberPaths = [], 
  onElementClick,
  onAddElement,
  onUpdateElement,
  onDeleteElement,
  onAddConnection,
  onUpdateConnection,
  onDeleteConnection
}) {
  const mapRef = useRef(null);
  const [selectedElement, setSelectedElement] = useState(null);
  const [isAddMode, setIsAddMode] = useState(false);
  const [isDrawingConnection, setIsDrawingConnection] = useState(false);
  const [connectionStart, setConnectionStart] = useState(null);
  const [connectionEnd, setConnectionEnd] = useState(null);
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
  
  const [searchAddress, setSearchAddress] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const [newCTOName, setNewCTOName] = useState('');
  const [newCTOCapacity, setNewCTOCapacity] = useState(16);
  const [newCTOAddress, setNewCTOAddress] = useState('');
  const [showNewCTOPopup, setShowNewCTOPopup] = useState(false);
  const [newCTOPosition, setNewCTOPosition] = useState(null);
  
  const [showConnectionForm, setShowConnectionForm] = useState(false);
  const [connectionFormData, setConnectionFormData] = useState(null);
  
  const [drawingPoints, setDrawingPoints] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  
  const [selectedFiberCount, setSelectedFiberCount] = useState(12);
  const [selectedFiberColor, setSelectedFiberColor] = useState(FIBER_COLORS[0]);
  const [editingPath, setEditingPath] = useState(null);
  
  // Posição inicial do mapa (Imperatriz, MA)
  const initialCenter = [-5.5256, -47.4795];
  const initialZoom = 13;

  // Criar cliente de API para conexões FTTH
  const ftthConnectionsClient = createEntityClient('ftth/connections');

  // Adicionar estado local para elementos (CTOs)
  const [localElements, setLocalElements] = useState(elements);

  // Adicionar estado local para fiberPaths
  const [localFiberPaths, setLocalFiberPaths] = useState(fiberPaths);

  // Atualizar estado local quando as props mudarem
  useEffect(() => {
    setLocalElements(elements);
    setLocalFiberPaths(fiberPaths);
  }, [elements, fiberPaths]);

  // Função para salvar a posição atual do mapa
  const saveMapPosition = () => {
    if (mapRef.current) {
      const center = mapRef.current.getCenter();
      const zoom = mapRef.current.getZoom();
      localStorage.setItem('mapPosition', JSON.stringify({
        center: [center.lat, center.lng],
        zoom
      }));
    }
  };

  // Função para carregar a última posição salva do mapa
  const loadMapPosition = () => {
    const savedPosition = localStorage.getItem('mapPosition');
    if (savedPosition) {
      const { center, zoom } = JSON.parse(savedPosition);
      return { center, zoom };
    }
    return { center: initialCenter, zoom: initialZoom };
  };
  
  useEffect(() => {
    fetchPerformanceData();
    
    const interval = setInterval(() => {
      fetchPerformanceData();
    }, 30000);
    
    return () => {
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    console.log("Elementos recebidos no mapa:", elements);
    if (elements.length > 0 && mapRef.current) {
      const bounds = new L.LatLngBounds(elements.map(e => [e.position.lat, e.position.lng]));
      mapRef.current.fitBounds(bounds);
    }
  }, [elements]);

  // Atualizar elementos locais quando as props mudarem
  useEffect(() => {
    console.log('Atualizando elementos locais:', elements);
    setLocalElements(elements);
  }, [elements]);

  // Atualizar caminhos de fibra quando as props mudarem
  useEffect(() => {
    console.log('Atualizando caminhos de fibra:', fiberPaths);
    setLocalFiberPaths(fiberPaths);
  }, [fiberPaths]);

  const handleDragEnd = async (elementId, newPosition) => {
    try {
      const updatedElement = elements.find(e => e.id === elementId);
      if (!updatedElement) return;

      if (updatedElement.type === 'CTO') {
        await ctoService.updatePosition(elementId, newPosition);
      }
      
      onUpdateElement(elementId, { ...updatedElement, position: newPosition });
      toast.success('Posição atualizada com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar posição:', error);
      toast.error('Erro ao atualizar posição');
    }
  };
  
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
      }
    });
    
    setPerformanceData(perfData);
    setLastUpdated(new Date());
    setIsUpdatingData(false);
  };
  
  const handleMapClick = (e) => {
    console.log('Clique no mapa detectado:', e.latlng);
    
    if (isAddMode) {
      console.log('Modo adicionar CTO ativo');
      setNewCTOPosition(e.latlng);
      setShowNewCTOPopup(true);
      return;
    }

    if (isDrawingConnection) {
      console.log('Modo desenho ativo - Adicionando ponto:', e.latlng);
      const newPoint = [e.latlng.lat, e.latlng.lng]; // Convertendo para array [lat, lng]
      setDrawingPoints(prev => {
        const newPoints = [...prev, newPoint];
        console.log('Pontos atualizados:', newPoints);
        return newPoints;
      });
    }
  };

  const handleAddNewCTO = async () => {
    console.log('handleAddNewCTO chamado:', newCTOName, newCTOPosition);
    
    // Verificar se já existe uma CTO com o mesmo nome
    const ctoExists = localElements.some(element => 
      element.name.toLowerCase() === newCTOName.toLowerCase()
    );

    if (ctoExists) {
      toast.error('Já existe uma CTO com este nome. Por favor, escolha outro nome.');
      return;
    }

    if (newCTOName && newCTOPosition) {
      try {
        // Preparar dados da nova CTO no formato esperado pelo backend
        const newCTO = {
          name: newCTOName,
          type: 'cto',
          position: newCTOPosition,
          capacity: newCTOCapacity,
          address: newCTOAddress || '',
          status: 'active'
        };

        console.log('Dados preparados para criar CTO:', newCTO);
        
        // Chamar callback para persistir mudanças
        if (onAddElement) {
          try {
            // Usar o mesmo formato que o formulário principal usa
            const elementToAdd = {
              name: newCTOName,
              type: "CTO",
              position: {
                lat: newCTOPosition.lat,
                lng: newCTOPosition.lng
              },
              capacity: newCTOCapacity,
              address: newCTOAddress || ''
            };

            console.log('Enviando dados para criar CTO:', elementToAdd);
            const savedCTO = await onAddElement(elementToAdd);
            console.log('CTO salva com sucesso:', savedCTO);
            
            if (savedCTO) {
              // Atualizar estado local com a CTO salva
              setLocalElements(prev => [...prev, savedCTO]);
              toast.success('CTO adicionada com sucesso!');
            }
          } catch (error) {
            console.error('Erro ao salvar CTO:', error);
            toast.error('Erro ao salvar CTO: ' + (error.message || 'Erro desconhecido'));
            throw error;
          }
        }
        
        // Limpar formulário
        setShowNewCTOPopup(false);
        setNewCTOPosition(null);
        setNewCTOName('');
        setNewCTOCapacity(64);
        setNewCTOAddress('');
        setIsAddMode(false);
      } catch (error) {
        console.error('Erro ao adicionar CTO:', error);
        toast.error('Erro ao adicionar CTO: ' + (error.message || 'Erro desconhecido'));
      }
    }
  };
  
  const handleElementClick = (element) => {
    console.log('handleElementClick chamado:', element);
    if (isDrawingConnection) {
      if (!connectionStart) {
        setConnectionStart(element);
        console.log('Primeiro elemento selecionado:', element);
      } else if (connectionStart.id !== element.id) {
        console.log('Segundo elemento selecionado:', element);
        setConnectionEnd(element);
        setConnectionFormData({
          type: 'direct',
          sourceId: connectionStart.id,
          targetId: element.id,
          source: connectionStart,
          target: element,
          coordinates: [
            connectionStart.position,
            element.position
          ],
          fibers: 12, // valor padrão
          color: 'blue', // valor padrão
          hasSplitter: false
        });
        setShowConnectionForm(true);
      }
    } else if (onElementClick) {
      onElementClick(element);
    }
  };

  const handleFinishDrawing = async () => {
    console.log('Finalizando desenho. Pontos:', drawingPoints);
    
    if (drawingPoints.length < 2) {
      toast.error('Desenhe pelo menos dois pontos para criar uma conexão');
      return;
    }

    try {
      // Preparar dados da conexão
      const connectionData = {
        type: 'backbone',
        coordinates: drawingPoints,
        fibers: selectedFiberCount,
        color: selectedFiberColor.value || 'verde',
        hasSplitter: false
      };

      console.log('Dados da conexão para salvar:', connectionData);

      // Salvar conexão
      if (onAddConnection) {
        const savedConnection = await onAddConnection(connectionData);
        console.log('Conexão salva:', savedConnection);
        
        // Atualizar estado local
        setLocalFiberPaths(prev => [...prev, savedConnection]);
      }

      // Limpar estado de desenho
      setDrawingPoints([]);
      setIsDrawingConnection(false);
      setShowConnectionForm(false);

      toast.success('Conexão adicionada com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar conexão:', error);
      toast.error('Erro ao salvar conexão. Por favor, tente novamente.');
    }
  };

  const handleCancelDrawing = () => {
    setDrawingPoints([]);
    setIsDrawingConnection(false);
    setIsDrawing(false);
  };

  const handleSaveConnection = async (connectionData) => {
    console.log('Iniciando salvamento de conexão:', connectionData);
    
    try {
      // Validar dados básicos
      if (!connectionData || !connectionData.coordinates) {
        throw new Error('Dados da conexão inválidos');
      }

      // Processar coordenadas
      const processedCoordinates = connectionData.coordinates.map((coord, index) => {
        console.log(`Processando coordenada ${index}:`, coord);

        // Se for array [lat, lng]
        if (Array.isArray(coord)) {
          if (coord.length === 2) {
            const [lat, lng] = coord.map(Number);
            if (!isNaN(lat) && !isNaN(lng)) {
              return [lat, lng];
            }
          }
          throw new Error(`Coordenada ${index} inválida: formato de array incorreto`);
        }

        // Se for objeto {lat, lng}
        if (typeof coord === 'object' && coord !== null) {
          if (coord.lat !== undefined && coord.lng !== undefined) {
            const lat = Number(coord.lat);
            const lng = Number(coord.lng);
            if (!isNaN(lat) && !isNaN(lng)) {
              return [lat, lng];
            }
          }
          throw new Error(`Coordenada ${index} inválida: formato de objeto incorreto`);
        }

        // Se for string "lat,lng"
        if (typeof coord === 'string') {
          const [lat, lng] = coord.split(',').map(Number);
          if (!isNaN(lat) && !isNaN(lng)) {
            return [lat, lng];
          }
          throw new Error(`Coordenada ${index} inválida: formato de string incorreto`);
        }

        throw new Error(`Coordenada ${index} inválida: formato não reconhecido`);
      });

      console.log('Coordenadas processadas:', processedCoordinates);

      if (processedCoordinates.length < 2) {
        throw new Error('É necessário pelo menos duas coordenadas válidas');
      }

      // Preparar dados para salvar
      const connectionToSave = {
        ...connectionData,
        coordinates: processedCoordinates,
        color: connectionData.color || '#3b82f6'
      };

      console.log('Dados da conexão para salvar:', connectionToSave);

      // Salvar conexão
      const savedConnection = await ftthConnectionsClient.create(connectionToSave);
      console.log('Conexão salva com sucesso:', savedConnection);

      // Atualizar estado local imediatamente
      if (typeof onAddConnection === 'function') {
        onAddConnection(savedConnection);
      }

      // Limpar estados
      setConnectionFormData(null);
      setDrawingPoints([]);
      setIsDrawingConnection(false);
      setConnectionStart(null);
      setConnectionEnd(null);
      setShowConnectionForm(false);

      toast.success('Conexão salva com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar conexão:', error);
      toast.error(error.message || 'Erro ao salvar conexão');
    }
  };

  const handleEditConnection = (connection) => {
    setConnectionFormData({
      ...connection,
      isEditing: true
    });
    setShowConnectionForm(true);
  };

  const handleDeleteConnection = async (connection) => {
    try {
      await ftthConnectionsClient.delete(connection.id);
      
      // Atualizar estado local imediatamente
      if (onDeleteConnection) {
        onDeleteConnection(connection.id);
      }

      // Forçar atualização do componente
      const updatedPaths = fiberPaths.filter(path => path.id !== connection.id);
      setFiberPaths(updatedPaths);
      
      toast.success('Conexão excluída com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir conexão:', error);
      toast.error('Erro ao excluir a conexão');
    }
  };

  const getPerformanceColor = (elementId, defaultColor = "green") => {
    if (!showPerformance || !performanceData[elementId]) return defaultColor;
    
    const data = performanceData[elementId];
    let value;
    
    switch (performanceMetric) {
      case 'traffic':
        value = data.traffic;
        return value > 90 ? '#ef4444' : value > 70 ? '#f97316' : '#22c55e';
      case 'latency':
        value = data.latency;
        return value > 40 ? '#ef4444' : value > 20 ? '#f97316' : '#22c55e';
      case 'packetLoss':
        value = data.packetLoss;
        return value > 1.5 ? '#ef4444' : value > 0.5 ? '#f97316' : '#22c55e';
      default:
        return defaultColor;
    }
  };
  
  // Função para buscar endereço usando Nominatim (OpenStreetMap)
  const searchAddressOnMap = async () => {
    if (!searchAddress.trim()) return;
    
    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchAddress)}&limit=5`
      );
      const data = await response.json();
      setSearchResults(data);
      
      if (data.length > 0) {
        const firstResult = data[0];
        mapRef.current.setView([firstResult.lat, firstResult.lon], 16);
      }
    } catch (error) {
      console.error('Erro ao buscar endereço:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleMarkerDrag = (elementId, newPosition) => {
    console.log("Marcador arrastado:", elementId, newPosition);
    const element = elements.find(e => e.id === elementId);
    if (element && onUpdateElement) {
      onUpdateElement({
        ...element,
        position: newPosition
      });
    }
  };

  const handlePathPointDrag = (index, newPos) => {
    const newPoints = [...drawingPoints];
    newPoints[index] = newPos;
    setDrawingPoints(newPoints);
  };

  return (
    <div className="w-full h-full">
      <Card className="w-full h-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Mapa FTTH</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={isAddMode ? "secondary" : "outline"}
              onClick={() => setIsAddMode(!isAddMode)}
              className="flex items-center"
            >
              <Plus className="w-4 h-4 mr-1" />
              {isAddMode ? "Cancelar" : "Adicionar CTO"}
            </Button>
            <Button
              size="sm"
              variant={isDrawingConnection ? "secondary" : "outline"}
              onClick={() => {
                setIsDrawingConnection(!isDrawingConnection);
                setDrawingPoints([]);
              }}
              className="flex items-center"
            >
              <Network className="w-4 h-4 mr-1" />
              {isDrawingConnection ? "Cancelar" : "Adicionar Fibra"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative w-full h-[600px]">
            {isDrawingConnection && !showConnectionForm && (
              <div className="absolute top-2 right-2 bg-white p-4 rounded-md shadow-lg z-[1000] w-64">
                <div className="space-y-4">
                  <div>
                    <Label>Quantidade de FO</Label>
                    <Select value={selectedFiberCount} onValueChange={value => setSelectedFiberCount(Number(value))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a quantidade de FO" />
                      </SelectTrigger>
                      <SelectContent>
                        {FIBER_OPTIONS.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Cor da Fibra</Label>
                    <div className="flex gap-2 mt-1">
                      {FIBER_COLORS.map(color => (
                        <Button
                          key={color.value}
                          size="sm"
                          variant={selectedFiberColor.value === color.value ? "default" : "outline"}
                          className="w-8 h-8 p-0"
                          style={{ backgroundColor: color.hex }}
                          onClick={() => setSelectedFiberColor(color)}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <MapContainer
              center={loadMapPosition().center}
              zoom={loadMapPosition().zoom}
              style={{ height: "100%", width: "100%" }}
              whenCreated={map => {
                console.log("Mapa criado com centro:", loadMapPosition().center);
                mapRef.current = map;
                map.on('moveend', saveMapPosition);
              }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              
              <MapClickHandler onMapClick={handleMapClick} />
              
              {localElements.map((element) => {
                console.log('Renderizando elemento:', element);
                return (
                  <DraggableMarker
                    key={element.id}
                    position={element.position}
                    element={element}
                    onDragEnd={handleDragEnd}
                  >
                    <Popup>
                      <div className="p-2">
                        <h3 className="font-bold">{element.name}</h3>
                        <p>Tipo: {element.type}</p>
                        {element.capacity && <p>Capacidade: {element.capacity}</p>}
                        {element.address && <p>Endereço: {element.address}</p>}
                      </div>
                    </Popup>
                  </DraggableMarker>
                );
              })}
              
              {localFiberPaths.map((path, index) => {
                console.log('Renderizando conexão no mapa:', {
                  index,
                  path: JSON.stringify(path),
                  coordinates: path.coordinates,
                  color: path.color
                });
                
                if (!path.coordinates || path.coordinates.length < 2) {
                  console.error('Conexão inválida detectada:', path);
                  return null;
                }

                return (
                  <FiberConnection
                    key={path.id || index}
                    connection={path}
                    color={path.color || selectedFiberColor.hex}
                    onEdit={handleEditConnection}
                    onDelete={handleDeleteConnection}
                  />
                );
              })}

              {isDrawingConnection && drawingPoints.length > 0 && (
                <Polyline
                  positions={drawingPoints}
                  pathOptions={{
                    color: selectedFiberColor.hex || '#3b82f6',
                    weight: 3,
                    opacity: 0.8,
                    dashArray: '5, 10' // Linha tracejada durante o desenho
                  }}
                />
              )}
            </MapContainer>
            
            {showNewCTOPopup && (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[1000] bg-white p-4 rounded-lg shadow-lg w-80">
                <h3 className="text-lg font-medium mb-4">Adicionar Nova CTO</h3>
                <div className="space-y-4">
                  <div>
                    <Label>Nome da CTO</Label>
                    <Input
                      value={newCTOName}
                      onChange={(e) => setNewCTOName(e.target.value)}
                      placeholder="Ex: CTO-001"
                    />
                  </div>
                  <div>
                    <Label>Capacidade</Label>
                    <Input
                      type="number"
                      value={newCTOCapacity}
                      onChange={(e) => setNewCTOCapacity(parseInt(e.target.value))}
                      min="1"
                      max="64"
                    />
                  </div>
                  <div>
                    <Label>Endereço</Label>
                    <Input
                      value={newCTOAddress}
                      onChange={(e) => setNewCTOAddress(e.target.value)}
                      placeholder="Endereço completo"
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowNewCTOPopup(false);
                        setNewCTOPosition(null);
                        setIsAddMode(false);
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleAddNewCTO}
                      disabled={!newCTOName}
                      className="bg-blue-600"
                    >
                      Adicionar
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {(isAddMode && !showNewCTOPopup) && (
              <div className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-white p-2 rounded-md shadow-lg z-[1000]">
                <p className="text-sm text-center">
                  Clique no mapa para adicionar uma CTO
                </p>
              </div>
            )}

            {isDrawingConnection && !showConnectionForm && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white p-2 rounded-md shadow-lg z-[1000]">
                <div className="flex justify-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCancelDrawing}
                  >
                    Cancelar
                  </Button>
                  <Button
                    size="sm"
                    variant="default"
                    onClick={handleFinishDrawing}
                    disabled={drawingPoints.length < 2}
                  >
                    Finalizar
                  </Button>
                </div>
              </div>
            )}

            {showConnectionForm && connectionFormData && (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[1000] bg-white p-6 rounded-lg shadow-lg w-[600px]">
                <h3 className="text-lg font-medium mb-4">
                  {connectionFormData.isEditing ? 'Editar Conexão de Fibra' : 'Adicionar Conexão de Fibra'}
                </h3>
                <FiberConnectionForm
                  initialData={connectionFormData}
                  onSave={async (formData) => {
                    if (connectionFormData.isEditing) {
                      try {
                        const updatedConnection = await ftthConnectionsClient.update(formData.id, formData);
                        if (onUpdateConnection) {
                          onUpdateConnection(updatedConnection.id, updatedConnection);
                        }
                        toast.success('Conexão atualizada com sucesso!');
                      } catch (error) {
                        console.error('Erro ao atualizar conexão:', error);
                        toast.error('Erro ao atualizar a conexão');
                        return;
                      }
                    } else {
                      await handleSaveConnection(formData);
                    }
                    setShowConnectionForm(false);
                    setConnectionFormData(null);
                    setConnectionStart(null);
                    setIsDrawingConnection(false);
                    setDrawingPoints([]);
                  }}
                  onCancel={() => {
                    setShowConnectionForm(false);
                    setConnectionFormData(null);
                    setConnectionStart(null);
                    setIsDrawingConnection(false);
                    setDrawingPoints([]);
                  }}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
