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
import { Cable } from "lucide-react";

export default function FiberConnectionForm({
  sourceElement,
  targetElement,
  connectionType,
  cableTypes,
  onSave,
  onCancel
}) {
  const [formData, setFormData] = useState({
    source: sourceElement,
    target: targetElement,
    type: connectionType,
    fibers: cableTypes[connectionType]?.capacity || 1,
    notes: ""
  });

  const handleChange = (field, value) => {
    if (field === 'type') {
      setFormData({
        ...formData,
        type: value,
        fibers: cableTypes[value]?.capacity || 1
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
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4 py-4">
        <div className="flex items-center gap-4">
          <div className="w-full bg-gray-100 p-3 rounded-md">
            <Label className="text-xs">Origem</Label>
            <p className="font-medium">{sourceElement.name}</p>
            <p className="text-sm text-gray-500">{sourceElement.type}</p>
          </div>
          <Cable className="w-5 h-5 text-gray-400" />
          <div className="w-full bg-gray-100 p-3 rounded-md">
            <Label className="text-xs">Destino</Label>
            <p className="font-medium">{targetElement.name}</p>
            <p className="text-sm text-gray-500">{targetElement.type}</p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">Tipo de Cabo</Label>
          <Select
            id="type"
            value={formData.type}
            onValueChange={(value) => handleChange('type', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(cableTypes).map(([key, value]) => (
                <SelectItem key={key} value={key}>
                  {value.name} ({value.capacity} fibras)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="fibers">Número de Fibras</Label>
          <Input
            id="fibers"
            type="number"
            min="1"
            value={formData.fibers}
            onChange={(e) => handleChange('fibers', parseInt(e.target.value))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Observações</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            placeholder="Adicione informações sobre este cabo..."
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          Salvar Conexão
        </Button>
      </div>
    </form>
  );
}