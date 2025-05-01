import React, { useState } from "react";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Save, Loader2 } from "lucide-react";

export default function EquipmentForm({ equipment, customers, onSubmit, onCancel }) {
  const [formData, setFormData] = useState(
    equipment || {
      name: "",
      type: "router",
      model: "",
      ip_address: "",
      mac_address: "",
      location: "",
      customer_id: "",
      status: "online",
      installation_date: new Date().toISOString().split("T")[0],
      notes: ""
    }
  );
  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error("Erro ao salvar equipamento:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{equipment ? "Editar Equipamento" : "Novo Equipamento"}</DialogTitle>
        <DialogDescription>
          {equipment 
            ? "Edite as informações do equipamento existente" 
            : "Preencha as informações para cadastrar um novo equipamento"}
        </DialogDescription>
      </DialogHeader>
      
      <form onSubmit={handleSubmit}>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Equipamento</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type">Tipo</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleChange("type", value)}
              >
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="router">Roteador</SelectItem>
                  <SelectItem value="switch">Switch</SelectItem>
                  <SelectItem value="ap">Access Point</SelectItem>
                  <SelectItem value="onu">ONU</SelectItem>
                  <SelectItem value="server">Servidor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="model">Modelo</Label>
              <Input
                id="model"
                value={formData.model}
                onChange={(e) => handleChange("model", e.target.value)}
                placeholder="Modelo do equipamento"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="ip_address">Endereço IP</Label>
              <Input
                id="ip_address"
                value={formData.ip_address}
                onChange={(e) => handleChange("ip_address", e.target.value)}
                required
                placeholder="Ex: 192.168.1.1"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="mac_address">Endereço MAC</Label>
              <Input
                id="mac_address"
                value={formData.mac_address}
                onChange={(e) => handleChange("mac_address", e.target.value)}
                placeholder="Ex: AA:BB:CC:DD:EE:FF"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="customer_id">Cliente</Label>
              <Select
                value={formData.customer_id}
                onValueChange={(value) => handleChange("customer_id", value)}
              >
                <SelectTrigger id="customer_id">
                  <SelectValue placeholder="Selecione um cliente (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Nenhum</SelectItem>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Localização</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleChange("location", e.target.value)}
                placeholder="Localização física do equipamento"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleChange("status", value)}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="offline">Offline</SelectItem>
                  <SelectItem value="manutenção">Manutenção</SelectItem>
                  <SelectItem value="reserva">Reserva</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="installation_date">Data de Instalação</Label>
            <Input
              id="installation_date"
              type="date"
              value={formData.installation_date}
              onChange={(e) => handleChange("installation_date", e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              rows={3}
              placeholder="Observações e informações adicionais"
            />
          </div>
        </div>
        
        <div className="flex justify-end gap-3 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            Cancelar
          </Button>
          <Button 
            type="submit" 
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {equipment ? "Salvar" : "Cadastrar"}
              </>
            )}
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}