import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {equipment ? "Editar Equipamento" : "Novo Equipamento"}
        </CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="router">Roteador</SelectItem>
                  <SelectItem value="switch">Switch</SelectItem>
                  <SelectItem value="ont">ONT</SelectItem>
                  <SelectItem value="olt">OLT</SelectItem>
                  <SelectItem value="radio">Rádio</SelectItem>
                  <SelectItem value="servidor">Servidor</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="model">Modelo</Label>
              <Input
                id="model"
                value={formData.model}
                onChange={(e) => handleChange("model", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ip_address">Endereço IP</Label>
              <Input
                id="ip_address"
                value={formData.ip_address}
                onChange={(e) => handleChange("ip_address", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mac_address">Endereço MAC</Label>
              <Input
                id="mac_address"
                value={formData.mac_address}
                onChange={(e) => handleChange("mac_address", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customer_id">Cliente</Label>
              <Select
                value={formData.customer_id}
                onValueChange={(value) => handleChange("customer_id", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um cliente (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>Nenhum</SelectItem>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Localização</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleChange("location", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleChange("status", value)}
              >
                <SelectTrigger>
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

            <div className="space-y-2">
              <Label htmlFor="installation_date">Data de Instalação</Label>
              <Input
                id="installation_date"
                type="date"
                value={formData.installation_date}
                onChange={(e) => handleChange("installation_date", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" className="bg-blue-600">
            {equipment ? "Salvar Alterações" : "Cadastrar Equipamento"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}