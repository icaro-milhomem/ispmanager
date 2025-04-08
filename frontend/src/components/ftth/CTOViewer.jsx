import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Pencil, Plus, Wifi, WifiOff, AlertTriangle } from "lucide-react";

export default function CTOViewer({ 
  ctos = [], 
  selectedCTO,
  onCTOSelect, 
  onCTOEdit,
  onAddClient
}) {
  // Buscar a CTO mais próxima da localização atual
  const findNearestCTO = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(function(position) {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        
        // Calcular distância para cada CTO
        const ctosWithDistance = ctos.map(cto => {
          const distance = calculateDistance(
            { lat: userLat, lng: userLng },
            cto.position
          );
          return { ...cto, distance };
        });
        
        // Ordenar por distância e selecionar a primeira
        const nearest = [...ctosWithDistance].sort((a, b) => a.distance - b.distance)[0];
        
        if (nearest) {
          onCTOSelect(nearest);
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
  
  // Calcular distância entre dois pontos
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
  
  if (!selectedCTO) return null;
  
  // Informações da CTO selecionada
  const ports = selectedCTO.ports || [];
  const totalPorts = selectedCTO.properties?.capacity || 0;
  const usedPorts = ports.length;
  const availablePorts = totalPorts - usedPorts;
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold">{selectedCTO.name}</h2>
            <Badge>{totalPorts} portas</Badge>
          </div>
          <p className="text-gray-500 flex items-center gap-1 mt-1">
            <MapPin className="w-4 h-4" />
            {selectedCTO.properties?.address || "Sem endereço"}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={findNearestCTO}>
            <MapPin className="w-4 h-4 mr-2" />
            Buscar Próxima
          </Button>
          <Button variant="outline" onClick={() => onCTOEdit(selectedCTO)}>
            <Pencil className="w-4 h-4 mr-2" />
            Editar
          </Button>
        </div>
      </div>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-medium">Portas disponíveis</h3>
              <p className="text-sm text-gray-500">
                {usedPorts} de {totalPorts} portas em uso ({availablePorts} disponíveis)
              </p>
            </div>
            <Button 
              size="sm" 
              disabled={usedPorts >= totalPorts}
              onClick={() => onAddClient(selectedCTO)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Cliente
            </Button>
          </div>
          
          <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
            {Array.from({ length: totalPorts }, (_, i) => {
              const portNumber = i + 1;
              const port = ports.find(p => p.number === portNumber);
              const status = port?.status || 'empty';
              
              return (
                <div 
                  key={portNumber}
                  className={`p-2 border rounded-md flex flex-col items-center ${
                    status === 'active' ? 'border-green-500 bg-green-50' : 
                    status === 'blocked' ? 'border-red-500 bg-red-50' : 
                    'border-gray-200 bg-gray-50'
                  }`}
                >
                  <span className="text-sm font-medium">P{portNumber}</span>
                  {status === 'active' && <Wifi className="w-4 h-4 text-green-500 mt-1" />}
                  {status === 'blocked' && <AlertTriangle className="w-4 h-4 text-red-500 mt-1" />}
                  {status === 'empty' && <WifiOff className="w-4 h-4 text-gray-300 mt-1" />}
                  
                  {port?.client_name && (
                    <span className="text-xs mt-1 text-center truncate w-full" title={port.client_name}>
                      {port.client_name}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
      
      {selectedCTO.properties?.notes && (
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium mb-2">Observações</h3>
            <p className="text-sm text-gray-600">{selectedCTO.properties.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}