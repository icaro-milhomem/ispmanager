import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon } from "lucide-react";

export default function ContractForm({ 
  contract, 
  customers, 
  templates, 
  onSubmit, 
  onCancel,
  selectedTemplate 
}) {
  const generateContractNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 9000) + 1000;
    return `${year}${month}-${random}`;
  };

  const [formData, setFormData] = useState(
    contract || {
      customer_id: "",
      contract_number: generateContractNumber(),
      template_id: selectedTemplate ? selectedTemplate.id : "",
      status: "draft",
      created_date: new Date().toISOString(),
      signed_date: null,
      expiration_date: null,
      pdf_url: "",
      custom_fields: {}
    }
  );

  useEffect(() => {
    if (selectedTemplate && !contract) {
      setFormData(prev => ({
        ...prev,
        template_id: selectedTemplate.id
      }));
    }
  }, [selectedTemplate, contract]);

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

  const [selectedCustomer, setSelectedCustomer] = useState(null);

  useEffect(() => {
    if (formData.customer_id) {
      const customer = customers.find(c => c.id === formData.customer_id);
      setSelectedCustomer(customer);
    }
  }, [formData.customer_id, customers]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {contract ? "Editar Contrato" : "Novo Contrato"}
        </CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="customer_id">Cliente</Label>
              <Select
                value={formData.customer_id}
                onValueChange={(value) => handleChange("customer_id", value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um cliente" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="contract_number">Número do Contrato</Label>
              <Input
                id="contract_number"
                value={formData.contract_number}
                onChange={(e) => handleChange("contract_number", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="template_id">Modelo de Contrato</Label>
              <Select
                value={formData.template_id}
                onValueChange={(value) => handleChange("template_id", value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um modelo" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleChange("status", value)}
                required
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Rascunho</SelectItem>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="expired">Expirado</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Data de Assinatura</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.signed_date ? (
                      format(new Date(formData.signed_date), "PPP")
                    ) : (
                      <span>Selecione uma data</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.signed_date ? new Date(formData.signed_date) : undefined}
                    onSelect={(date) => 
                      handleChange("signed_date", date ? date.toISOString() : null)
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>Data de Expiração</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.expiration_date ? (
                      format(new Date(formData.expiration_date), "PPP")
                    ) : (
                      <span>Selecione uma data</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.expiration_date ? new Date(formData.expiration_date) : undefined}
                    onSelect={(date) => 
                      handleChange("expiration_date", date ? date.toISOString() : null)
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {selectedCustomer && (
            <div className="border p-4 rounded-md bg-blue-50 mt-4">
              <h3 className="font-medium mb-2">Dados do Cliente Selecionado</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Nome:</strong> {selectedCustomer.full_name}
                </div>
                <div>
                  <strong>CPF:</strong> {selectedCustomer.cpf}
                </div>
                <div>
                  <strong>Endereço:</strong> {selectedCustomer.address}
                </div>
                <div>
                  <strong>Telefone:</strong> {selectedCustomer.phone}
                </div>
                <div>
                  <strong>Email:</strong> {selectedCustomer.email}
                </div>
                <div>
                  <strong>Plano:</strong> {
                    selectedCustomer.plan === "basic" ? "Básico" :
                    selectedCustomer.plan === "standard" ? "Padrão" :
                    selectedCustomer.plan === "premium" ? "Premium" :
                    selectedCustomer.plan === "enterprise" ? "Empresarial" : 
                    selectedCustomer.plan
                  }
                </div>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" className="bg-blue-600">
            {contract ? "Atualizar" : "Criar"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}