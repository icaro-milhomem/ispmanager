import React, { useState, useEffect, useRef } from 'react';
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Network,
  Router,
  Layers,
  Wifi,
  Radio,
  Monitor,
  Settings,
  Zap,
  User
} from "lucide-react";

// Ícones para os diferentes tipos de equipamentos
const typeIcons = {
  router: Router,
  switch: Layers,
  ont: Wifi,
  radio: Radio,
  servidor: Monitor,
  outro: Settings
};

export default function NetworkMap({ equipment }) {
  const svgRef = useRef(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  
  // Determina as dimensões do contêiner
  useEffect(() => {
    if (svgRef.current) {
      const { width, height } = svgRef.current.getBoundingClientRect();
      setDimensions({ width, height });
    }
  }, []);
  
  // Organiza os equipamentos em grupos para visualização
  const organizeEquipment = () => {
    // Criar categorias de equipamentos
    const categories = {
      core: equipment.filter(e => e.type === 'router'),
      distribution: equipment.filter(e => e.type === 'switch'),
      access: equipment.filter(e => e.type === 'ont' || e.type === 'radio'),
      other: equipment.filter(e => !['router', 'switch', 'ont', 'radio'].includes(e.type))
    };
    
    return categories;
  };
  
  const categories = organizeEquipment();
  
  // Função para obter a cor com base no status
  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return '#10B981';
      case 'offline': return '#EF4444';
      case 'manutenção': return '#F59E0B';
      default: return '#94A3B8';
    }
  };
  
  // Renderiza informações do nó selecionado
  const renderNodeInfo = () => {
    if (!selectedNode) return null;
    
    const IconComponent = typeIcons[selectedNode.type] || Settings;
    
    return (
      <div className="absolute bottom-4 left-4 right-4 bg-white p-4 rounded-lg shadow-lg border border-gray-200 z-10">
        <div className="flex items-center gap-3 mb-2">
          <div className={`p-2 rounded-full ${selectedNode.status === 'online' ? 'bg-green-100' : 'bg-gray-100'}`}>
            <IconComponent className={`w-4 h-4 ${selectedNode.status === 'online' ? 'text-green-600' : 'text-gray-600'}`} />
          </div>
          <div>
            <h4 className="font-medium">{selectedNode.name}</h4>
            <p className="text-xs text-gray-500">{selectedNode.ip_address}</p>
          </div>
          <Badge className={`ml-auto ${selectedNode.status === 'online' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {selectedNode.status}
          </Badge>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-gray-500">Modelo:</span> {selectedNode.model || "N/A"}
          </div>
          <div>
            <span className="text-gray-500">Local:</span> {selectedNode.location || "N/A"}
          </div>
        </div>
        <Link
          to={createPageUrl("Equipment")}
          className="text-xs text-blue-600 hover:underline block mt-2"
        >
          Ver detalhes
        </Link>
      </div>
    );
  };
  
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Network className="w-5 h-5 text-blue-600" />
          Mapa da Rede
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 relative">
        <div className="relative h-96 w-full overflow-hidden" ref={svgRef}>
          {/* Fundo do mapa */}
          <div className="absolute inset-0 bg-gray-50 border-t">
            {/* Linhas de conexão */}
            <svg width="100%" height="100%" className="absolute inset-0">
              {/* Conexões entre equipamentos */}
              {categories.core.map((core) => (
                categories.distribution.map((dist) => (
                  <line 
                    key={`${core.id}-${dist.id}`}
                    x1={dimensions.width / 2} 
                    y1={80}
                    x2={dimensions.width / 3 + Math.random() * 100} 
                    y2={160}
                    stroke="#CBD5E1"
                    strokeWidth="1"
                    strokeDasharray="5,5"
                  />
                ))
              ))}
              
              {categories.distribution.map((dist, idx) => (
                categories.access.map((access, accessIdx) => (
                  <line 
                    key={`${dist.id}-${access.id}`}
                    x1={dimensions.width / 3 + (idx % 3) * 100} 
                    y1={160}
                    x2={100 + accessIdx * 80} 
                    y2={240}
                    stroke="#CBD5E1"
                    strokeWidth="1"
                    strokeDasharray="5,5"
                  />
                ))
              ))}
            </svg>
            
            {/* Core Layer (Roteadores) */}
            <div className="absolute top-16 left-0 right-0 flex justify-center gap-6">
              {categories.core.map((item) => {
                const IconComponent = typeIcons[item.type] || Settings;
                return (
                  <div 
                    key={item.id}
                    className="flex flex-col items-center cursor-pointer"
                    onClick={() => setSelectedNode(item)}
                  >
                    <div 
                      className="relative w-12 h-12 rounded-full flex items-center justify-center shadow-md border-2"
                      style={{ 
                        backgroundColor: 'white',
                        borderColor: getStatusColor(item.status)
                      }}
                    >
                      <IconComponent className="w-6 h-6 text-gray-700" />
                      <div 
                        className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white"
                        style={{ backgroundColor: getStatusColor(item.status) }}
                      ></div>
                    </div>
                    <div className="text-xs font-medium mt-1 text-center">{item.name}</div>
                  </div>
                );
              })}
              
              {categories.core.length === 0 && (
                <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-100">
                  <div className="text-xs text-gray-500">Sem equipamentos core</div>
                </div>
              )}
            </div>
            
            {/* Distribution Layer (Switches) */}
            <div className="absolute top-32 left-0 right-0 flex justify-around px-6">
              {categories.distribution.map((item) => {
                const IconComponent = typeIcons[item.type] || Settings;
                return (
                  <div 
                    key={item.id}
                    className="flex flex-col items-center cursor-pointer"
                    onClick={() => setSelectedNode(item)}
                  >
                    <div 
                      className="relative w-10 h-10 rounded-full flex items-center justify-center shadow-md border-2"
                      style={{ 
                        backgroundColor: 'white',
                        borderColor: getStatusColor(item.status)
                      }}
                    >
                      <IconComponent className="w-5 h-5 text-gray-700" />
                      <div 
                        className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white"
                        style={{ backgroundColor: getStatusColor(item.status) }}
                      ></div>
                    </div>
                    <div className="text-xs font-medium mt-1 text-center">{item.name}</div>
                  </div>
                );
              })}
              
              {categories.distribution.length === 0 && (
                <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-100">
                  <div className="text-xs text-gray-500">Sem switches</div>
                </div>
              )}
            </div>
            
            {/* Access Layer (ONTs, Rádios) */}
            <div className="absolute top-48 left-0 right-0 flex justify-around px-6">
              {categories.access.map((item) => {
                const IconComponent = typeIcons[item.type] || Settings;
                return (
                  <div 
                    key={item.id}
                    className="flex flex-col items-center cursor-pointer"
                    onClick={() => setSelectedNode(item)}
                  >
                    <div 
                      className="relative w-8 h-8 rounded-full flex items-center justify-center shadow-md border-2"
                      style={{ 
                        backgroundColor: 'white',
                        borderColor: getStatusColor(item.status)
                      }}
                    >
                      <IconComponent className="w-4 h-4 text-gray-700" />
                      <div 
                        className="absolute bottom-0 right-0 w-2 h-2 rounded-full border-2 border-white"
                        style={{ backgroundColor: getStatusColor(item.status) }}
                      ></div>
                    </div>
                    <div className="text-xs font-medium mt-1 text-center">{item.name}</div>
                  </div>
                );
              })}
              
              {categories.access.length === 0 && (
                <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-100">
                  <div className="text-xs text-gray-500">Sem equipamentos de acesso</div>
                </div>
              )}
            </div>
          </div>
        </div>
        {renderNodeInfo()}
      </CardContent>
    </Card>
  );
}