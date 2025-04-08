import React, { useState, useEffect } from "react";
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

export default function MileageLogForm({ log, onSubmit, vehicles = [], drivers = [] }) {
  const [formData, setFormData] = useState({
    vehicle_id: log?.vehicle_id || "",
    date: log?.date ? new Date(log.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    start_odometer: log?.start_odometer || "",
    end_odometer: log?.end_odometer || "",
    distance: log?.distance || "",
    driver_id: log?.driver_id || "",
    purpose: log?.purpose || "",
    route: log?.route || "",
    notes: log?.notes || ""
  });

  const [errors, setErrors] = useState({});
  
  useEffect(() => {
    // Auto-calculate distance when start and end odometer change
    if (formData.start_odometer && formData.end_odometer) {
      const start = parseFloat(formData.start_odometer);
      const end = parseFloat(formData.end_odometer);
      
      if (!isNaN(start) && !isNaN(end) && end >= start) {
        setFormData(prev => ({
          ...prev,
          distance: (end - start).toString()
        }));
      }
    }
  }, [formData.start_odometer, formData.end_odometer]);

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
    
    if (!formData.start_odometer) {
      newErrors.start_odometer = "Hodômetro inicial é obrigatório";
    } else if (isNaN(formData.start_odometer) || Number(formData.start_odometer) < 0) {
      newErrors.start_odometer = "Valor inválido";
    }
    
    if (!formData.end_odometer) {
      newErrors.end_odometer = "Hodômetro final é obrigatório";
    } else if (isNaN(formData.end_odometer) || Number(formData.end_odometer) < 0) {
      newErrors.end_odometer = "Valor inválido";
    }
    
    if (Number(formData.end_odometer) < Number(formData.start_odometer)) {
      newErrors.end_odometer = "Hodômetro final deve ser maior que o inicial";
    }
    
    if (!formData.distance) {
      newErrors.distance = "Distância é obrigatória";
    } else if (isNaN(formData.distance) || Number(formData.distance) <= 0) {
      newErrors.distance = "Valor inválido";
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
        start_odometer: Number(formData.start_odometer),
        end_odometer: Number(formData.end_odometer),
        distance: Number(formData.distance)
      };
      
      onSubmit(data);
    }
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
        </div>
        
        <div className="grid grid-cols-2 gap-4">
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
          
          <div className="space-y-2">
            <Label htmlFor="purpose">Finalidade</Label>
            <Input
              id="purpose"
              value={formData.purpose}
              onChange={(e) => handleChange("purpose", e.target.value)}
              placeholder="Ex: Visita ao cliente"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="start_odometer">
              Hodômetro Inicial (km) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="start_odometer"
              type="number"
              value={formData.start_odometer}
              onChange={(e) => handleChange("start_odometer", e.target.value)}
              placeholder="Ex: 12345"
              className={errors.start_odometer ? "border-red-500" : ""}
            />
            {errors.start_odometer && (
              <p className="text-sm text-red-500">{errors.start_odometer}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="end_odometer">
              Hodômetro Final (km) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="end_odometer"
              type="number"
              value={formData.end_odometer}
              onChange={(e) => handleChange("end_odometer", e.target.value)}
              placeholder="Ex: 12400"
              className={errors.end_odometer ? "border-red-500" : ""}
            />
            {errors.end_odometer && (
              <p className="text-sm text-red-500">{errors.end_odometer}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="distance">
              Distância Percorrida (km) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="distance"
              type="number"
              value={formData.distance}
              onChange={(e) => handleChange("distance", e.target.value)}
              className={errors.distance ? "border-red-500" : ""}
            />
            {errors.distance && (
              <p className="text-sm text-red-500">{errors.distance}</p>
            )}
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="route">Rota</Label>
          <Input
            id="route"
            value={formData.route}
            onChange={(e) => handleChange("route", e.target.value)}
            placeholder="Ex: Sede > Cliente A > Cliente B > Sede"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="notes">Observações</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => handleChange("notes", e.target.value)}
            placeholder="Informações adicionais sobre a viagem..."
            rows={2}
          />
        </div>
      </div>

      <DialogFooter>
        <Button type="submit">
          {log ? "Salvar Alterações" : "Registrar Quilometragem"}
        </Button>
      </DialogFooter>
    </form>
  );
}