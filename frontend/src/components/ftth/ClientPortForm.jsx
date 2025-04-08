import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Save, X, User } from "lucide-react";

export default function ClientPortForm({ cto, onSave, onCancel }) {
  // Encontrar portas disponíveis
  const usedPortNumbers = (cto.ports || []).map(p => p.number);
  const availablePorts = Array.from(
    { length: cto.properties.capacity }, 
    (_, i) => i + 1
  ).filter(num => !usedPortNumbers.includes(num));

  const [formData, setFormData] = useState({
    portNumber: availablePorts[0] || 1,
    clientName: '',
    clientId: '',
    status: 'active'
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Criar objeto de porta para adicionar à CTO
    const newPort = {
      number: formData.portNumber,
      status: formData.status,
      client_name: formData.clientName,
      client_id: formData.clientId
    };
    
    // Atualizar portas da CTO
    const updatedPorts = [...(cto.ports || []), newPort];
    
    // Enviar CTO atualizada
    const updatedCTO = {
      ...cto,
      ports: updatedPorts
    };
    
    onSave(updatedCTO);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="text-center mb-4">
        <h3 className="text-lg font-medium">Adicionar Cliente à CTO: {cto.name}</h3>
        <p className="text-sm text-gray-500">Portas disponíveis: {availablePorts.length} de {cto.properties.capacity}</p>
      </div>
      
      {availablePorts.length === 0 ? (
        <div className="bg-yellow-50 p-4 rounded-md text-yellow-800 text-center">
          Todas as portas desta CTO estão em uso. Remova algum cliente ou escolha outra CTO.
        </div>
      ) : (
        <>
          <div className="space-y-2">
            <Label htmlFor="portNumber">Porta</Label>
            <Select 
              value={formData.portNumber.toString()} 
              onValueChange={(value) => handleChange('portNumber', parseInt(value, 10))}
            >
              <SelectTrigger id="portNumber">
                <SelectValue placeholder="Selecione a porta" />
              </SelectTrigger>
              <SelectContent>
                {availablePorts.map(port => (
                  <SelectItem key={port} value={port.toString()}>
                    Porta {port}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="clientName">Nome do Cliente</Label>
            <Input
              id="clientName"
              value={formData.clientName}
              onChange={(e) => handleChange('clientName', e.target.value)}
              placeholder="Nome completo do cliente"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="clientId">ID do Cliente</Label>
            <Input
              id="clientId"
              value={formData.clientId}
              onChange={(e) => handleChange('clientId', e.target.value)}
              placeholder="ID ou CPF do cliente"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select 
              value={formData.status} 
              onValueChange={(value) => handleChange('status', value)}
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="blocked">Bloqueado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button type="submit">
              <Save className="w-4 h-4 mr-2" />
              Salvar
            </Button>
          </div>
        </>
      )}
    </form>
  );
}