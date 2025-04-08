import React, { useState } from "react";
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
import { DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export default function VehicleForm({ vehicle, onSubmit, drivers = [] }) {
  const [formData, setFormData] = useState({
    model: vehicle?.model || "",
    plate: vehicle?.plate || "",
    year: vehicle?.year || new Date().getFullYear(),
    type: vehicle?.type || "carro",
    fuel_type: vehicle?.fuel_type || "gasolina",
    tank_capacity: vehicle?.tank_capacity || "",
    notes: vehicle?.notes || "",
    status: vehicle?.status || "ativo",
    driver_id: vehicle?.driver_id || ""
  });

  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when field is updated
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.model.trim()) {
      newErrors.model = "Modelo é obrigatório";
    }
    
    if (!formData.plate.trim()) {
      newErrors.plate = "Placa é obrigatória";
    } else if (!/^[A-Za-z0-9]{7}$/.test(formData.plate.replace(/[^A-Za-z0-9]/g, ''))) {
      newErrors.plate = "Formato de placa inválido";
    }
    
    if (!formData.year) {
      newErrors.year = "Ano é obrigatório";
    } else if (formData.year < 1900 || formData.year > new Date().getFullYear() + 1) {
      newErrors.year = "Ano inválido";
    }
    
    if (formData.tank_capacity && (isNaN(formData.tank_capacity) || formData.tank_capacity <= 0)) {
      newErrors.tank_capacity = "Capacidade deve ser um número positivo";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Convert numeric fields
      const data = {
        ...formData,
        year: Number(formData.year),
        tank_capacity: formData.tank_capacity ? Number(formData.tank_capacity) : undefined
      };
      
      onSubmit(data);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="model">
              Modelo <span className="text-red-500">*</span>
            </Label>
            <Input
              id="model"
              value={formData.model}
              onChange={(e) => handleChange("model", e.target.value)}
              placeholder="Ex: Fiat Strada"
              className={errors.model ? "border-red-500" : ""}
            />
            {errors.model && (
              <p className="text-sm text-red-500">{errors.model}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="plate">
              Placa <span className="text-red-500">*</span>
            </Label>
            <Input
              id="plate"
              value={formData.plate}
              onChange={(e) => handleChange("plate", e.target.value.toUpperCase())}
              placeholder="Ex: ABC1234"
              className={errors.plate ? "border-red-500" : ""}
            />
            {errors.plate && (
              <p className="text-sm text-red-500">{errors.plate}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="year">
              Ano <span className="text-red-500">*</span>
            </Label>
            <Input
              id="year"
              type="number"
              value={formData.year}
              onChange={(e) => handleChange("year", e.target.value)}
              className={errors.year ? "border-red-500" : ""}
            />
            {errors.year && (
              <p className="text-sm text-red-500">{errors.year}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Tipo</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => handleChange("type", value)}
            >
              <SelectTrigger id="type">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="carro">Carro</SelectItem>
                <SelectItem value="moto">Moto</SelectItem>
                <SelectItem value="caminhão">Caminhão</SelectItem>
                <SelectItem value="van">Van</SelectItem>
                <SelectItem value="ônibus">Ônibus</SelectItem>
                <SelectItem value="outro">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="fuel_type">
              Combustível <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.fuel_type}
              onValueChange={(value) => handleChange("fuel_type", value)}
            >
              <SelectTrigger id="fuel_type">
                <SelectValue placeholder="Selecione o combustível" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gasolina">Gasolina</SelectItem>
                <SelectItem value="etanol">Etanol</SelectItem>
                <SelectItem value="diesel">Diesel</SelectItem>
                <SelectItem value="flex">Flex</SelectItem>
                <SelectItem value="gnv">GNV</SelectItem>
                <SelectItem value="elétrico">Elétrico</SelectItem>
                <SelectItem value="híbrido">Híbrido</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tank_capacity">Capacidade do Tanque (litros)</Label>
            <Input
              id="tank_capacity"
              type="number"
              value={formData.tank_capacity}
              onChange={(e) => handleChange("tank_capacity", e.target.value)}
              placeholder="Ex: 50"
              className={errors.tank_capacity ? "border-red-500" : ""}
            />
            {errors.tank_capacity && (
              <p className="text-sm text-red-500">{errors.tank_capacity}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => handleChange("status", value)}
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ativo">Ativo</SelectItem>
                <SelectItem value="inativo">Inativo</SelectItem>
                <SelectItem value="manutenção">Em Manutenção</SelectItem>
                <SelectItem value="vendido">Vendido</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="driver_id">Motorista</Label>
            <Select
              value={formData.driver_id}
              onValueChange={(value) => handleChange("driver_id", value)}
            >
              <SelectTrigger id="driver_id">
                <SelectValue placeholder="Selecione o motorista" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={null}>Sem motorista</SelectItem>
                {drivers.map((driver) => (
                  <SelectItem key={driver.id} value={driver.id}>
                    {driver.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Observações</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => handleChange("notes", e.target.value)}
            placeholder="Informações adicionais sobre o veículo..."
            rows={3}
          />
        </div>
      </div>

      <DialogFooter>
        <Button type="submit">
          {vehicle ? "Salvar Alterações" : "Adicionar Veículo"}
        </Button>
      </DialogFooter>
    </form>
  );
}