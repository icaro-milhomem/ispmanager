import React, { useEffect, useRef, useState } from 'react';
// Removendo import via CDN que não é suportado
// import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ZoomIn, 
  ZoomOut, 
  RefreshCw, 
  Info, 
  Filter, 
  Download,
  Network,
  Router,
  Home,
  Box,
  Cable
} from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";

export default function NetworkTopology({ networkData = { nodes: [], links: [] }, onNodeClick }) {
  const svgRef = useRef(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [filters, setFilters] = useState({
    showCTOs: true,
    showClients: true,
    showConnections: true
  });
  
  const colors = {
    CTO: "#2563eb",
    Client: "#16a34a",
    Connection: "#6b7280"
  };
  
  const icons = {
    CTO: <Box className="w-4 h-4" />,
    Client: <Home className="w-4 h-4" />
  };
  
  const renderNetwork = () => {
    if (!networkData.nodes.length) return null;
    
    // Filtrar nós baseado nas configurações
    const filteredNodes = networkData.nodes.filter(node => {
      if (node.type === 'CTO' && !filters.showCTOs) return false;
      if (node.type === 'Client' && !filters.showClients) return false;
      return true;
    });
    
    // Filtrar links para incluir apenas aqueles cujos nós de origem e destino estão visíveis
    const filteredLinks = networkData.links.filter(link => {
      const sourceExists = filteredNodes.some(node => node.id === link.source);
      const targetExists = filteredNodes.some(node => node.id === link.target);
      return sourceExists && targetExists;
    });
    
    // Organizar nós por tipo
    const nodesByType = {
      CTO: { y: 50, nodes: [] },
      Client: { y: 150, nodes: [] }
    };
    
    // Distribuir nós nos níveis
    filteredNodes.forEach(node => {
      if (nodesByType[node.type]) {
        nodesByType[node.type].nodes.push(node);
      }
    });
    
    // Calcular posições x para cada nível, distribuindo uniformemente
    Object.keys(nodesByType).forEach(level => {
      const nodesInLevel = nodesByType[level].nodes;
      const totalWidth = 800;
      const margin = 50;
      const availableWidth = totalWidth - 2 * margin;
      
      if (nodesInLevel.length > 0) {
        const spacing = availableWidth / (nodesInLevel.length + 1);
        nodesInLevel.forEach((node, index) => {
          node.x = margin + spacing * (index + 1);
          node.y = nodesByType[level].y;
        });
      }
    });
    
    // Renderizar links
    const renderedLinks = filteredLinks.map((link, index) => {
      const source = filteredNodes.find(n => n.id === link.source);
      const target = filteredNodes.find(n => n.id === link.target);
      
      if (!source || !target) return null;
      
      return (
        <line 
          key={`link-${index}`}
          x1={source.x}
          y1={source.y}
          x2={target.x}
          y2={target.y}
          stroke={colors.Connection}
          strokeWidth={link.capacity ? Math.log(link.capacity) * 0.5 + 1 : 1.5}
          strokeOpacity={0.6}
        />
      );
    });
    
    // Renderizar nós
    const renderedNodes = filteredNodes.map((node, index) => {
      return (
        <g 
          key={`node-${index}`}
          transform={`translate(${node.x}, ${node.y})`}
          onClick={() => {
            setSelectedNode(node);
            if (onNodeClick) onNodeClick(node);
          }}
          style={{ cursor: 'pointer' }}
        >
          <circle
            r={getNodeSize(node)}
            fill={colors[node.type] || "#999"}
            stroke="#fff"
            strokeWidth={1.5}
          />
          <text
            dy="0.35em"
            textAnchor="middle"
            fontSize={getLabelFontSize(node)}
            fill="#333"
            y={getLabelYOffset(node)}
            style={{ 
              pointerEvents: "none", 
              userSelect: "none",
              textShadow: "0 0 3px white, 0 0 3px white, 0 0 3px white, 0 0 3px white"
            }}
          >
            {node.name}
          </text>
        </g>
      );
    });
    
    return (
      <>
        {renderedLinks}
        {renderedNodes}
      </>
    );
  };
  
  // Resetar visualização
  const resetView = () => {
    setZoom(1);
    // Como não estamos usando D3.js para zoom/pan, 
    // podemos apenas redefinir o estado
  };
  
  // Ajustar zoom
  const adjustZoom = (zoomIn) => {
    setZoom(prev => {
      const newZoom = zoomIn ? prev * 1.2 : prev / 1.2;
      return Math.max(0.5, Math.min(3, newZoom));
    });
  };
  
  // Toggle de um tipo de filtro
  const toggleFilter = (key) => {
    setFilters(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };
  
  // Exportar como PNG (funcionalidade simplificada)
  const exportAsPNG = () => {
    alert("Funcionalidade de exportação não disponível nesta versão simplificada");
  };
  
  // Definir cores das conexões
  const getConnectionColor = (source, target) => {
    return colors.Connection;
  };
  
  // Definir tamanho dos nós
  const getNodeSize = (node) => {
    return node.type === "CTO" ? 12 : 8;
  };
  
  // Definir tamanho da fonte dos labels
  const getLabelFontSize = (node) => {
    return node.type === "CTO" ? "12px" : "10px";
  };
  
  // Definir posição vertical do label
  const getLabelYOffset = (node) => {
    return node.type === "CTO" ? -18 : -14;
  };
  
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between py-4">
        <CardTitle>Topologia da Rede</CardTitle>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Exibir elementos</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={filters.showCTOs}
                onCheckedChange={() => toggleFilter("showCTOs")}
              >
                CTOs
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filters.showClients}
                onCheckedChange={() => toggleFilter("showClients")}
              >
                Clientes
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filters.showConnections}
                onCheckedChange={() => toggleFilter("showConnections")}
              >
                Conexões
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button variant="outline" size="sm" onClick={resetView}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          
          <Button variant="outline" size="sm" onClick={() => adjustZoom(true)}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          
          <Button variant="outline" size="sm" onClick={() => adjustZoom(false)}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          
          <Button variant="outline" size="sm" onClick={exportAsPNG}>
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex justify-between items-center">
          <div className="flex gap-4">
            {Object.entries(colors).map(([type, color]) => (
              <div key={type} className="flex items-center gap-1">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: color }}
                ></div>
                <span className="text-xs">{type}</span>
              </div>
            ))}
          </div>
          <Badge variant="outline">
            Zoom: {(zoom * 100).toFixed(0)}%
          </Badge>
        </div>
        
        <div className="border rounded-md p-1 bg-gray-50 relative">
          <svg 
            ref={svgRef} 
            className="w-full" 
            height="400" 
            viewBox="0 0 800 400"
            style={{ 
              transform: `scale(${zoom})`,
              transformOrigin: 'center',
              transition: 'transform 0.2s ease-in-out'
            }}
          >
            {renderNetwork()}
          </svg>
          
          {networkData.nodes.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <Info className="h-10 w-10 mx-auto text-gray-300 mb-2" />
                <p className="text-gray-500">Sem dados de rede para exibir</p>
              </div>
            </div>
          )}
          
          {selectedNode && (
            <div className="absolute top-4 right-4 bg-white p-4 rounded-md shadow-lg border w-64">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium">{selectedNode.name}</h3>
                <Badge 
                  style={{ 
                    backgroundColor: colors[selectedNode.type],
                    color: "white"
                  }}
                >
                  {selectedNode.type}
                </Badge>
              </div>
              
              <div className="space-y-2 text-sm">
                {selectedNode.capacity && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Capacidade:</span>
                    <span>{selectedNode.capacity} portas</span>
                  </div>
                )}
                
                {selectedNode.status && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Status:</span>
                    <Badge variant={selectedNode.status === "online" ? "success" : "destructive"}>
                      {selectedNode.status}
                    </Badge>
                  </div>
                )}
                
                {selectedNode.utilization !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Utilização:</span>
                    <span>{selectedNode.utilization}%</span>
                  </div>
                )}
                
                {selectedNode.address && (
                  <div className="mt-2">
                    <span className="text-gray-500">Endereço:</span>
                    <p>{selectedNode.address}</p>
                  </div>
                )}
              </div>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full mt-4"
                onClick={() => onNodeClick && onNodeClick(selectedNode)}
              >
                Ver detalhes
              </Button>
            </div>
          )}
        </div>
        
        <div className="mt-4 grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium mb-2">Estatísticas da Rede</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Total de elementos:</span>
                  <span>{networkData.nodes.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>CTOs:</span>
                  <span>{networkData.nodes.filter(n => n.type === "CTO").length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Clientes:</span>
                  <span>{networkData.nodes.filter(n => n.type === "Client").length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Conexões:</span>
                  <span>{networkData.links.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium mb-2">Legenda</h3>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(icons).map(([type, icon]) => (
                  <div key={type} className="flex items-center gap-2">
                    <div 
                      className="w-6 h-6 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: colors[type] }}
                    >
                      {React.cloneElement(icon, { className: "w-3 h-3 text-white" })}
                    </div>
                    <span className="text-sm">{type}</span>
                  </div>
                ))}
                <div className="flex items-center gap-2">
                  <div className="h-0.5 w-6 bg-blue-500"></div>
                  <span className="text-sm">Fibra drop</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1 w-6 bg-red-500"></div>
                  <span className="text-sm">Backbone</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}