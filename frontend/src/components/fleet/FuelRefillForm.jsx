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
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";

export default function FuelRefillForm({ refill, onSubmit, vehicles = [], drivers = [] }) {
  const [formData, setFormData] = useState({
    vehicle_id: refill?.vehicle_id || "",
    date: refill?.date ? new Date(refill.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    time: refill?.date ? new Date(refill.date).toTimeString().substring(0, 5) : new Date().toTimeString().substring(0, 5),
    odometer: refill?.odometer || "",
    liters: refill?.liters || "",
    total_cost: refill?.total_cost || "",
    fuel_type: refill?.fuel_type || "gasolina",
    full_tank: refill?.full_tank !== undefined ? refill.full_tank : true,
    gas_station: refill?.gas_station || "",
    location: refill?.location || "",
    driver_id: refill?.driver_id || "",
    notes: refill?.notes || ""
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
    
    if (!formData.vehicle_id) {
      newErrors.vehicle_id = "Veículo é obrigatório";
    }
    
    if (!formData.date) {
      newErrors.date = "Data é obrigatória";
    }
    
    if (!formData.odometer) {
      newErrors.odometer = "Hodômetro é obrigatório";
    } else if (isNaN(formData.odometer) || Number(formData.odometer) <= 0) {
      newErrors.odometer = "Valor inválido";
    }
    
    if (!formData.liters) {
      newErrors.liters = "Quantidade é obrigatória";
    } else if (isNaN(formData.liters) || Number(formData.liters) <= 0) {
      newErrors.liters = "Valor inválido";
    }
    
    if (!formData.total_cost) {
      newErrors.total_cost = "Valor total é obrigatório";
    } else if (isNaN(formData.total_cost) || Number(formData.total_cost) <= 0) {
      newErrors.total_cost = "Valor inválido";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Combine date and time
      const dateTime = new Date(`${formData.date}T${formData.time}`);
      
      // Convert numeric fields
      const data = {
        ...formData,
        date: dateTime.toISOString(),
        odometer: Number(formData.odometer),
        liters: Number(formData.liters),
        total_cost: Number(formData.total_cost)
      };
      
      // Remove time field as it's now part of date
      delete data.time;
      
      onSubmit(data);
    }
  };

  const getLiterPrice = () => {
    if (formData.liters && formData.total_cost) {
      const liters = parseFloat(formData.liters);
      const total = parseFloat(formData.total_cost);
      if (liters > 0 && total > 0) {
        return (total / liters).toFixed(3);
      }
    }
    return "0.000";
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="vehicle_id">
              Veículo <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.vehicle_id}
              onValueChange={(value) => handleChange("vehicle_id", value)}
            >
              <SelectTrigger id="vehicle_id" className={errors.vehicle_id ? "border-red-500" : ""}>
                <SelectValue placeholder="Selecione o veículo" />
              </SelectTrigger>
              <SelectContent>
                {vehicles.map((vehicle) => (
                  <SelectItem key={vehicle.id} value={vehicle.id}>
                    {vehicle.model} ({vehicle.plate})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.vehicle_id && (
              <p className="text-sm text-red-500">{errors.vehicle_id}</p>
            )}
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
                <SelectItem value={null}>Não informado</SelectItem>
                {drivers.map((driver) => (
                  <SelectItem key={driver.id} value={driver.id}>
                    {driver.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="date">
              Data <span className="text-red-500">*</span>
            </Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => handleChange("date", e.target.value)}
              className={errors.date ? "border-red-500" : ""}
            />
            {errors.date && (
              <p className="text-sm text-red-500">{errors.date}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="time">Hora</Label>
            <Input
              id="time"
              type="time"
              value={formData.time}
              onChange={(e) => handleChange("time", e.target.value)}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="odometer">
              Hodômetro (km) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="odometer"
              type="number"
              value={formData.odometer}
              onChange={(e) => handleChange("odometer", e.target.value)}
              placeholder="Ex: 12345"
              className={errors.odometer ? "border-red-500" : ""}
            />
            {errors.odometer && (
              <p className="text-sm text-red-500">{errors.odometer}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="fuel_type">
              Tipo de Combustível <span className="text-red-500">*</span>
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
                <SelectItem value="gnv">GNV</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="liters">
              Litros <span className="text-red-500">*</span>
            </Label>
            <Input
              id="liters"
              type="number"
              step="0.01"
              value={formData.liters}
              onChange={(e) => handleChange("liters", e.target.value)}
              placeholder="Ex: 40.5"
              className={errors.liters ? "border-red-500" : ""}
            />
            {errors.liters && (
              <p className="text-sm text-red-500">{errors.liters}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="total_cost">
              Valor Total (R$) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="total_cost"
              type="number"
              step="0.01"
              value={formData.total_cost}
              onChange={(e) => handleChange("total_cost", e.target.value)}
              placeholder="Ex: 215.75"
              className={errors.total_cost ? "border-red-500" : ""}
            />
            {errors.total_cost && (
              <p className="text-sm text-red-500">{errors.total_cost}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="price_per_liter">Preço por Litro (R$)</Label>
            <Input
              id="price_per_liter"
              type="text"
              value={`R$ ${getLiterPrice()}`}
              disabled
              className="bg-gray-50 dark:bg-gray-700"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="gas_station">Posto de Combustível</Label>
            <Input
              id="gas_station"
              value={formData.gas_station}
              onChange={(e) => handleChange("gas_station", e.target.value)}
              placeholder="Ex: Posto Ipiranga"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="location">Localização</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => handleChange("location", e.target.value)}
              placeholder="Ex: Av. Principal, 123"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox
            id="full_tank"
            checked={formData.full_tank}
            onCheckedChange={(checked) => handleChange("full_tank", checked)}
          />
          <Label htmlFor="full_tank" className="cursor-pointer">
            Tanque Completo
          </Label>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="notes">Observações</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => handleChange("notes", e.target.value)}
            placeholder="Informações adicionais sobre o abastecimento..."
            rows={2}
          />
        </div>
      </div>

      <DialogFooter>
        <Button type="submit">
          {refill ? "Salvar Alterações" : "Registrar Abastecimento"}
        </Button>
      </DialogFooter>
    </form>
  );
}