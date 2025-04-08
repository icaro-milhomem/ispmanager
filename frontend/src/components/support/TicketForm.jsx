import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { SupportTicket } from "@/api/entities";
import { Customer } from "@/api/entities";
import { MessageSquare, Save, X, FileText } from "lucide-react";

export default function TicketForm({ ticket, customers, onSubmit, onCancel }) {
  const [ticketData, setTicketData] = useState({
    title: "",
    customer_id: "",
    description: "",
    status: "aberto",
    priority: "média",
    category: "técnico",
    assigned_to: "",
    resolution: "",
    is_service_order: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (ticket) {
      setTicketData(ticket);
    }
  }, [ticket]);

  const handleChange = (field, value) => {
    setTicketData({
      ...ticketData,
      [field]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onSubmit(ticketData);
    } catch (error) {
      console.error("Erro ao enviar formulário:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const priorityLabels = {
    baixa: "Baixa",
    média: "Média",
    alta: "Alta",
    crítica: "Crítica"
  };

  const categoryLabels = {
    conexão: "Conexão",
    financeiro: "Financeiro",
    técnico: "Técnico",
    comercial: "Comercial",
    outros: "Outros"
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {ticketData.is_service_order ? (
            <FileText className="h-5 w-5 text-blue-600" />
          ) : (
            <MessageSquare className="h-5 w-5 text-blue-600" />
          )}
          {ticket ? "Editar Chamado" : (ticketData.is_service_order ? "Nova Ordem de Serviço" : "Novo Chamado")}
        </CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2 mb-2">
            <Checkbox
              id="is_service_order"
              checked={ticketData.is_service_order}
              onCheckedChange={(checked) => handleChange("is_service_order", checked)}
            />
            <Label
              htmlFor="is_service_order"
              className="text-sm font-medium leading-none"
            >
              Este é uma Ordem de Serviço
            </Label>
          </div>
          
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {!ticketData.is_service_order && (
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="title">Título <span className="text-red-500">*</span></Label>
                <Input
                  id="title"
                  placeholder="Título do chamado"
                  value={ticketData.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  required
                  disabled={ticketData.is_service_order}
                />
              </div>
            )}
            
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="customer_id">Cliente <span className="text-red-500">*</span></Label>
              <Select
                value={ticketData.customer_id}
                onValueChange={(value) => handleChange("customer_id", value)}
                required
              >
                <SelectTrigger id="customer_id">
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
              <Label htmlFor="priority">Prioridade</Label>
              <Select
                value={ticketData.priority}
                onValueChange={(value) => handleChange("priority", value)}
              >
                <SelectTrigger id="priority">
                  <SelectValue placeholder="Selecione a prioridade" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(priorityLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Select
                value={ticketData.category}
                onValueChange={(value) => handleChange("category", value)}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(categoryLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Descrição <span className="text-red-500">*</span></Label>
              <Textarea
                id="description"
                placeholder="Descreva o problema ou solicitação detalhadamente..."
                value={ticketData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                required
                rows={5}
              />
            </div>
            
            {ticket && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={ticketData.status}
                    onValueChange={(value) => handleChange("status", value)}
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="aberto">Aberto</SelectItem>
                      <SelectItem value="em_andamento">Em Andamento</SelectItem>
                      <SelectItem value="pendente">Pendente</SelectItem>
                      <SelectItem value="resolvido">Resolvido</SelectItem>
                      <SelectItem value="cancelado">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="assigned_to">Técnico Responsável</Label>
                  <Input
                    id="assigned_to"
                    placeholder="Nome do técnico responsável"
                    value={ticketData.assigned_to}
                    onChange={(e) => handleChange("assigned_to", e.target.value)}
                  />
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="resolution">Resolução</Label>
                  <Textarea
                    id="resolution"
                    placeholder="Descreva a resolução ou andamento do chamado..."
                    value={ticketData.resolution}
                    onChange={(e) => handleChange("resolution", e.target.value)}
                    rows={5}
                  />
                </div>
              </>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t p-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            <X className="mr-2 h-4 w-4" />
            Cancelar
          </Button>
          <Button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700"
            disabled={isSubmitting}
          >
            <Save className="mr-2 h-4 w-4" />
            {ticket ? "Atualizar" : "Salvar"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}