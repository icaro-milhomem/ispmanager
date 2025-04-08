import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Trash } from "lucide-react";

export default function CTOForm({ cto, onSubmit, onCancel, onDelete }) {
  const [formData, setFormData] = useState(cto || {
    name: "",
    position: { lat: 0, lng: 0 },
    properties: {
      capacity: 16,
      address: "",
      notes: ""
    }
  });
  
  const [showLocationError, setShowLocationError] = useState(false);

  const handleChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [field]: value
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Verificar se a posição está definida
    if (formData.position.lat === 0 && formData.position.lng === 0) {
      setShowLocationError(true);
      return;
    }
    
    onSubmit(formData);
  };
  
  const getCurrentLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(function(position) {
        handleChange('position', { 
          lat: position.coords.latitude, 
          lng: position.coords.longitude 
        });
        setShowLocationError(false);
      }, function(error) {
        alert("Erro ao obter localização: " + error.message);
      });
    } else {
      alert("Geolocalização não disponível neste navegador.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome da CTO</Label>
          <Input
            id="name"
            placeholder="Ex: CTO-001"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="properties.capacity">Capacidade (Número de Portas)</Label>
          <Select
            value={formData.properties.capacity.toString()}
            onValueChange={(value) => handleChange('properties.capacity', parseInt(value))}
          >
            <SelectTrigger id="properties.capacity">
              <SelectValue placeholder="Selecione a capacidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2">2 portas</SelectItem>
              <SelectItem value="4">4 portas</SelectItem>
              <SelectItem value="8">8 portas</SelectItem>
              <SelectItem value="16">16 portas</SelectItem>
              <SelectItem value="32">32 portas</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="properties.address">Endereço</Label>
          <Input
            id="properties.address"
            placeholder="Ex: Rua A, 123 - Centro"
            value={formData.properties.address}
            onChange={(e) => handleChange('properties.address', e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="location">Localização</Label>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={getCurrentLocation}
              className="text-xs h-8"
            >
              <MapPin className="w-3 h-3 mr-1" />
              Usar localização atual
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Latitude</Label>
              <Input
                value={formData.position.lat}
                onChange={(e) => handleChange('position', { 
                  ...formData.position, 
                  lat: parseFloat(e.target.value) 
                })}
                type="number"
                step="any"
              />
            </div>
            <div>
              <Label className="text-xs">Longitude</Label>
              <Input
                value={formData.position.lng}
                onChange={(e) => handleChange('position', { 
                  ...formData.position, 
                  lng: parseFloat(e.target.value) 
                })}
                type="number"
                step="any"
              />
            </div>
          </div>
          
          {showLocationError && (
            <p className="text-sm text-red-500">
              É necessário definir a localização da CTO.
            </p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="properties.notes">Observações</Label>
          <Textarea
            id="properties.notes"
            placeholder="Informações adicionais sobre esta CTO..."
            value={formData.properties.notes}
            onChange={(e) => handleChange('properties.notes', e.target.value)}
            rows={3}
          />
        </div>
      </div>
      
      <div className="flex justify-between mt-6">
        <div>
          {onDelete && (
            <Button 
              type="button" 
              variant="destructive" 
              onClick={onDelete}
            >
              <Trash className="w-4 h-4 mr-2" />
              Excluir
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit">
            {cto ? "Atualizar CTO" : "Criar CTO"}
          </Button>
        </div>
      </div>
    </form>
  );
}