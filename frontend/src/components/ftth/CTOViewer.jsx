import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  Edit, 
  ChevronRight,
  Plus,
  AlertTriangle
} from "lucide-react";

export default function CTOViewer({ 
  selectedCTO, 
  onCTOEdit, 
  onAddClient,
  onCTOSelect,
  ctos 
}) {
  const nextCTO = ctos.find(cto => cto.id > selectedCTO.id);
  const capacity = parseInt(selectedCTO.capacity) || 16;
  const portsInUse = selectedCTO.ports?.length || 0;
  const availablePorts = capacity - portsInUse;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div>
          <h3 className="text-lg font-medium">{selectedCTO.name}</h3>
          <p className="text-sm text-gray-500 flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            {selectedCTO.address || "Sem endereço"}
          </p>
        </div>

        <div className="flex gap-2">
          <Badge variant="outline">
            {portsInUse} portas em uso
          </Badge>
          <Badge variant="outline" className={availablePorts === 0 ? "bg-red-50" : ""}>
            {availablePorts} portas disponíveis
          </Badge>
          <Badge variant="outline">
            Capacidade: {capacity}
          </Badge>
        </div>

        <div className="flex gap-2">
          {nextCTO && (
            <Button 
              variant="outline" 
              onClick={() => onCTOSelect(nextCTO)}
              className="flex items-center gap-2"
            >
              Buscar Próxima
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
          <Button 
            variant="outline"
            onClick={onCTOEdit}
            className="flex items-center gap-2"
          >
            <Edit className="w-4 h-4" />
            Editar
          </Button>
        </div>
      </div>

      <div>
        <h4 className="font-medium mb-2">Portas disponíveis</h4>
        <p className="text-sm text-gray-600">
          {portsInUse} de {capacity} portas em uso ({availablePorts} disponíveis)
        </p>
        
        {availablePorts > 0 ? (
          <div className="mt-4 grid grid-cols-8 gap-2">
            {Array.from({ length: capacity }, (_, i) => {
              const port = selectedCTO.ports?.find(p => p.number === i + 1);
              return (
                <div
                  key={i}
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-xs
                    ${port ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800 cursor-pointer hover:bg-gray-200'}
                  `}
                  onClick={() => !port && onAddClient && onAddClient(selectedCTO)}
                  title={port ? `${port.client_name || 'Cliente'} - Porta ${i + 1}` : `Porta ${i + 1} - Disponível`}
                >
                  {i + 1}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mt-4 flex items-center gap-2 text-yellow-600">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm">Não há portas disponíveis nesta CTO</span>
          </div>
        )}
      </div>
    </div>
  );
}