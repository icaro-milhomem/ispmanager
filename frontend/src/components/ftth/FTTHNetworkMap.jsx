import React, { useEffect, useRef, useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  Network, 
  Box, 
  Home, 
  Router, 
  Wifi, 
  Cable, 
  AlertTriangle,
  X
} from "lucide-react";

// Componente que simula um mapa interativo com HTML Canvas
export default function FTTHNetworkMap({
  elements = [],
  connections = [],
  selectedElement,
  selectedConnection,
  onSelectElement,
  onSelectConnection,
  onAddElement,
  onStartConnection,
  onCompleteConnection,
  center = [-23.550520, -46.633308],
  zoom = 13,
  mapType = "satellite",
  showLabels = true,
  mapMode = "view",
  isDrawingConnection = false,
  connectionStartElement = null,
  networkElementTypes,
  cableTypes
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [hoveredElement, setHoveredElement] = useState(null);
  const [hoveredConnection, setHoveredConnection] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [bgImage, setBgImage] = useState(null);
  
  // Imagens de fundo para os diferentes tipos de mapa
  const mapImages = {
    street: "https://images.unsplash.com/photo-1577086664693-894d8405334a?q=80&w=2574&auto=format&fit=crop",
    satellite: "https://images.unsplash.com/photo-1569336415962-a4bd9f69c07b?q=80&w=2531&auto=format&fit=crop",
    hybrid: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?q=80&w=2544&auto=format&fit=crop"
  };
  
  // Carregar imagem de fundo quando o tipo de mapa mudar
  useEffect(() => {
    const img = new Image();
    img.src = mapImages[mapType];
    img.onload = () => setBgImage(img);
  }, [mapType]);
  
  // Ajustar tamanho do canvas quando o componente montar ou o contêiner redimensionar
  useEffect(() => {
    const updateCanvasSize = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setCanvasSize({ width, height });
      }
    };
    
    updateCanvasSize();
    
    const resizeObserver = new ResizeObserver(updateCanvasSize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    
    return () => {
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
    };
  }, []);
  
  // Renderizar o mapa quando houver mudanças nos dados ou canvas
  useEffect(() => {
    if (!canvasRef.current || canvasSize.width === 0 || canvasSize.height === 0) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;
    
    renderMap(ctx);
  }, [elements, connections, selectedElement, selectedConnection, scale, offset, canvasSize, bgImage, isDrawingConnection, connectionStartElement, hoveredElement, hoveredConnection, showLabels]);
  
  // Converter coordenadas geográficas para coordenadas do canvas
  const geoToCanvas = (lat, lng) => {
    const centerLat = center[0];
    const centerLng = center[1];
    
    // Fator de escala para converter graus em pixels
    const latScale = 10000 * scale;
    const lngScale = 10000 * scale;
    
    const x = canvasSize.width / 2 + (lng - centerLng) * lngScale + offset.x;
    const y = canvasSize.height / 2 - (lat - centerLat) * latScale + offset.y;
    
    return { x, y };
  };
  
  // Converter coordenadas do canvas para coordenadas geográficas
  const canvasToGeo = (x, y) => {
    const centerLat = center[0];
    const centerLng = center[1];
    
    // Fator de escala para converter pixels em graus
    const latScale = 10000 * scale;
    const lngScale = 10000 * scale;
    
    const lng = centerLng + (x - canvasSize.width / 2 - offset.x) / lngScale;
    const lat = centerLat - (y - canvasSize.height / 2 - offset.y) / latScale;
    
    return { lat, lng };
  };
  
  // Encontrar elemento sob o cursor
  const findElementAtPosition = (x, y, radius = 15) => {
    for (const element of elements) {
      const pos = geoToCanvas(element.position.lat, element.position.lng);
      const distance = Math.sqrt((pos.x - x) ** 2 + (pos.y - y) ** 2);
      
      if (distance <= radius) {
        return element;
      }
    }
    
    return null;
  };
  
  // Encontrar conexão sob o cursor
  const findConnectionAtPosition = (x, y, threshold = 5) => {
    for (const connection of connections) {
      const sourceElement = elements.find(e => e.id === connection.source);
      const targetElement = elements.find(e => e.id === connection.target);
      
      if (!sourceElement || !targetElement) continue;
      
      const sourcePos = geoToCanvas(sourceElement.position.lat, sourceElement.position.lng);
      const targetPos = geoToCanvas(targetElement.position.lat, targetElement.position.lng);
      
      // Calcular distância do ponto à linha
      const distance = distanceToLine(x, y, sourcePos.x, sourcePos.y, targetPos.x, targetPos.y);
      
      if (distance <= threshold) {
        return connection;
      }
    }
    
    return null;
  };
  
  // Calcular distância de um ponto a uma linha
  const distanceToLine = (x, y, x1, y1, x2, y2) => {
    const A = x - x1;
    const B = y - y1;
    const C = x2 - x1;
    const D = y2 - y1;
    
    const dot = A * C + B * D;
    const len_sq = C * C + D * D;
    let param = -1;
    
    if (len_sq !== 0) {
      param = dot / len_sq;
    }
    
    let xx, yy;
    
    if (param < 0) {
      xx = x1;
      yy = y1;
    } else if (param > 1) {
      xx = x2;
      yy = y2;
    } else {
      xx = x1 + param * C;
      yy = y1 + param * D;
    }
    
    const dx = x - xx;
    const dy = y - yy;
    
    return Math.sqrt(dx * dx + dy * dy);
  };
  
  // Renderizar o mapa
  const renderMap = (ctx) => {
    if (!ctx) return;
    
    // Limpar canvas
    ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);
    
    // Desenhar imagem de fundo
    if (bgImage) {
      ctx.globalAlpha = 0.5; // Tornar a imagem translúcida
      ctx.drawImage(bgImage, 0, 0, canvasSize.width, canvasSize.height);
      ctx.globalAlpha = 1.0;
    } else {
      // Fundo padrão se a imagem não estiver carregada
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);
    }
    
    // Desenhar grade de referência
    ctx.strokeStyle = 'rgba(200, 200, 200, 0.3)';
    ctx.lineWidth = 1;
    
    // Linhas horizontais
    for (let y = 0; y < canvasSize.height; y += 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvasSize.width, y);
      ctx.stroke();
    }
    
    // Linhas verticais
    for (let x = 0; x < canvasSize.width; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvasSize.height);
      ctx.stroke();
    }
    
    // Desenhar conexões
    for (const connection of connections) {
      const sourceElement = elements.find(e => e.id === connection.source);
      const targetElement = elements.find(e => e.id === connection.target);
      
      if (!sourceElement || !targetElement) continue;
      
      const sourcePos = geoToCanvas(sourceElement.position.lat, sourceElement.position.lng);
      const targetPos = geoToCanvas(targetElement.position.lat, targetElement.position.lng);
      
      // Definir estilo da conexão
      let lineWidth = 2;
      let color = cableTypes[connection.type]?.color || '#999';
      let isSelected = selectedConnection && connection.id === selectedConnection.id;
      let isHovered = hoveredConnection && connection.id === hoveredConnection.id;
      
      if (isSelected) {
        lineWidth = 4;
        color = '#fff';
      } else if (isHovered) {
        lineWidth = 3;
        // Manter a cor original mas com maior opacidade
      }
      
      // Desenhar linha da conexão
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      
      if (connection.status === 'maintenance' || connection.status === 'problem') {
        // Linha tracejada para indicar manutenção ou problema
        ctx.setLineDash([5, 3]);
      } else {
        ctx.setLineDash([]);
      }
      
      ctx.moveTo(sourcePos.x, sourcePos.y);
      ctx.lineTo(targetPos.x, targetPos.y);
      ctx.stroke();
      
      // Resetar estilo de linha
      ctx.setLineDash([]);
      
      // Se for uma conexão selecionada ou hover, adicionar informações
      if (isSelected || isHovered) {
        // Ponto médio da linha
        const midX = (sourcePos.x + targetPos.x) / 2;
        const midY = (sourcePos.y + targetPos.y) / 2;
        
        // Desenhar fundo para o texto
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        const text = cableTypes[connection.type]?.name || connection.type;
        const textWidth = ctx.measureText(text).width + 8;
        ctx.fillRect(midX - textWidth / 2, midY - 15, textWidth, 20);
        
        // Desenhar texto
        ctx.fillStyle = '#fff';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, midX, midY - 5);
      }
    }
    
    // Desenhar linha em construção (se estiver desenhando uma conexão)
    if (isDrawingConnection && connectionStartElement) {
      const sourcePos = geoToCanvas(
        connectionStartElement.position.lat, 
        connectionStartElement.position.lng
      );
      
      ctx.beginPath();
      ctx.strokeStyle = '#00FFFF';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 3]); // Linha tracejada para indicar que está em construção
      ctx.moveTo(sourcePos.x, sourcePos.y);
      ctx.lineTo(mousePosition.x, mousePosition.y);
      ctx.stroke();
      
      // Resetar estilo de linha
      ctx.setLineDash([]);
    }
    
    // Desenhar elementos
    for (const element of elements) {
      const pos = geoToCanvas(element.position.lat, element.position.lng);
      const radius = 12;
      
      // Definir estilo para elemento selecionado ou com hover
      const isSelected = selectedElement && element.id === selectedElement.id;
      const isHovered = hoveredElement && element.id === hoveredElement.id;
      const isConnectionStart = connectionStartElement && element.id === connectionStartElement.id;
      
      // Desenhar círculo de fundo (aura) para elemento selecionado ou hover
      if (isSelected || isHovered || isConnectionStart) {
        ctx.beginPath();
        ctx.fillStyle = isSelected ? 'rgba(255, 255, 255, 0.5)' : 
                        isConnectionStart ? 'rgba(0, 255, 255, 0.3)' : 
                        'rgba(255, 255, 255, 0.3)';
        ctx.arc(pos.x, pos.y, radius + 5, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Desenhar círculo principal do elemento
      ctx.beginPath();
      ctx.fillStyle = networkElementTypes[element.type]?.color || '#666';
      ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
      ctx.fill();
      
      // Se for uma CTO, desenhar um ícone ou símbolo adicional
      if (element.type === 'CTO') {
        ctx.beginPath();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        // Desenhar símbolo de CTO (um "X" dentro do círculo)
        ctx.moveTo(pos.x - 5, pos.y - 5);
        ctx.lineTo(pos.x + 5, pos.y + 5);
        ctx.moveTo(pos.x + 5, pos.y - 5);
        ctx.lineTo(pos.x - 5, pos.y + 5);
        ctx.stroke();
      }
      
      // Se estiver exibindo rótulos ou se o elemento estiver selecionado/hover
      if (showLabels || isSelected || isHovered) {
        const label = element.name;
        
        // Desenhar fundo para o texto
        ctx.fillStyle = isSelected ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.6)';
        const textWidth = ctx.measureText(label).width + 10;
        ctx.fillRect(pos.x - textWidth / 2, pos.y + radius + 2, textWidth, 20);
        
        // Desenhar texto
        ctx.fillStyle = '#fff';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, pos.x, pos.y + radius + 12);
      }
    }
  };
  
  // Eventos do mouse
  const handleMouseDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Verificar se clicou em um elemento
    const clickedElement = findElementAtPosition(x, y);
    const clickedConnection = findConnectionAtPosition(x, y);
    
    // Se estiver no modo adicionar, adicionar um elemento no local clicado
    if (mapMode === 'add' && !clickedElement) {
      const geoPos = canvasToGeo(x, y);
      onAddElement(geoPos);
      return;
    }
    
    // Se estiver no modo conectar
    if (mapMode === 'connect') {
      if (clickedElement) {
        if (isDrawingConnection) {
          // Completar a conexão se já estiver desenhando
          onCompleteConnection(clickedElement);
        } else {
          // Iniciar a conexão
          onStartConnection(clickedElement);
        }
      }
      return;
    }
    
    // No modo visualizar
    if (clickedElement) {
      onSelectElement(clickedElement);
    } else if (clickedConnection) {
      onSelectConnection(clickedConnection);
    } else {
      // Iniciar arrasto do mapa
      setIsDragging(true);
      setDragStart({ x, y });
    }
  };
  
  const handleMouseMove = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setMousePosition({ x, y });
    
    // Verificar se o mouse está sobre um elemento
    setHoveredElement(findElementAtPosition(x, y));
    setHoveredConnection(findConnectionAtPosition(x, y));
    
    // Se estiver arrastando, mover o mapa
    if (isDragging) {
      const dx = x - dragStart.x;
      const dy = y - dragStart.y;
      
      setOffset(prev => ({
        x: prev.x + dx,
        y: prev.y + dy
      }));
      
      setDragStart({ x, y });
    }
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  const handleMouseLeave = () => {
    setIsDragging(false);
    setHoveredElement(null);
    setHoveredConnection(null);
  };
  
  const handleWheel = (e) => {
    e.preventDefault();
    
    // Fator de zoom (menos negativo para zoom mais suave)
    const zoomFactor = -0.0005;
    
    // Calcular novo zoom
    let newScale = scale * (1 + e.deltaY * zoomFactor);
    
    // Limitar zoom mínimo e máximo
    newScale = Math.max(0.5, Math.min(5, newScale));
    
    setScale(newScale);
  };
  
  return (
    <div 
      ref={containerRef}
      className="relative h-full w-full overflow-hidden"
    >
      <canvas
        ref={canvasRef}
        className="cursor-move"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onWheel={handleWheel}
      />
      
      <div className="absolute bottom-4 right-4 bg-white p-2 rounded shadow-md">
        <div className="flex gap-2">
          <button
            className="p-1 rounded hover:bg-gray-100"
            onClick={() => setScale(prev => Math.min(5, prev * 1.2))}
          >
            +
          </button>
          <button
            className="p-1 rounded hover:bg-gray-100"
            onClick={() => setScale(prev => Math.max(0.5, prev / 1.2))}
          >
            -
          </button>
          <button
            className="p-1 rounded hover:bg-gray-100"
            onClick={() => {
              setScale(1);
              setOffset({ x: 0, y: 0 });
            }}
          >
            Reset
          </button>
        </div>
      </div>
      
      {mapMode !== 'view' && (
        <div className="absolute top-4 left-4 bg-white p-2 rounded shadow-md">
          <Badge variant="outline" className="font-medium">
            {mapMode === 'add' ? 'Modo: Adicionar Elemento' : 'Modo: Conectar Elementos'}
          </Badge>
          {isDrawingConnection && (
            <p className="text-xs mt-1">Clique em outro elemento para conectar</p>
          )}
        </div>
      )}
    </div>
  );
}